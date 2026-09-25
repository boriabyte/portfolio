import { initNavigation } from "./navigation.js";
import { initProjects } from "./projects.js";
import { initToc } from "./toc.js";
import { loadPartials } from "./partials.js";
import { renderMath } from "./math.js";
import { initChat } from "./chat.js";
import { initHighlights } from "./highlights.js";
import { initDemoVideos } from "./videos.js";
import { initTyping } from "./typing.js";

initChat();
initTyping();
initNavigation();
initHighlights();
initProjects();
initToc();

loadPartials().then(() => {
    renderMath();
    initDemoVideos();
});
