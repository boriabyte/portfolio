// Chat widget: a launcher in the bottom-right corner, shown only in the Projects section,
// that opens a small window for talking to the portfolio agent through the chat proxy.
// navigation.js announces section changes with a "sectionchange" event on document.

import { CHAT_ENDPOINT } from "./config.js";
import { renderMarkdown } from "./markdown.js";

const widget = document.getElementById("chat");
const chatWindow = document.getElementById("chat-window");
const toggle = document.getElementById("chat-toggle");
const closeButton = document.getElementById("chat-close");
const messages = document.getElementById("chat-messages");
const intro = document.getElementById("chat-intro");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const sendButton = document.getElementById("chat-send");

// How close to the bottom of the message list still counts as "following" the reply, in pixels.
const FOLLOW_TOLERANCE_PX = 40;

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Errors whose message is safe to show as-is (from the proxy, or written here).
class ChatError extends Error {}

let previousResponseId = null;
let isSending = false;

function isOpen() {
    return widget.classList.contains("is-open");
}

function setOpen(open, { restoreFocus = true } = {}) {
    const wasOpen = isOpen();
    widget.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    chatWindow.inert = !open;
    toggle.inert = open;

    if (open) {
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
    } else if (wasOpen && restoreFocus) {
        toggle.focus({ preventScroll: true });
    }
}

function setAvailable(available) {
    widget.classList.toggle("is-available", available);
    widget.inert = !available;
    if (!available) setOpen(false, { restoreFocus: false });
}

function updateSendButton() {
    sendButton.disabled = isSending || !input.value.trim();
}

// Grow with the text up to the CSS max-height, and only then allow scrolling, so rounding
// never shows a stray scrollbar on a single line.
function resizeInput() {
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
    input.style.overflowY = input.scrollHeight > input.clientHeight + 1 ? "auto" : "hidden";
}

function isFollowing() {
    return messages.scrollHeight - messages.scrollTop - messages.clientHeight < FOLLOW_TOLERANCE_PX;
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function appendMessage(role, text) {
    const message = document.createElement("div");
    message.className = `chat-message from-${role}`;

    const label = document.createElement("span");
    label.className = "chat-message-label";
    label.textContent = role === "user" ? "You" : "Assistant";

    const body = document.createElement("div");
    body.className = "chat-message-text";
    if (text) {
        body.textContent = text;
    } else {
        body.innerHTML = '<span class="chat-typing" aria-label="Thinking"><span></span><span></span><span></span></span>';
    }

    message.append(label, body);
    messages.append(message);
    scrollToBottom();
    return body;
}

async function streamReply(message, onText) {
    let response;
    try {
        response = await fetch(CHAT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, previousResponseId }),
        });
    } catch {
        throw new ChatError("Couldn't reach the assistant. Check your connection and try again.");
    }

    if (!response.ok) {
        const { error, code } = await response.json().catch(() => ({}));
        if (code === "conversation_expired" && previousResponseId) {
            // The agent forgot this conversation; carry on in a fresh one.
            previousResponseId = null;
            return streamReply(message, onText);
        }
        throw new ChatError(error || GENERIC_ERROR);
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    for (;;) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value;
        const events = buffer.split("\n\n");
        buffer = events.pop();

        for (const block of events) {
            const event = block.match(/^event: (.*)$/m)?.[1];
            const data = JSON.parse(block.match(/^data: (.*)$/m)?.[1] ?? "{}");
            if (event === "delta") onText(data.text);
            else if (event === "done") previousResponseId = data.responseId;
            else if (event === "error") throw new ChatError(data.message || GENERIC_ERROR);
        }
    }
}

async function send(text) {
    const message = text.trim();
    if (!message || isSending) return;

    isSending = true;
    intro.hidden = true;
    input.value = "";
    resizeInput();
    updateSendButton();

    appendMessage("user", message);
    const reply = appendMessage("assistant");
    let replyText = "";

    try {
        await streamReply(message, (chunk) => {
            const follow = isFollowing();
            replyText += chunk;
            reply.innerHTML = renderMarkdown(replyText);
            if (follow) scrollToBottom();
        });
        if (!replyText) throw new ChatError(GENERIC_ERROR);
    } catch (error) {
        const notice = document.createElement("p");
        notice.className = "chat-error";
        notice.textContent =
            error instanceof ChatError ? error.message : "The connection was interrupted. Please try again.";
        if (!replyText) reply.replaceChildren();
        reply.append(notice);
        scrollToBottom();
    } finally {
        isSending = false;
        updateSendButton();
    }
}

export function initChat() {
    setAvailable(false);
    chatWindow.inert = true;

    document.addEventListener("sectionchange", (event) => {
        setAvailable(event.detail.section === "projects");
    });

    toggle.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));

    widget.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isOpen()) setOpen(false);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        send(input.value);
    });

    input.addEventListener("input", () => {
        resizeInput();
        updateSendButton();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    intro.addEventListener("click", (event) => {
        const suggestion = event.target.closest(".chat-suggestion");
        if (suggestion) send(suggestion.textContent);
    });
}
