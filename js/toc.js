// Smooth-scrolling table of contents links inside project detail panels.
// Delegated, because the panels are filled in after the page loads.

export function initToc() {
    document.addEventListener("click", (event) => {
        const link = event.target.closest(".toc-link");
        if (!link) return;

        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}
