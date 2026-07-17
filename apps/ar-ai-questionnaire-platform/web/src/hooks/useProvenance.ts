import { useEffect, useState } from "react";
import type { Provenance, ProvenanceDoc } from "../types/provenance";

export interface ProvenanceState {
  /** Full static provenance doc, including question/guidance/draft. */
  doc: ProvenanceDoc | null;
  /** The fetched provenance, or null while loading / on error / when no doc. */
  provenance: Provenance | null;
  loading: boolean;
  /** True when the static /provenance/<urlId>.json could not be loaded. */
  notFound: boolean;
}

const NO_DOC: ProvenanceState = { doc: null, provenance: null, loading: false, notFound: true };

/**
 * Fetch `/provenance/<urlId>.json` (served statically from web/public/) and
 * return its static doc payload. `urlId === undefined` (question has no doc)
 * resolves immediately with no doc and notFound = true. Results are
 * cached per urlId and the in-flight fetch is race-safe across question
 * switches via a cancelled flag.
 */
export function useProvenance(urlId: string | undefined): ProvenanceState {
  // Keyed by urlId: a fresh entry per question, so we never flash a stale doc's
  // provenance while the new fetch is in flight (loading starts true).
  const [byUrlId, setByUrlId] = useState<Record<string, ProvenanceState>>({});

  useEffect(() => {
    if (!urlId) return;
    let cancelled = false;

    fetch(`/provenance/${urlId}.json`, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ProvenanceDoc>;
      })
      .then((doc) => {
        if (cancelled) return;
        setByUrlId((m) => ({ ...m, [urlId]: { doc, provenance: doc.provenance ?? null, loading: false, notFound: false } }));
      })
      .catch(() => {
        if (cancelled) return;
        setByUrlId((m) => ({ ...m, [urlId]: { doc: null, provenance: null, loading: false, notFound: true } }));
      });

    return () => {
      cancelled = true;
    };
  }, [urlId]);

  if (!urlId) return NO_DOC;
  // While the effect's fetch is pending there's no entry yet → loading.
  return byUrlId[urlId] ?? { doc: null, provenance: null, loading: true, notFound: false };
}
