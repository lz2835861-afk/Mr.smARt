/**
 * Runtime config. BASE is where the static provenance JSON lives.
 *
 * Default = production. Overridable at runtime via chrome.storage.sync key
 * "provenanceBase" (e.g. set it to "http://localhost:5173" while developing the
 * web app locally). host_permissions in the manifest already cover both.
 */

export const DEFAULT_BASE = "https://ai.ar-tencent.cloud";
export const DEV_BASE = "http://localhost:5173";

const STORAGE_KEY = "provenanceBase";
const COLLAPSED_KEY = "panelCollapsed";

/** Resolve the active BASE, honoring a chrome.storage.sync override. */
export async function getBase(): Promise<string> {
  try {
    const got = await chrome.storage.sync.get(STORAGE_KEY);
    const v = got?.[STORAGE_KEY];
    if (typeof v === "string" && v.trim()) return v.replace(/\/+$/, "");
  } catch {
    // storage unavailable (e.g. test env) → fall through to default
  }
  return DEFAULT_BASE;
}

export async function getCollapsed(): Promise<boolean> {
  try {
    const got = await chrome.storage.sync.get(COLLAPSED_KEY);
    return got?.[COLLAPSED_KEY] === true;
  } catch {
    return false;
  }
}

export async function setCollapsed(collapsed: boolean): Promise<void> {
  try {
    await chrome.storage.sync.set({ [COLLAPSED_KEY]: collapsed });
  } catch {
    /* ignore */
  }
}

export const INDEX_PATH = "/provenance/index.json";
export const docPath = (urlId: string) => `/provenance/${encodeURIComponent(urlId)}.json`;
