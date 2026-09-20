// KaTeX is loaded from a CDN in index.html; skip quietly if it is unavailable.

const DELIMITERS = [
    { left: "$$", right: "$$", display: true },
    { left: "\\(", right: "\\)", display: false },
];

export function renderMath(root = document.body) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(root, { delimiters: DELIMITERS });
}
