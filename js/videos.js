// Shared video helpers.
//
// A <video data-fallback="path/to.gif"> the browser cannot play is replaced by that image.
// The swap waits for the image to load, so a missing fallback never replaces the video.

export function watchFallback(video, onReplace = () => {}) {
    if (!video.dataset.fallback) return;

    const replace = () => {
        const image = new Image();
        image.className = video.className;
        image.alt = video.getAttribute("aria-label") || "";
        image.addEventListener("load", () => {
            video.replaceWith(image);
            onReplace(image);
        });
        image.src = video.dataset.fallback;
    };

    // The error may have fired before this ran, so check for it as well as listening.
    const isUnsupportedWebm = video.src.endsWith(".webm") && video.canPlayType('video/webm; codecs="vp9"') === "";
    if (video.error || isUnsupportedWebm) {
        replace();
    } else {
        video.addEventListener("error", replace, { once: true });
    }
}

// Demo clips in the project pages. Every partial is loaded at startup, so the clips play
// (and download) only while they are on screen.
export function initDemoVideos(root = document) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
                target.play().catch(() => {});
            } else {
                target.pause();
            }
        });
    });

    root.querySelectorAll("video.demo-image").forEach((video) => {
        observer.observe(video);
        watchFallback(video, () => observer.unobserve(video));
    });
}
