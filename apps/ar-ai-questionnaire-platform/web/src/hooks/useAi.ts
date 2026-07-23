import { useCallback, useState } from "react";
import type { AiRequest, AiResponse } from "../lib/aiTypes";

export interface UseAiResult {
  run: (req: AiRequest) => Promise<AiResponse | null>;
  loading: boolean;
  error: string | null;
}

/** Calls the server-side /api/ai proxy (Kimi). The API key never reaches the client. */
export function useAi(): UseAiResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (req: AiRequest): Promise<AiResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      const j = (await r.json().catch(() => ({}))) as Partial<AiResponse> & { error?: string };
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      return {
        text: j.text ?? "",
        model: j.model,
        sources: j.sources,
        knowledge: j.knowledge,
      };
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error };
}
