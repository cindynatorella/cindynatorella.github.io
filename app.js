(function () {
    [...document.querySelectorAll(".control")].forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add("active-btn");
            document.querySelector(".active").classList.remove("active");
            document.getElementById(button.dataset.id).classList.add("active");
        })
    });
    document.querySelector(".theme-btn")?.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });

    const chatbotToggle = document.querySelector("#chatbot-toggle");
    const chatbotPanel = document.querySelector("#portfolio-chatbot");
    const chatbotClose = document.querySelector("#chatbot-close");
    const chatbotForm = document.querySelector("#chatbot-form");
    const chatbotInput = document.querySelector("#chatbot-input");
    const chatbotMessages = document.querySelector("#chatbot-messages");
    const chatbotCharacterCount = document.querySelector("#chatbot-character-count");
    const chatbotStatusText = document.querySelector("#chatbot-status-text");
    const chatbotSubmitButton = chatbotForm?.querySelector("button[type='submit']");
    const maxChatMessageLength = 500;
    const isLocalPage = window.location.protocol === "file:"
        || ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const useLocalApi = isLocalPage
        && new URLSearchParams(window.location.search).get("api") === "local";
    const chatApiBaseUrl = useLocalApi
        ? "http://127.0.0.1:8001"
        : "https://portfolio-chat-api.onrender.com";
    const chatConversation = [];
    let chatApiReady = false;

    const addChatMessage = (text, sender) => {
        const message = document.createElement("div");
        const paragraph = document.createElement("p");

        message.className = `chatbot-message chatbot-message--${sender}`;
        paragraph.textContent = text;
        message.append(paragraph);
        chatbotMessages.append(message);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const updateChatCharacterCount = () => {
        if (!chatbotCharacterCount) return;
        const remaining = maxChatMessageLength - chatbotInput.value.length;
        chatbotCharacterCount.textContent = `${remaining} characters remaining`;
    };

    const setChatbotStatus = text => {
        if (chatbotStatusText) chatbotStatusText.textContent = text;
    };

    const getChatErrorMessage = error => {
        const messagesByStatus = {
            400: "Please enter a question so I can help.",
            413: "That message is too large. Please make it shorter and try again.",
            422: "I couldn't read that message. Please try rephrasing it.",
            429: "You've sent a few messages quickly. Please wait a minute, then try again.",
            500: "The chat service had a temporary problem. Please try again in a moment.",
            502: "The chat service is temporarily unavailable. Please try again shortly.",
            503: "The chat service is starting up. Please try again in a moment.",
            504: "The chat service took too long to respond. Please try again."
        };

        if (error.status) return messagesByStatus[error.status] || "The chat service could not respond. Please try again.";
        return "I can't reach the chat service right now. Please check your connection and try again.";
    };

    const warmChatApi = async () => {
        setChatbotStatus(useLocalApi ? "Connecting to local API..." : "Waking up chat...");
        try {
            const response = await fetch(`${chatApiBaseUrl}/health`);
            if (!response.ok) throw new Error("Health check failed");
            chatApiReady = true;
            setChatbotStatus("Chat ready");
        } catch {
            setChatbotStatus(useLocalApi ? "Local API unavailable - start Docker to enable chat" : "Chat temporarily unavailable");
        }
    };

    const openChatbot = () => {
        chatbotPanel.hidden = false;
        chatbotToggle.setAttribute("aria-expanded", "true");
        chatbotInput.focus();
    };

    const closeChatbot = () => {
        chatbotPanel.hidden = true;
        chatbotToggle.setAttribute("aria-expanded", "false");
        chatbotToggle.focus();
    };

    chatbotToggle?.addEventListener("click", () => {
        if (chatbotPanel.hidden) {
            openChatbot();
        } else {
            closeChatbot();
        }
    });

    chatbotClose?.addEventListener("click", closeChatbot);

    chatbotForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const message = chatbotInput.value.trim();

        if (!message) return;

        addChatMessage(message, "user");
        chatbotInput.value = "";
        updateChatCharacterCount();

        if (!chatApiReady) {
            addChatMessage("The chat service is still starting. Please wait a moment and try again.", "bot");
            return;
        }

        chatConversation.push({ role: "user", content: message });
        chatbotSubmitButton.disabled = true;
        try {
            const response = await fetch(`${chatApiBaseUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: chatConversation })
            });
            if (!response.ok) {
                const error = new Error("Chat request failed");
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            chatConversation.push(data.message);
            addChatMessage(data.message.content, "bot");
        } catch (error) {
            addChatMessage(getChatErrorMessage(error), "bot");
        } finally {
            chatbotSubmitButton.disabled = false;
        }
    });

    chatbotInput?.addEventListener("input", updateChatCharacterCount);
    warmChatApi();

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !chatbotPanel.hidden) {
            closeChatbot();
        }
    });
})();
