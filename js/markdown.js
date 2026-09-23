// Minimal, safe Markdown for chat replies: paragraphs, headings (as bold lines), bullet and
// numbered lists, **bold**, *italic*, `code` and [links](https://...). Text is escaped first,
// so the only HTML in the output is what this file produces.

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function inline(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
        .replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a class="content-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        );
}

export function renderMarkdown(text) {
    const html = [];
    let paragraph = [];
    let list = null;

    const flushParagraph = () => {
        if (!paragraph.length) return;
        html.push(`<p>${paragraph.map(inline).join("<br>")}</p>`);
        paragraph = [];
    };
    const closeList = () => {
        if (!list) return;
        html.push(`</${list}>`);
        list = null;
    };

    for (const line of text.split("\n")) {
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        const heading = line.match(/^\s*#{1,6}\s+(.*)$/);

        if (bullet || numbered) {
            flushParagraph();
            const type = bullet ? "ul" : "ol";
            if (list !== type) {
                closeList();
                html.push(numbered && numbered[1] !== "1" ? `<ol start="${numbered[1]}">` : `<${type}>`);
                list = type;
            }
            html.push(`<li>${inline(bullet ? bullet[1] : numbered[2])}</li>`);
        } else if (!line.trim()) {
            // Blank lines end a paragraph but not a list, so "1. a\n\n2. b" stays one list.
            flushParagraph();
        } else if (heading) {
            flushParagraph();
            closeList();
            html.push(`<p><strong>${inline(heading[1])}</strong></p>`);
        } else {
            closeList();
            paragraph.push(line.trim());
        }
    }

    flushParagraph();
    closeList();
    return html.join("");
}
