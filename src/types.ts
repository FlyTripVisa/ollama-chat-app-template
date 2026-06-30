/**
 * FlyTripVisa AI - TypeScript Type Definitions
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  prompt: string;
  messages?: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FileUpload {
  filename: string;
  size: number;
  type: string;
  key: string;
}

export interface Env {
  AI: any;
  KV_BINDING: KVNamespace;
  DB: D1Database;
  PROJECT_FILES: R2Bucket;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}