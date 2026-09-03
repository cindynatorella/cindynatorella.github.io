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
    const chatApiBaseUrl = isLocalPage ? "http://127.0.0.1:8001" : null;
    const chatConversation = [];
    let chatApiReady = !chatApiBaseUrl;

    const portfolioReplies = [
        {
            matches: ["ai", "machine learning", "computer vision", "nlp", "automation", "agent"],
            reply: "Cindy builds applied AI and automation workflows, including computer vision, NLP, machine learning, and agentic engineering pipelines. Her recent work combines Python, Docker, GitHub Actions, and MCP-based tooling."
        },
        {
            matches: ["recent", "moko", "current", "now"],
            reply: "Cindy is currently a Senior Software Engineer at Moko Studio. She builds production systems, developer tooling, release automation, and gameplay simulation systems with Python, C#, Godot, PostgreSQL, Docker, and GitHub Actions."
        },
        {
            matches: ["backend", "java", "lender", "api", "data", "cloud"],
            reply: "Her backend experience includes Java and Spring Boot services, REST APIs, PostgreSQL, MongoDB, Kafka, RabbitMQ, Docker, AWS, and CI/CD. At LenderPrice, she worked on a cloud mortgage-pricing platform processing more than $20B in locked loan volume each month."
        },
        {
            matches: ["game", "unity", "godot", "interactive", "project"],
            reply: "Cindy has built interactive and educational software with Unity, C#, Godot, and GDScript. Featured work includes Mornin' in Your Eyes, Virtual Pompeii, and graph-theory puzzle games."
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

    const getPortfolioReply = (message) => {
        const normalizedMessage = message.toLowerCase();
        const match = portfolioReplies.find(({ matches }) => matches.some(keyword => normalizedMessage.includes(keyword)));

        return match?.reply || "This is the frontend demo for Cindy's portfolio assistant. The future Render and Groq connection will provide richer answers; for now, try asking about AI work, backend systems, games, or recent experience.";
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
        if (!chatApiBaseUrl) return;

        setChatbotStatus("Connecting to local API...");
        try {
            const response = await fetch(`${chatApiBaseUrl}/health`);
            if (!response.ok) throw new Error("Health check failed");
            chatApiReady = true;
            setChatbotStatus("Chat ready");
        } catch {
            setChatbotStatus("Local API unavailable - start Docker to enable chat");
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

        if (chatApiBaseUrl) {
            if (!chatApiReady) {
                addChatMessage("The local chat service is not ready yet. Start Docker, then refresh this page.", "bot");
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
            return;
        }

        window.setTimeout(() => addChatMessage(getPortfolioReply(message), "bot"), 350);
    });

    chatbotInput?.addEventListener("input", updateChatCharacterCount);
    warmChatApi();

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !chatbotPanel.hidden) {
            closeChatbot();
        }
    });
})();
