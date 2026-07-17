/**
 * Network layer: fetch the index and per-doc provenance JSON from BASE.
 *
 * The index is fetched once and cached for the lifetime of the page (it is
 * small and changes rarely). Per-doc JSON is fetched on demand, with a small
 * in-memory cache so SPA back/forward navigation doesn't re-hit the network.
 */

import { docPath, getBase, INDEX_PATH } from "./config";
import type { ProvenanceDoc, ProvenanceIndex } from "./types";

let indexPromise: Promise<ProvenanceIndex | null> | null = null;
const docCache = new Map<string, ProvenanceDoc | null>();

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { method: "GET", credentials: "omit", cache: "no-cache" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadIndex(): Promise<ProvenanceIndex | null> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const base = await getBase();
      return fetchJson<ProvenanceIndex>(base + INDEX_PATH);
    })();
  }
  return indexPromise;
}

export async function loadDoc(urlId: string): Promise<ProvenanceDoc | null> {
  if (docCache.has(urlId)) return docCache.get(urlId) ?? null;
  const base = await getBase();
  const doc = await fetchJson<ProvenanceDoc>(base + docPath(urlId));
  docCache.set(urlId, doc);
  return doc;
}

/** For tests / forced refresh. */
export function _resetCaches() {
  indexPromise = null;
  docCache.clear();
}
