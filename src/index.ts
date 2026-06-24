import { Ai } from '@cloudflare/ai';

export interface Env {
	AI: Ai;
	KV_BINDING: KVNamespace;
	PROJECT_FILES: R2Bucket;
}

/**
 * FlyTripVisa AI - Production Ready Worker
 * Account ID: b73b80fa62deef032d3c08248cf2f30b
 */

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// ====================== API ROUTES ======================
		if (url.pathname === '/api/chat' && request.method === 'POST') {
			return handleChat(request, env);
		}

		if (url.pathname.startsWith('/api/files/')) {
			return handleFileOperations(request, env);
		}

		// Serve static assets (index.html, chat.js etc.)
		return env.ASSETS.fetch(request);
	},
};

// ====================== ফাইল অপারেশন API ======================
async function handleFileOperations(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const filePath = url.pathname.replace('/api/files/', '');

	try {
		if (request.method === 'GET') {
			const object = await env.PROJECT_FILES.get(filePath);
			if (!object) return new Response('File not found', { status: 404 });
			return new Response(object.body, {
				headers: { 'Content-Type': 'text/plain;charset=utf-8' }
			});
		}

		if (request.method === 'PUT') {
			const content = await request.text();
			await env.PROJECT_FILES.put(filePath, content);
			await env.KV_BINDING.put(`file:${filePath}`, Date.now().toString());
			return Response.json({ 
				success: true, 
				message: `${filePath} সফলভাবে আপডেট হয়েছে` 
			});
		}

		if (request.method === 'DELETE') {
			await env.PROJECT_FILES.delete(filePath);
			await env.KV_BINDING.delete(`file:${filePath}`);
			return Response.json({ 
				success: true, 
				message: `${filePath} ডিলিট হয়েছে` 
			});
		}
	} catch (error) {
		console.error("File operation error:", error);
		return Response.json({ error: "Operation failed" }, { status: 500 });
	}

	return new Response('Method not allowed', { status: 405 });
}

// ====================== চ্যাট হ্যান্ডলার (Streaming + Non-streaming) ======================
async function handleChat(request: Request, env: Env): Promise<Response> {
	try {
		const body = await request.json() as any;
		const { prompt, messages: history = [], stream = false } = body;

		const ai = new Ai(env.AI);

		const systemPrompt = `You are FlyTripVisa AI — a professional, friendly travel assistant specialized for Bangladeshi users.
You help with visa, flight, hotel, and travel planning.
You can also manage your own project files (create, edit, update, delete).

When user asks to modify any file:
- Understand the requirement
- Generate the complete file code
- Tell them clearly which file to update
- Reply in Bengali + English mix.

Current project structure:
- public/index.html
- public/chat.js
- src/index.ts
- wrangler.jsonc`;

		const messages = [
			{ role: 'system', content: systemPrompt },
			...history.slice(-12),
			{ role: 'user', content: prompt || body.messages?.[body.messages.length - 1]?.content }
		];

		// Streaming Support
		if (stream) {
			const streamResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
				messages,
				max_tokens: 1024,
				temperature: 0.7,
				stream: true,
			});

			return new Response(streamResponse, {
				headers: {
					"content-type": "text/event-stream; charset=utf-8",
					"cache-control": "no-cache",
					"connection": "keep-alive",
				},
			});
		}

		// Default Non-Streaming (best for current chat.js)
		const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages,
			max_tokens: 1200,
			temperature: 0.7,
		});

		const responseText = result.response || "দুঃখিত, এখন উত্তর দিতে পারছি না।";

		return Response.json({ 
			response: responseText 
		});

	} catch (error) {
		console.error("Chat Error:", error);
		return Response.json({ 
			response: "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।" 
		}, { status: 500 });
	}
}