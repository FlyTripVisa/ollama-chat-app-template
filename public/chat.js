/**
 * FlyTripVisa AI - Production Ready Integration
 * Account: b73b80fa62deef032d3c08248cf2f30b
 */

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.querySelector(".btn-send");

// Gateway এন্ডপয়েন্ট ও আপনার অথরাইজেশন টোকেন
const API_URL = "Https://gateway.ai.cloudflare.com/v1/b73b80fa62deef032d3c08248cf2f30b/default/compat";
const API_TOKEN = "b73b80fa62deef032d3c08248cf2f30b"; // আপনার ইস্যু করা টোকেনটি এখানে বসান

let chatHistory = [{ role: "assistant", content: "Hello! I am your AI Travel Assistant. How can I help you?" }];

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // UI আপডেট
    appendMsg("msg-user", text);
    userInput.value = "";
    chatHistory.push({ role: "user", content: text });

    const aiMsgDiv = document.createElement("div");
    aiMsgDiv.className = "msg msg-ai";
    aiMsgDiv.innerText = "Thinking...";
    chatContainer.appendChild(aiMsgDiv);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: chatHistory })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const responseText = data.result?.response || "AI returned no content.";
        
        aiMsgDiv.innerText = responseText;
        chatHistory.push({ role: "assistant", content: responseText });
    } catch (err) {
        aiMsgDiv.innerText = "Error: Connection failed. Check your API Token/Permissions.";
        console.error("AI Gateway Error:", err);
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendMsg(cls, text) {
    const div = document.createElement("div");
    div.className = `msg ${cls}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendMessage(); });