// Loads HTML fragments into every element marked with data-partial="path/to/file.html".
// Paths resolve against the page, so asset URLs inside a partial are relative to index.html.

async function loadInto(mount) {
    const path = mount.dataset.partial;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        mount.innerHTML = await response.text();
    } catch (error) {
        console.error(`Could not load ${path}`, error);
        mount.innerHTML = `
            <button class="back-button" type="button">
                <span class="back-arrow">&lt;</span> Back
            </button>
            <div class="panel-content">
                <p>
                    This project could not be loaded. If index.html was opened straight from disk,
                    serve the folder over HTTP instead (see the README).
                </p>
            </div>`;
    }
}

export function loadPartials() {
    return Promise.all(Array.from(document.querySelectorAll("[data-partial]"), loadInto));
}
