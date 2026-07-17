/**
 * Pure, side-effect-free helpers for turning a docs.qq.com browser URL into a
 * provenance lookup key, and resolving that key against the index.
 *
 * Kept dependency-free and DOM-free so it can be unit-tested directly in node
 * (see test/urlId.test.mjs).
 */

import type { ProvenanceIndex } from "./types";

/**
 * Extract the Tencent-Doc urlId from a pathname.
 *
 * The urlId is the last non-empty path segment, after stripping any trailing
 * query string or hash. We handle the known docs.qq.com URL shapes:
 *   /aio/<id>
 *   /doc/<id>
 *   /doc/p/<id>
 *   /sheet/<id>, /slide/<id>, /form/<id>, /mind/<id>, /flowchart/<id>, ...
 * and anything else where the doc id is simply the trailing segment.
 *
 * Returns null when no plausible id segment is present (e.g. the docs.qq.com
 * home page, /desktop, /pages/..., bare "/").
 *
 * @param pathname  window.location.pathname (may include trailing query/hash
 *                  if a raw href was passed — we defensively strip them).
 */
export function extractUrlId(pathname: string): string | null {
  if (!pathname) return null;

  // Defensive: callers should pass location.pathname (no query/hash), but if a
  // full href or path-with-suffix slips in, strip ?query and #hash first.
  let path = pathname.split("#")[0].split("?")[0];

  // Drop trailing slashes, then take the final segment.
  const segments = path.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) return null;

  const last = segments[segments.length - 1];

  // A Tencent-Doc id is an opaque base64url-ish token. Reject obvious
  // non-doc trailing segments (known SPA routes / static paths) so we don't
  // try to look those up.
  const NON_DOC = new Set([
    "desktop",
    "home",
    "pages",
    "recent",
    "starred",
    "trash",
    "login",
    "mobile",
  ]);
  if (NON_DOC.has(last.toLowerCase())) return null;

  // Doc ids are reasonably long, alphanumeric (occasionally with - or _).
  // Guard against picking up short route fragments.
  if (!/^[A-Za-z0-9_-]{6,}$/.test(last)) return null;

  return last;
}

/** Resolve a urlId against a loaded index. Returns the pointer or null. */
export function lookupUrlId(
  index: ProvenanceIndex | null | undefined,
  urlId: string | null,
): ProvenanceIndex[string] | null {
  if (!index || !urlId) return null;
  return Object.prototype.hasOwnProperty.call(index, urlId) ? index[urlId] : null;
}
