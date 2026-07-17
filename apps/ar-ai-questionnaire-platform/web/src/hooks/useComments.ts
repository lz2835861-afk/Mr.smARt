/**
 * Per-field comment threads over Supabase `comments` (platform layer).
 * Schema: web/supabase/comments.sql. Realtime-synced, scoped to a questionnaire.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Questionnaire } from "../data/questionnaires";
import { isRemoteEnabled, supabase } from "../lib/supabase";

export interface Comment {
  id: number;
  questionnaire_id: string | null;
  field_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  resolved: boolean;
  created_at: string;
}

export interface UseCommentsResult {
  commentsByField: Record<string, Comment[]>;
  enabled: boolean;
  addComment: (fieldId: string, body: string) => Promise<void>;
  toggleResolved: (id: number, resolved: boolean) => Promise<void>;
}

const SELECT = "id, questionnaire_id, field_id, author_id, author_name, body, resolved, created_at";

export function useComments({
  remote,
  questionnaire,
  authorName,
}: {
  remote: boolean;
  questionnaire: Questionnaire;
  authorName?: string;
}): UseCommentsResult {
  const qid = questionnaire.id;
  const enabled = Boolean(isRemoteEnabled && remote && supabase);
  const [commentsByField, setCommentsByField] = useState<Record<string, Comment[]>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  const group = (rows: Comment[]): Record<string, Comment[]> => {
    const out: Record<string, Comment[]> = {};
    for (const c of rows) (out[c.field_id] ??= []).push(c);
    for (const k of Object.keys(out))
      out[k].sort((a, b) => a.created_at.localeCompare(b.created_at));
    return out;
  };

  useEffect(() => {
    if (!enabled || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase!
        .from("comments")
        .select(SELECT)
        .eq("questionnaire_id", qid);
      if (cancelled) return;
      if (error) {
        console.warn("[useComments] fetch failed:", error.message);
        return;
      }
      setCommentsByField(group((data ?? []) as Comment[]));
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, qid]);

  useEffect(() => {
    if (!enabled || !supabase) return;
    const channel = supabase
      .channel("comments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (payload) => {
        const row = (payload.new ?? payload.old) as Comment | undefined;
        if (!row || row.questionnaire_id !== qid) return;
        setCommentsByField((prev) => {
          const next = { ...prev };
          const list = (next[row.field_id] ?? []).filter((c) => c.id !== row.id);
          if (payload.eventType !== "DELETE") {
            list.push(payload.new as Comment);
            list.sort((a, b) => a.created_at.localeCompare(b.created_at));
          }
          next[row.field_id] = list;
          return next;
        });
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, qid]);

  const addComment = useCallback(
    async (fieldId: string, body: string) => {
      if (!enabled || !supabase || !body.trim()) return;
      const { error } = await supabase.from("comments").insert({
        questionnaire_id: qid,
        field_id: fieldId,
        body: body.trim(),
        author_name: authorName ?? null,
      });
      if (error) console.warn("[useComments] insert failed:", error.message);
    },
    [enabled, qid, authorName],
  );

  const toggleResolved = useCallback(
    async (id: number, resolved: boolean) => {
      if (!enabled || !supabase) return;
      const { error } = await supabase.from("comments").update({ resolved }).eq("id", id);
      if (error) console.warn("[useComments] update failed:", error.message);
    },
    [enabled],
  );

  return { commentsByField, enabled, addComment, toggleResolved };
}
