import { Ai } from '@cloudflare/ai';

export interface Env {
	AI: Ai;
	KV_BINDING: KVNamespace;
	PROJECT_FILES: R2Bucket;
	DB: D1Database;           // ← D1 Database Added
}

/**
 * FlyTripVisa AI - Production Ready Worker with D1
 * Account ID: b73b80fa62deef032d3c08248cf2f30b
 */

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/chat' && request.method === 'POST') {
			return handleChat(request, env);
		}

		if (url.pathname.startsWith('/api/files/')) {
			return handleFileOperations(request, env);
		}

		// Optional: D1 test endpoint
		if (url.pathname === '/api/db-test') {
			return handleDbTest(env);
		}

		return env.ASSETS.fetch(request);
	},
};

// ====================== D1 Test Endpoint ======================
async function handleDbTest(env: Env): Promise<Response> {
	try {
		await env.DB.exec("CREATE TABLE IF NOT EXISTS chat_logs (id INTEGER PRIMARY KEY, timestamp TEXT, user_message TEXT, ai_response TEXT);");
		const result = await env.DB.prepare("SELECT COUNT(*) as count FROM chat_logs").first();
		return Response.json({ success: true, message: "D1 Database is working", total_logs: result?.count });
	} catch (e) {
		return Response.json({ error: "D1 Error", details: e.message }, { status: 500 });
	}
}

// ====================== ফাইল অপারেশন API ======================
async function handleFileOperations(request: Request, env: Env): Promise<Response> {
	// ... (আগের কোড একই রাখা হয়েছে)
	const url = new URL(request.url);
	const filePath = url.pathname.replace('/api/files/', '');

	try {
		if (request.method === 'GET') {
			const object = await env.PROJECT_FILES.get(filePath);
			if (!object) return new Response('File not found', { status: 404 });
			return new Response(object.body, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
		}

		if (request.method === 'PUT') {
			const content = await request.text();
			await env.PROJECT_FILES.put(filePath, content);
			await env.KV_BINDING.put(`file:${filePath}`, Date.now().toString());
			return Response.json({ success: true, message: `${filePath} সফলভাবে আপডেট হয়েছে` });
		}

		if (request.method === 'DELETE') {
			await env.PROJECT_FILES.delete(filePath);
			await env.KV_BINDING.delete(`file:${filePath}`);
			return Response.json({ success: true, message: `${filePath} ডিলিট হয়েছে` });
		}
	} catch (error) {
		console.error("File operation error:", error);
		return Response.json({ error: "Operation failed" }, { status: 500 });
	}

	return new Response('Method not allowed', { status: 405 });
}

// ====================== চ্যাট হ্যান্ডলার ======================
async function handleChat(request: Request, env: Env): Promise<Response> {
	try {
		const body = await request.json() as any;
		const { prompt, messages: history = [] } = body;

		const ai = new Ai(env.AI);

		const systemPrompt = `You are FlyTripVisa AI — a professional travel assistant for Bangladeshi users...`;

		const messages = [
			{ role: 'system', content: systemPrompt },
			...history.slice(-12),
			{ role: 'user', content: prompt }
		];

		const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages,
			max_tokens: 1200,
			temperature: 0.7,
		});

		const responseText = result.response || "দুঃখিত, এখন উত্তর দিতে পারছি না।";

		// Optional: Save chat log to D1
		try {
			await env.DB.prepare(
				"INSERT INTO chat_logs (timestamp, user_message, ai_response) VALUES (?, ?, ?)"
			).bind(new Date().toISOString(), prompt?.substring(0, 500), responseText?.substring(0, 500))
			.run();
		} catch (e) {
			console.error("Failed to log chat:", e);
		}

		return Response.json({ response: responseText });

	} catch (error) {
		console.error("Chat Error:", error);
		return Response.json({ response: "সার্ভারে সমস্যা হয়েছে।" }, { status: 500 });
	}
}