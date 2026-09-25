export const SECTIONS = ["home", "about", "experience", "projects"];
export const ANIMATION_MS = 700;
export const WHEEL_THRESHOLD = 15;

// Wheel events closer together than this belong to one gesture (including trackpad momentum).
export const WHEEL_BURST_GAP_MS = 200;

// How close to a panel's top or bottom still counts as "at the edge", in pixels.
export const EDGE_TOLERANCE_PX = 2;

// Chat proxy (Azure Function) in front of the portfolio agent. It only accepts requests
// from horiascarlat.com, so a local copy of the site needs its origin added to the proxy's CORS.
export const CHAT_ENDPOINT = "https://horiascarlat-chat-proxy.azurewebsites.net/api/chat";
