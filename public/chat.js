/**
 * FlyTripVisa AI - Chat Frontend
 * Version: 1.0.0
 * Security: Token removed from client-side (using Worker proxy)
 */

"use strict";

// ====================== CONFIG ======================
const API_URL = "/api/chat";   // ← Worker এর মাধ্যমে কল হবে (সিকিউর)

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.querySelector(".btn-send");

let chatHistory = [
    { 
        role: "assistant", 
        content: "Hello! আমি FlyTripVisa AI। আজকের ভিসা, ফ্লাইট, হোটেল বা ট্রাভেল প্ল্যান নিয়ে কীভাবে সাহায্য করতে পারি?" 
    }
];

// ====================== VOICE RECOGNITION ======================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'bn-BD';

function startVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (!voiceBtn) return;

    voiceBtn.classList.add('listening');
    recognition.start();

    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        voiceBtn.classList.remove('listening');
        sendMessage();
    };

    recognition.onerror = () => {
        voiceBtn.classList.remove('listening');
        alert("ভয়েস রেকগনিশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।");
    };
}

// ====================== HELPER FUNCTIONS ======================
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = role === "user" ? "msg msg-user" : "msg msg-ai";
    div.innerHTML = escapeHtml(text);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ====================== MAIN SEND FUNCTION ======================
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    userInput.value = "";

    const aiMsgDiv = document.createElement("div");
    aiMsgDiv.className = "msg msg-ai";
    aiMsgDiv.textContent = "চিন্তা করছি...";
    chatContainer.appendChild(aiMsgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: text,
                messages: chatHistory,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.response || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";

        aiMsgDiv.textContent = reply;
        chatHistory.push({ role: "assistant", content: reply });

        // Auto refresh for code/file updates
        if (text.toLowerCase().match(/update|edit|তৈরি করো|আপডেট/)) {
            setTimeout(() => location.reload(), 1500);
        }

    } catch (err) {
        console.error("AI Error:", err);
        aiMsgDiv.innerHTML = "❌ সংযোগ সমস্যা হয়েছে।<br>পরে আবার চেষ্টা করুন।";
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ====================== EVENT LISTENERS ======================
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// File Attachment
function handleFile(input) {
    if (input.files && input.files[0]) {
        alert(`📎 ফাইল সংযুক্ত হয়েছে: ${input.files[0].name}`);
    }
}

// ====================== INITIALIZE ======================
document.addEventListener("DOMContentLoaded", () => {
    appendMessage("assistant", chatHistory[0].content);
});