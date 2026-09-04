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
    const thinkingMessages = [
        "Consulting the Cindy archives",
        "Still checking. Cindy has range",
        "Checking the fine print. There is a lot of it",
        "Asking the portfolio very nicely",
        "Warming up a particularly good answer",
        "Almost there. The answer is worth it"
    ];
    const isLocalPage = window.location.protocol === "file:"
        || ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const useLocalApi = isLocalPage
        && new URLSearchParams(window.location.search).get("api") === "local";
    const chatApiBaseUrl = useLocalApi
        ? "http://127.0.0.1:8001"
        : "https://portfolio-chat-api.onrender.com";
    const chatConversation = [];
    let chatApiReady = false;
    let useDemoFallback = false;

    const demoReplies = [
        {
            matches: ["ai", "machine learning", "computer vision", "nlp", "automation", "agent"],
            reply: "Cindy builds applied AI and automation workflows, including computer vision, NLP, machine learning, and agentic engineering pipelines."
        },
        {
            matches: ["recent", "moko", "current", "now"],
            reply: "Cindy is currently a Senior Software Engineer at Moko Studio, building production systems, developer tooling, release automation, and gameplay simulation systems."
        },
        {
            matches: ["backend", "java", "lender", "api", "data", "cloud"],
            reply: "Her backend experience includes Java and Spring Boot services, REST APIs, PostgreSQL, MongoDB, Kafka, RabbitMQ, Docker, AWS, and CI/CD."
        },
        {
            matches: ["game", "unity", "godot", "interactive", "project"],
            reply: "Cindy has built interactive and educational software with Unity, C#, Godot, and GDScript, including Mornin' in Your Eyes and Virtual Pompeii."
        },
        {
            matches: ["contact", "email", "location", "where"],
            reply: "Cindy is based in Vancouver, BC. You can reach her through the Contact section, LinkedIn, or GitHub links on this site."
        }
    ];

    const addChatMessage = (text, sender) => {
        const message = document.createElement("div");
        const paragraph = document.createElement("p");

        message.className = `chatbot-message chatbot-message--${sender}`;
        paragraph.textContent = text;
        message.append(paragraph);
        chatbotMessages.append(message);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const addThinkingIndicator = () => {
        const indicator = document.createElement("div");
        const label = document.createElement("span");
        const dots = document.createElement("span");

        indicator.className = "chatbot-message chatbot-message--bot chatbot-message--thinking";
        indicator.setAttribute("role", "status");
        label.textContent = thinkingMessages[0];
        dots.className = "chatbot-typing-dots";
        dots.setAttribute("aria-hidden", "true");

        for (let index = 0; index < 3; index += 1) {
            dots.append(document.createElement("span"));
        }

        indicator.append(label, dots);
        chatbotMessages.append(indicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        return { indicator, label };
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
            502: "I know plenty about Cindy, but I seem to be on a coffee break. Please try me again in a moment.",
            503: "The chat service is starting up. Please try again in a moment.",
            504: "The chat service took too long to respond. Please try again."
        };

        if (error.status) return messagesByStatus[error.status] || "The chat service could not respond. Please try again.";
        return "I can't reach the chat service right now. Please check your connection and try again.";
    };

    const getDemoReply = message => {
        const normalizedMessage = message.toLowerCase();
        const match = demoReplies.find(({ matches }) => matches.some(keyword => normalizedMessage.includes(keyword)));
        return match?.reply || "The live chat is unavailable, but this demo can still share Cindy's work in AI, backend systems, interactive projects, and recent experience.";
    };

    const warmChatApi = async () => {
        setChatbotStatus(useLocalApi ? "Connecting to local API..." : "Waking up chat...");
        try {
            const response = await fetch(`${chatApiBaseUrl}/health`);
            if (!response.ok) throw new Error("Health check failed");
            chatApiReady = true;
            setChatbotStatus("Chat ready");
        } catch {
            useDemoFallback = true;
            setChatbotStatus("Demo mode - chat service unavailable");
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

        if (useDemoFallback) {
            window.setTimeout(() => addChatMessage(getDemoReply(message), "bot"), 350);
            return;
        }

        if (!chatApiReady) {
            addChatMessage("The chat service is still starting. Please wait a moment and try again.", "bot");
            return;
        }

        chatConversation.push({ role: "user", content: message });
        chatbotSubmitButton.disabled = true;
        const thinking = addThinkingIndicator();
        let thinkingMessageIndex = 0;
        const longerWaitNotice = window.setInterval(() => {
            thinkingMessageIndex = Math.min(thinkingMessageIndex + 1, thinkingMessages.length - 1);
            thinking.label.textContent = thinkingMessages[thinkingMessageIndex];
        }, 3500);
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
            window.clearTimeout(longerWaitNotice);
            thinking.indicator.remove();
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
