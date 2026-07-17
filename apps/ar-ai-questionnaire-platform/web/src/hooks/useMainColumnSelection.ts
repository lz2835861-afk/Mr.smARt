import { type RefObject, useCallback, useEffect, useState } from "react";

const MIN_CHARS = 2;

export interface TextareaSelection {
  fieldId: string;
  text: string;
  start: number;
  end: number;
}

/** Read the active textarea selection inside answer fields only. */
export function readTextareaSelection(
  container: HTMLElement | null,
): TextareaSelection | null {
  if (!container) return null;

  const active = document.activeElement;
  if (!(active instanceof HTMLTextAreaElement) || !container.contains(active)) {
    return null;
  }
  if (!active.closest("[data-answer-field]")) return null;

  const fieldId = active.closest("[data-answer-field]")?.getAttribute("data-answer-field");
  if (!fieldId) return null;

  const start = active.selectionStart;
  const end = active.selectionEnd;
  if (start == null || end == null || start === end) return null;

  const text = active.value.slice(start, end);
  if (text.trim().length < MIN_CHARS) return null;

  return { fieldId, text, start, end };
}

/**
 * Tracks textarea highlights in the main fill column for the AI sidebar.
 * Pins the excerpt when focus moves to the AI composer; clears only when
 * the selection collapses inside the main column or the user dismisses it.
 */
export function useMainColumnSelection(containerRef: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<TextareaSelection | null>(null);

  const sync = useCallback(() => {
    const root = containerRef.current;
    const fresh = readTextareaSelection(root);
    if (fresh) {
      setSelection(fresh);
      return;
    }
    const active = document.activeElement;
    // Keep excerpt when typing in the AI sidebar (or other UI outside main).
    if (root && active && !root.contains(active)) {
      return;
    }
    setSelection(null);
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const afterPaint = () => requestAnimationFrame(sync);

    root.addEventListener("pointerup", afterPaint);
    root.addEventListener("keyup", afterPaint);
    document.addEventListener("selectionchange", sync);

    return () => {
      root.removeEventListener("pointerup", afterPaint);
      root.removeEventListener("keyup", afterPaint);
      document.removeEventListener("selectionchange", sync);
    };
  }, [containerRef, sync]);

  return { selection, clearSelection, setSelection, sync };
}
