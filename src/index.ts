/**
 * FlyTripVisa AI - Cloudflare Worker
 * Main entry point for AI chat, file management, and database operations
 */

import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: any;
  KV_BINDING: KVNamespace;
  DB: D1Database;
  PROJECT_FILES: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- API Routes ---
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (path === '/api/db-test' && request.method === 'GET') {
      return handleDbTest(env);
    }

    // --- Serve static assets from public/ (handled by assets binding) ---
    // Fallback: return index.html for SPA routing
    if (path === '/' || path === '/login.html' || path === '/file-manager') {
      return env.assets.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// ====================== CHAT HANDLER ======================
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { prompt: string; messages?: any[]; stream?: boolean };
    const { prompt, messages = [], stream = false } = body;

    // Build conversation history
    const conversation = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // Add current prompt if not already in messages
    if (!messages.some((m: any) => m.role === 'user' && m.content === prompt)) {
      conversation.push({ role: 'user', content: prompt });
    }

    // Call Cloudflare AI
    const ai = new Ai(env.AI);
    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: conversation,
      stream: false,
      max_tokens: 1024,
    });

    // Store chat history in KV (optional)
    const userId = 'default-user';
    const historyKey = `chat:${userId}`;
    const history = await env.KV_BINDING.get(historyKey, 'json') || [];
    history.push({ role: 'user', content: prompt });
    history.push({ role: 'assistant', content: response.response });
    if (history.length > 50) history.splice(0, 20); // limit history
    await env.KV_BINDING.put(historyKey, JSON.stringify(history));

    return Response.json({
      response: response.response,
      usage: response.usage
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return Response.json(
      { error: 'Failed to process chat request', details: error.message },
      { status: 500 }
    );
  }
}

// ====================== DATABASE TEST HANDLER ======================
async function handleDbTest(env: Env): Promise<Response> {
  try {
    // Test D1 query
    const result = await env.DB.prepare('SELECT 1 as test').all();
    return Response.json({
      success: true,
      message: 'Database connection successful',
      data: result
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}