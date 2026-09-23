import { initNavigation } from "./navigation.js";
import { initProjects } from "./projects.js";
import { initToc } from "./toc.js";
import { loadPartials } from "./partials.js";
import { renderMath } from "./math.js";
import { initChat } from "./chat.js";
import { initHighlights } from "./highlights.js";

initChat();
initNavigation();
initHighlights();
initProjects();
initToc();

loadPartials().then(() => renderMath());
