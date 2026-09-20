// Project list and the sliding project detail panels.
// Detail content is injected by partials.js, so listeners on it are delegated.

const projectsPanel = document.getElementById("projects");
const projectDetails = document.querySelectorAll(".project-detail");

export function isProjectDetailOpen() {
    return Array.from(projectDetails).some((detail) => detail.classList.contains("in-view"));
}

export function closeProjectDetails() {
    projectDetails.forEach((detail) => detail.classList.remove("in-view"));
    projectsPanel.scrollTop = 0;
}

export function openProject(slug) {
    const target = document.querySelector(`.project-detail[data-project="${slug}"]`);
    if (!target) return;
    closeProjectDetails();
    target.classList.add("in-view");
    projectsPanel.scrollTop = 0;
}

export function initProjects() {
    document.querySelectorAll(".project-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            openProject(link.dataset.project);
        });
    });

    projectsPanel.addEventListener("click", (event) => {
        if (!event.target.closest(".back-button")) return;
        event.preventDefault();
        closeProjectDetails();
    });
}
