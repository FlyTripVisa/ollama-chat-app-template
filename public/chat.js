/**
 * FlyTripVisa AI - Chat Frontend
 * Version: 1.0.0
 * Security: Token removed from client-side (using Worker proxy)
 */

"use strict";

// ====================== CONFIG ======================
const API_URL = "/api/chat";   // Worker proxy endpoint

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");

let chatHistory = [
    { 
        role: "assistant", 
        content: "Hello! আমি FlyTripVisa AI। আজকের ভিসা, ফ্লাইট, হোটেল বা ট্রাভেল প্ল্যান নিয়ে কীভাবে সাহায্য করতে পারি?" 
    }
];

// ====================== VOICE RECOGNITION ======================
let recognition = null;
let isListening = false;

function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Voice not supported");
        voiceBtn.style.opacity = "0.3";
        voiceBtn.title = "Voice not supported";
        return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        stopListening();
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.warn("Voice error:", event.error);
        stopListening();
        if (event.error !== 'not-allowed') {
            alert("ভয়েস রেকগনিশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।");
        }
    };

    recognition.onend = stopListening;
}

function startVoice() {
    if (!recognition) {
        initVoice();
        if (!recognition) return;
    }
    if (isListening) {
        stopListening();
        return;
    }
    try {
        recognition.start();
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.textContent = '⏹️';
    } catch (e) {
        console.warn(e);
    }
}

function stopListening() {
    isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.textContent = '🎙️';
    try { if (recognition) recognition.stop(); } catch (_) {}
}

// ====================== HELPER FUNCTIONS ======================
function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = role === "user" ? "msg msg-user" : "msg msg-ai";
    div.innerHTML = escapeHtml(text);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
    const div = document.createElement("div");
    div.className = "msg msg-ai";
    div.id = "typingIndicator";
    div.textContent = "⏳ চিন্তা করছি...";
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return div;
}

function removeTyping() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

// ====================== MAIN SEND FUNCTION ======================
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    userInput.value = "";

    const typingEl = showTyping();

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

        removeTyping();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.response || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";

        appendMessage("assistant", reply);
        chatHistory.push({ role: "assistant", content: reply });

    } catch (err) {
        removeTyping();
        console.error("AI Error:", err);
        appendMessage("assistant", "❌ সংযোগ সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }
}

// ====================== FILE HANDLER ======================
function handleFileUpload() {
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        appendMessage("user", `📎 ফাইল সংযুক্ত: ${escapeHtml(file.name)}`);
        // In production, upload to R2 here
        fileInput.value = '';
    }
}

// ====================== EVENT LISTENERS ======================
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

voiceBtn.addEventListener("click", startVoice);

attachBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFileUpload);

// ====================== INITIALIZE ======================
document.addEventListener("DOMContentLoaded", () => {
    initVoice();
    // Initial greeting is already in HTML
});