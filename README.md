# Portfolio site

Personal portfolio for Horia Scarlat. A static site with no build step: plain HTML, CSS and
ES modules.

## Running locally

The page loads each project from a separate HTML file with `fetch()` and uses ES modules, so it
has to be served over HTTP. Opening `index.html` straight from disk will not work.

Any static server does the job, for example:

```
python -m http.server 8000
```

then open <http://localhost:8000>. The VS Code integrated browser / Live Preview works too.

## Structure

```
index.html                 Page shell: sidebar, About, Experience and the project list
partials/
  projects/                One HTML fragment per project detail page
css/
  main.css                 Entry point, imports everything below in cascade order
  base.css                 Reset, page defaults, design tokens
  layout/                  Page-level structure (sidebar, panels, project list and detail)
  components/              Reusable pieces (back buttons, content, toc, figures, tables, equations, ...)
  responsive.css           Small-screen overrides, must stay last
js/
  main.js                  Entry point, wires the modules together
  config.js                Constants (sections, animation and wheel thresholds)
  navigation.js            Home / About / Experience / Projects navigation (links and back buttons everywhere;
                           wheel and keys on non-touch devices, only at a panel's scroll edge)
  projects.js              Project list and the sliding project detail panels
  partials.js              Loads data-partial fragments into the page
  toc.js                   Smooth-scrolling table of contents links
  math.js                  KaTeX rendering
  chat.js                  Chat widget (Projects section only), talks to the chat proxy
  markdown.js              Safe Markdown-to-HTML for chat replies
assets/
  images/<project>/        Diagrams and screenshots, one folder per project
  docs/                    Downloadable documents
```

## Adding a project

1. Create `partials/projects/<slug>.html` with the project's back button, title and content.
   Copy an existing partial as a starting point, and prefix element IDs with the project
   (for example `myproject-summary`) so table of contents anchors stay unique across the page.
2. Put its images in `assets/images/<slug>/`. Asset paths inside a partial are relative to
   `index.html`, not to the partial.
3. In `index.html`, add a link to the list and a matching mount:

   ```html
   <li><a href="#" class="project-link" data-project="<slug>">Project name</a></li>
   ...
   <div class="project-detail" data-project="<slug>" data-partial="partials/projects/<slug>.html"></div>
   ```

## Chat widget

The chat in the Projects section talks to an Azure Function proxy (`CHAT_ENDPOINT` in
`js/config.js`), which forwards to the Foundry-hosted portfolio agent. The proxy's CORS only
allows horiascarlat.com, so to try the chat locally add your local origin first:

```
az functionapp cors add -g rg-portfolio-proxy -n horiascarlat-chat-proxy --allowed-origins http://localhost:8000
```

and remove it again with `az functionapp cors remove` (same arguments) when done. The launcher
icon is marked with a comment in `index.html`.

## Third-party libraries (CDN)

Poppins (Google Fonts), Font Awesome 6.5.1 and KaTeX 0.16.9 are loaded from CDNs in
`index.html`.
