// Section navigation: home / about / projects.
//
// Touch devices navigate only through explicit controls (nav links and back buttons),
// because a drag there means "scroll the content". Everywhere else the wheel and the
// arrow keys also move between sections, but only once the panel is already at its
// top or bottom edge when the gesture starts.

import {
    SECTIONS,
    ANIMATION_MS,
    WHEEL_THRESHOLD,
    WHEEL_BURST_GAP_MS,
    EDGE_TOLERANCE_PX,
} from "./config.js";
import { isProjectDetailOpen, closeProjectDetails } from "./projects.js";

const panels = {
    about: document.getElementById("about"),
    projects: document.getElementById("projects"),
};

const KEY_DIRECTIONS = {
    ArrowDown: 1,
    PageDown: 1,
    ArrowUp: -1,
    PageUp: -1,
};

let current = "home";
let isAnimating = false;
let lastWheelAt = 0;
let burstEdges = { [-1]: false, [1]: false };

// Wheel and key events inside these elements (e.g. the chat) belong to them, not to navigation.
function isNavIgnored(event) {
    return event.target instanceof Element && event.target.closest("[data-nav-ignore]") !== null;
}

// Read on every event so it follows the device (or emulation) changing at runtime.
function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
}

// True when the visible panel cannot scroll any further in the given direction
// (-1 = up, 1 = down), or has nothing to scroll at all.
function isAtEdge(direction) {
    const panel = panels[current];
    if (!panel) return true;

    const maxScroll = panel.scrollHeight - panel.clientHeight;
    if (maxScroll <= EDGE_TOLERANCE_PX) return true;

    return direction < 0
        ? panel.scrollTop <= EDGE_TOLERANCE_PX
        : panel.scrollTop >= maxScroll - EDGE_TOLERANCE_PX;
}

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
    document.dispatchEvent(new CustomEvent("sectionchange", { detail: { section } }));

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

function onWheel(event) {
    if (isTouchDevice() || isNavIgnored(event)) return;

    // Decide once per gesture, before it has scrolled anything, whether it began at an edge.
    // Momentum that carries a scroll to the edge must not roll on into the next section.
    if (event.timeStamp - lastWheelAt > WHEEL_BURST_GAP_MS) {
        burstEdges = { [-1]: isAtEdge(-1), [1]: isAtEdge(1) };
    }
    lastWheelAt = event.timeStamp;

    if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    if (burstEdges[direction]) step(direction);
}

function onKeyDown(event) {
    if (isTouchDevice() || event.repeat || isNavIgnored(event)) return;

    const direction = KEY_DIRECTIONS[event.key];
    if (direction && isAtEdge(direction)) step(direction);
}

export function initNavigation() {
    // Always start on the home state, regardless of any leftover URL fragment
    // (e.g. a bookmarked #about link). The right side starts as the media
    // placeholder, never a panel.
    Object.values(panels).forEach((el) => el.classList.remove("in-view"));
    if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    // Nav links and section back buttons.
    document.querySelectorAll("[data-section]").forEach((control) => {
        control.addEventListener("click", (event) => {
            event.preventDefault();
            goTo(control.dataset.section);
        });
    });
}
