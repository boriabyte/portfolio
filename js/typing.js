// Types a section's terminal title out, letter by letter, each time its panel slides in.
// The rest of the motion (content reveal, sidebar entrance) is pure CSS in css/motion.css.

import { ANIMATION_MS } from "./config.js";

// Start typing halfway through the slide, so the first letters land as the panel settles.
const TYPE_DELAY_MS = ANIMATION_MS / 2;
const CHAR_MS = 70;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let timers = [];

function cancelTyping() {
    timers.forEach(clearTimeout);
    timers = [];
}

// The title's text node sits before the cursor span; its full value is kept in data-text.
function setTitleText(title, text) {
    title.firstChild.data = text;
}

function typeTitle(title) {
    const full = title.dataset.text;
    setTitleText(title, "");
    title.classList.add("is-typing");

    for (let i = 1; i <= full.length; i++) {
        timers.push(setTimeout(() => setTitleText(title, full.slice(0, i)), TYPE_DELAY_MS + i * CHAR_MS));
    }
    timers.push(setTimeout(() => title.classList.remove("is-typing"), TYPE_DELAY_MS + full.length * CHAR_MS));
}

export function initTyping() {
    const titles = document.querySelectorAll(".panel > .terminal-title, .panel .projects-list-view > .terminal-title");

    titles.forEach((title) => {
        title.dataset.text = title.firstChild.data;
        // Screen readers get the whole word, never a half-typed one.
        title.setAttribute("aria-label", title.dataset.text);
    });

    document.addEventListener("sectionchange", (event) => {
        cancelTyping();
        titles.forEach((title) => {
            setTitleText(title, title.dataset.text);
            title.classList.remove("is-typing");
        });

        if (reducedMotion.matches) return;

        const panel = document.getElementById(event.detail.section);
        const title = panel && panel.querySelector(".terminal-title");
        if (title) typeTitle(title);
    });
}
