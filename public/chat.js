/**
 * FlyTripVisa AI - Integrated Logic
 */

// DOM elements updated for index.html compatibility
const chatMessages = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendButton = document.querySelector(".btn-send");
const typingIndicator = document.getElementById("typing-indicator") || document.createElement("div");

let chatHistory = [{ role: "assistant", content: "Hello! I am your AI Travel Assistant. How can I help you?" }];
let isProcessing = false;

// Event Listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "" || isProcessing) return;

    isProcessing = true;
    userInput.disabled = true;
    sendButton.disabled = true;

    addMessageToChat("msg-user", message);
    userInput.value = "";
    
    chatHistory.push({ role: "user", content: message });
    typingIndicator.classList.add("visible");

    try {
        // Assistant Message Placeholder
        const assistantMessageEl = document.createElement("div");
        assistantMessageEl.className = "msg msg-ai";
        chatMessages.appendChild(assistantMessageEl);

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: chatHistory }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            responseText += decoder.decode(value, { stream: true });
            assistantMessageEl.innerText = responseText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        chatHistory.push({ role: "assistant", content: responseText });
    } catch (error) {
        addMessageToChat("msg-ai", "Sorry, error processing request.");
    } finally {
        typingIndicator.classList.remove("visible");
        isProcessing = false;
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

function addMessageToChat(className, content) {
    const div = document.createElement("div");
    div.className = `msg ${className}`;
    div.innerText = content;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
