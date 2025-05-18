document.addEventListener('DOMContentLoaded', () => {
    // FAQ Data: question-answer pairs
    const faqData = [
        { question: "What is your return policy?", answer: "You can return any item within 30 days of purchase with a receipt." },
        { question: "How do I track my order?", answer: "You will receive a tracking number via email once your order has shipped." },
        { question: "Do you ship internationally?", answer: "Yes, we ship to most countries worldwide. Shipping rates may vary." },
        { question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, American Express, and PayPal." },
        { question: "How can I contact customer support?", answer: "You can contact customer support via email at support@example.com or call us at (123) 456-7890." }
    ];

    // Chatbot elements
    const chatBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatCloseBtn = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');

    // Toggle chatbot window
    chatBtn.addEventListener('click', () => {
        const wasOpen = chatWindow.classList.contains('open');
        chatWindow.classList.toggle('open');
        chatWindow.setAttribute('aria-hidden', wasOpen ? 'true' : 'false');
        if (!wasOpen) {
            chatMessages.innerHTML = ''; // Clear previous messages on open
            appendBotMessage("Hi! Ask me any of the common FAQs or type your question.");
            chatInput.focus();
        }
    });

    // Close chatbot
    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        chatWindow.setAttribute('aria-hidden', 'true');
        chatInput.value = '';
        chatMessages.innerHTML = '';
    });

    // Append bot message
    function appendBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', 'bot');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Append user message
    function appendUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', 'user');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Find answer for user question (simple keyword matching)
    function findAnswer(userQuestion) {
        const questionLower = userQuestion.toLowerCase();

        for (const faq of faqData) {
            const questionLowercase = faq.question.toLowerCase();
            if (questionLowercase.includes(questionLower) || questionLower.includes(questionLowercase)) {
                return faq.answer;
            }
        }

        // fallback: try partial match of keywords
        for (const faq of faqData) {
            if (questionLower.split(' ').some(word => faq.question.toLowerCase().includes(word))) {
                return faq.answer;
            }
        }

        return "Sorry, I don't have an answer for that. Please check our FAQ page or contact support.";
    }

    // Handle form submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMsg = chatInput.value.trim();
        if (!userMsg) return;

        appendUserMessage(userMsg);

        // Delay bot reply for realism
        setTimeout(() => {
            const answer = findAnswer(userMsg);
            appendBotMessage(answer);
        }, 700);

        chatInput.value = '';
        chatInput.focus();
    });
});
