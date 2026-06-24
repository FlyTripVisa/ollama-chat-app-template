// ====================== CONFIG ======================
const API_URL = "https://gateway.ai.cloudflare.com/v1/b73b80fa62deef032d3c08248cf2f30b/default/compat";
const API_TOKEN = "b73b80fa62deef032d3c08248cf2f30b";   // ← এখানে আপনার বাস্তব API Token বসান (Account ID নয়)

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.querySelector(".btn-send");

let chatHistory = [
    { role: "assistant", content: "Hello! আমি FlyTripVisa AI। আজকের ভিসা, ফ্লাইট বা ট্রাভেল প্ল্যান নিয়ে কীভাবে সাহায্য করতে পারি?" }
];

// ====================== VOICE RECOGNITION ======================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'bn-BD';

function startVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    voiceBtn.classList.add('listening');
    recognition.start();

    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        voiceBtn.classList.remove('listening');
        sendMessage();
    };

    recognition.onerror = () => {
        voiceBtn.classList.remove('listening');
        alert("ভয়েস রেকগনিশন ব্যর্থ হয়েছে!");
    };
}

// ====================== HELPER FUNCTIONS ======================
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

    // User message
    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    userInput.value = "";

    // AI Thinking message
    const aiMsgDiv = document.createElement("div");
    aiMsgDiv.className = "msg msg-ai";
    aiMsgDiv.textContent = "চিন্তা করছি...";
    chatContainer.appendChild(aiMsgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: chatHistory,
                max_tokens: 950,
                temperature: 0.75
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.result?.response || data.response || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";

        aiMsgDiv.textContent = reply;
        chatHistory.push({ role: "assistant", content: reply });

        // অটো রিফ্রেশ যদি ফাইল আপডেট কমান্ড হয়
        if (text.toLowerCase().includes("update") || text.toLowerCase().includes("edit") || 
            text.toLowerCase().includes("তৈরি করো") || text.toLowerCase().includes("আপডেট")) {
            setTimeout(() => location.reload(), 1800);
        }

    } catch (err) {
        console.error("AI Gateway Error:", err);
        aiMsgDiv.textContent = "❌ সংযোগ সমস্যা হয়েছে। API Token এবং পারমিশন চেক করুন।";
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ====================== EVENT LISTENERS ======================
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// File attachment (placeholder)
function handleFile(input) {
    if (input.files && input.files[0]) {
        alert("ফাইল সংযুক্ত: " + input.files[0].name);
    }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    // Initial message
    appendMessage("assistant", chatHistory[0].content);
});