/**
 * Content script entry. Runs on every docs.qq.com page. Resolves the current
 * doc's urlId from window.location, looks it up in the provenance index, and (if
 * found) fetches + renders the sidebar. Re-evaluates on SPA navigation.
 *
 * We never read doc *content* — only window.location — so the canvas-rendered
 * body is irrelevant.
 */

import { loadDoc, loadIndex } from "./fetcher";
import { ProvenancePanel } from "./panel";
import { extractUrlId, lookupUrlId } from "./urlId";

let panel: ProvenancePanel | null = null;
let lastUrlId: string | null = null;
let renderToken = 0;

async function evaluate() {
  const urlId = extractUrlId(window.location.pathname);

  // Same doc as last render → nothing to do.
  if (urlId === lastUrlId && panel) return;
  lastUrlId = urlId;

  const token = ++renderToken;

  if (!urlId) {
    panel?.hide();
    return;
  }

  const index = await loadIndex();
  if (token !== renderToken) return; // a newer navigation superseded us
  const hit = lookupUrlId(index, urlId);
  if (!hit) {
    // Not one of our question-docs → render nothing.
    panel?.hide();
    return;
  }

  const doc = await loadDoc(urlId);
  if (token !== renderToken) return;
  if (!doc) {
    panel?.hide();
    return;
  }

  if (!panel) {
    panel = new ProvenancePanel();
    await panel.mount();
  }
  panel.renderDoc(doc);
}

// ---------------------------------------------------------------------------
// SPA navigation watching: patch history + listen to popstate, plus a low-
// frequency poll as a backstop (docs.qq.com sometimes swaps the doc without a
// history event we can observe).
// ---------------------------------------------------------------------------
function onUrlMaybeChanged() {
  // Debounce bursts of history calls into a single eval on the next tick.
  queueMicrotask(() => void evaluate());
}

function installNavWatchers() {
  const wrap = (key: "pushState" | "replaceState") => {
    const orig = history[key];
    history[key] = function (this: History, ...args: Parameters<typeof orig>) {
      const ret = orig.apply(this, args as never);
      onUrlMaybeChanged();
      return ret;
    } as typeof orig;
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", onUrlMaybeChanged);
  window.addEventListener("hashchange", onUrlMaybeChanged);

  // Backstop poll (cheap: just compares a string).
  let seen = window.location.href;
  setInterval(() => {
    if (window.location.href !== seen) {
      seen = window.location.href;
      onUrlMaybeChanged();
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Toolbar action → toggle the panel (message from the background worker).
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "TOGGLE_PANEL" && panel?.hasPanel()) panel.toggle();
});

function boot() {
  installNavWatchers();
  void evaluate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
