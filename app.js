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
    const maxChatMessageLength = 500;

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

    chatbotForm?.addEventListener("submit", event => {
        event.preventDefault();
        const message = chatbotInput.value.trim();

        if (!message) return;

        addChatMessage(message, "user");
        chatbotInput.value = "";
        updateChatCharacterCount();
        window.setTimeout(() => addChatMessage(getPortfolioReply(message), "bot"), 350);
    });

    chatbotInput?.addEventListener("input", updateChatCharacterCount);

    document.querySelectorAll("[data-chat-prompt]").forEach(button => {
        button.addEventListener("click", () => {
            chatbotInput.value = button.dataset.chatPrompt;
            chatbotForm.requestSubmit();
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !chatbotPanel.hidden) {
            closeChatbot();
        }
    });
})();
