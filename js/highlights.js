// Home page highlights: a stack of looping clips that rotates like a wheel.
//
// Scrolling over the stack brings the next clip to the front and sends the front one
// to the back. Both directions wrap around. Clicking a clip in the back also brings it
// forward. The stack is marked data-nav-ignore, so its wheel events never change section.
//
// A video the browser cannot play is swapped for the image in its data-fallback.

import { ANIMATION_MS, WHEEL_THRESHOLD, WHEEL_BURST_GAP_MS } from "./config.js";

// The title above the stack names the project of the clip in front. When the clip's
// file name contains `match` (case-insensitive), " - label" is added to the title.
// The first rule that matches wins. Add a rule here for each new highlight.
const TITLE = "Highlights";
const PROJECT_LABELS = [
    { match: "asl", label: "ASL Translator" },
];

let title = null;
let items = [];
let active = 0;
let isAnimating = false;
let lastWheelAt = 0;
let burstHasStepped = false;

function render() {
    items.forEach((item, index) => {
        const isFront = index === active;
        item.classList.toggle("is-front", isFront);
        item.classList.toggle("is-back", !isFront);
    });
    renderTitle();
}

function renderTitle() {
    if (!title) return;

    const fileName = (items[active].getAttribute("src") || "").split("/").pop().toLowerCase();
    const rule = PROJECT_LABELS.find(({ match }) => fileName.includes(match.toLowerCase()));
    title.textContent = rule ? `${TITLE} - ${rule.label}` : TITLE;
}

function show(index) {
    if (isAnimating || index === active) return;

    isAnimating = true;
    active = (index + items.length) % items.length;
    render();

    setTimeout(() => {
        isAnimating = false;
    }, ANIMATION_MS);
}

function useFallback(video) {
    const index = items.indexOf(video);
    if (index === -1 || !video.dataset.fallback) return;

    // Swap only once the image has loaded, so a missing fallback never replaces the video.
    const image = new Image();
    image.className = "highlight";
    image.alt = video.getAttribute("aria-label") || "";
    image.addEventListener("load", () => {
        video.replaceWith(image);
        items[index] = image;
        render();
    });
    image.src = video.dataset.fallback;
}

function watchPlayback(video) {
    // The error may have fired before this module ran, so check for it as well as listening.
    const isUnsupportedWebm = video.src.endsWith(".webm") && video.canPlayType('video/webm; codecs="vp9"') === "";
    if (video.error || isUnsupportedWebm) {
        useFallback(video);
        return;
    }
    video.addEventListener("error", () => useFallback(video));
}

function onWheel(event) {
    event.preventDefault();

    // One step per gesture, so trackpad momentum does not spin through the whole stack.
    if (event.timeStamp - lastWheelAt > WHEEL_BURST_GAP_MS) burstHasStepped = false;
    lastWheelAt = event.timeStamp;

    if (burstHasStepped || isAnimating || Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

    burstHasStepped = true;
    show(active + (event.deltaY > 0 ? 1 : -1));
}

function onClick(event) {
    const index = items.indexOf(event.target.closest(".highlight"));
    if (index !== -1 && index !== active) show(index);
}

export function initHighlights() {
    const stack = document.querySelector(".highlights");
    if (!stack) return;

    title = document.querySelector(".highlights-title");
    items = Array.from(stack.querySelectorAll(".highlight"));
    if (items.length === 0) return;

    render();
    items.filter((item) => item instanceof HTMLVideoElement).forEach(watchPlayback);
    if (items.length < 2) return;

    stack.addEventListener("wheel", onWheel, { passive: false });
    stack.addEventListener("click", onClick);
}
