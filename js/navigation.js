// Section navigation: home / about / projects, driven by wheel, swipe, keys and nav links.

import { SECTIONS, ANIMATION_MS, WHEEL_THRESHOLD, SWIPE_THRESHOLD } from "./config.js";
import { isProjectDetailOpen, closeProjectDetails } from "./projects.js";

const panels = {
    about: document.getElementById("about"),
    projects: document.getElementById("projects"),
};

let current = "home";
let isAnimating = false;
let touchStartY = null;

function goTo(section) {
    if (isAnimating || !SECTIONS.includes(section)) return;

    if (section === current) {
        if (section === "projects" && isProjectDetailOpen()) closeProjectDetails();
        return;
    }

    isAnimating = true;
    current = section;

    if (section !== "projects") closeProjectDetails();

    Object.entries(panels).forEach(([name, el]) => {
        el.classList.toggle("in-view", name === section);
    });

    const enteredPanel = panels[section];
    if (enteredPanel) enteredPanel.scrollTop = 0;

    history.replaceState(null, "", section === "home" ? "#" : `#${section}`);

    setTimeout(() => {
        isAnimating = false;
    }, ANIMATION_MS);
}

function step(direction) {
    if (isProjectDetailOpen()) return;
    const nextIndex = SECTIONS.indexOf(current) + direction;
    if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;
    goTo(SECTIONS[nextIndex]);
}

export function initNavigation() {
    // Always start on the home state, regardless of any leftover URL fragment
    // (e.g. a bookmarked #about link). The right side starts as the media
    // placeholder, never a panel.
    Object.values(panels).forEach((el) => el.classList.remove("in-view"));
    if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
    }

    window.addEventListener(
        "wheel",
        (event) => {
            if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
            step(event.deltaY > 0 ? 1 : -1);
        },
        { passive: true }
    );

    window.addEventListener(
        "touchstart",
        (event) => {
            touchStartY = event.touches[0].clientY;
        },
        { passive: true }
    );

    window.addEventListener(
        "touchend",
        (event) => {
            if (touchStartY === null) return;
            const deltaY = touchStartY - event.changedTouches[0].clientY;
            touchStartY = null;
            if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;
            step(deltaY > 0 ? 1 : -1);
        },
        { passive: true }
    );

    window.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "PageDown") step(1);
        if (event.key === "ArrowUp" || event.key === "PageUp") step(-1);
    });

    document.querySelectorAll("a[data-section]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            goTo(link.dataset.section);
        });
    });
}
