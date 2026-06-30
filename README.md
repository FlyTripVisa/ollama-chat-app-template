# FlyTripVisa AI Chat Assistant

A Cloudflare Workers AI-powered travel assistant with chat, file management, and database integration.

## 🚀 Features

- **AI Chat**: Powered by Cloudflare AI (Llama 3) for travel, visa, and flight assistance
- **Voice Input**: Speech-to-text in Bengali
- **File Management**: Upload and manage documents via R2
- **Database**: D1 SQLite for persistent data storage
- **Session Storage**: KV for chat history
- **Mobile-Friendly**: Fully responsive UI

## 📁 Project Structure
FlyTripVisa root/
├── public/                 # Static assets
│   ├── index.html         # Chat UI
│   ├── chat.js            # Frontend logic
│   └── file-manager/      # File management UI (optional)
├── src/
│   ├── index.ts           # Main Worker entry
│   └── types.ts           # TypeScript definitions
├── test/                  # Test files
├── wrangler.jsonc         # Cloudflare Worker config
├── tsconfig.json          # TypeScript config
└── README.md              # This file
