
# FlyTripVisa AI

**একটি বুদ্ধিমান ট্রাভেল অ্যাসিস্ট্যান্ট** — Cloudflare Workers AI, D1, R2 এবং KV দিয়ে তৈরি।

বাংলাদেশি ইউজারদের জন্য ভিসা, ফ্লাইট, হোটেল ও ট্রাভেল প্ল্যানিংয়ে সাহায্য করে।

---

## ✨ ফিচারসমূহ

- **AI চ্যাটবট** — Workers AI (Llama 3.1) দিয়ে চালিত
- **ভয়েস ইনপুট** — বাংলা ভয়েস রেকগনিশন
- **ফাইল ম্যানেজমেন্ট** — R2 Storage দিয়ে কোড আপডেট
- **চ্যাট লগিং** — D1 Database এ স্বয়ংক্রিয় লগ সংরক্ষণ
- **KV Storage** — মেটাডেটা ও স্টেট ম্যানেজমেন্ট
- **Responsive UI** — মোবাইল ও ডেস্কটপ উভয়ের জন্য
- **সিকিউর** — API টোকেন ক্লায়েন্ট সাইডে নেই

---

## প্রজেক্ট স্ট্রাকচার
/
├── public/             # Static assets
│   ├── index.html      # Chat UI HTML
|   ├── file-manager (personal including logging interface)
│   └── chat.js         # Chat UI frontend script
├── src/
│   ├── index.ts        # Main Worker entry point
│   └── types.ts        # TypeScript type definitions
├── test/               # Test files
├── wrangler.jsonc      # Cloudflare Worker 
├──/api/db-test
├──/api/db-test
├──/api/chat
|── tsconfig.json       # TypeScript configuration
└── README.md           # This documentation