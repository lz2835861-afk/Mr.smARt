"use client";

import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const TONE = {
  amber: "bg-amber-50 border-amber-200/80",
  sky: "bg-sky-50 border-sky-200/80",
  pink: "bg-pink-50 border-pink-200/80",
  emerald: "bg-emerald-50 border-emerald-200/80",
  violet: "bg-violet-50 border-violet-200/80",
  orange: "bg-orange-50 border-orange-200/80",
} as const;

type Tone = keyof typeof TONE;

type Note = {
  id: string;
  textKey?: number; // seed notes: index into t.cta.notes (so they translate)
  text?: string; // user-added notes keep their typed text
  author?: string; // seed notes
  mine?: boolean; // user-added → render as localized "You"
  votes: number;
  voted: boolean;
  tone: Tone;
};

const TONES = Object.keys(TONE) as Tone[];
const ROTATE = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1", "rotate-1"];

const SEED: Note[] = [
  { id: "1", textKey: 0, author: "Mei", votes: 42, voted: false, tone: "amber" },
  { id: "2", textKey: 1, author: "David", votes: 38, voted: false, tone: "sky" },
  { id: "3", textKey: 2, author: "Wen", votes: 31, voted: false, tone: "pink" },
  { id: "4", textKey: 3, author: "Lena", votes: 27, voted: false, tone: "emerald" },
  { id: "5", textKey: 4, author: "Sora", votes: 19, voted: false, tone: "violet" },
  { id: "6", textKey: 5, author: "Kai", votes: 15, voted: false, tone: "orange" },
];

export function UpvoteWall() {
  const t = useT();
  const [notes, setNotes] = useState<Note[]>(SEED);
  const [draft, setDraft] = useState("");

  const toggle = (id: string) =>
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, voted: !n.voted, votes: n.votes + (n.voted ? -1 : 1) } : n,
      ),
    );

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      {
        id: `n${Date.now()}`,
        text,
        mine: true,
        votes: 1,
        voted: true,
        tone: TONES[prev.length % TONES.length],
      },
      ...prev,
    ]);
    setDraft("");
  };

  const sorted = [...notes].sort((a, b) => b.votes - a.votes);

  return (
    <div>
      <form onSubmit={add} className="mx-auto mb-8 flex max-w-xl gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.cta.placeholder}
          maxLength={90}
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#00bbff] focus:ring-2 focus:ring-[#00bbff]/15"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#00bbff] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#00a8e6]"
        >
          {t.cta.post}
        </button>
      </form>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {sorted.map((n, idx) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className={cn("mb-4 break-inside-avoid", ROTATE[idx % ROTATE.length])}
          >
            <div
              className={cn(
                "flex gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow-md",
                TONE[n.tone],
              )}
            >
              <button
                type="button"
                onClick={() => toggle(n.id)}
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-xl border px-2.5 py-1.5 text-xs font-bold tabular-nums transition",
                  n.voted
                    ? "border-[#00bbff] bg-[#00bbff] text-white shadow-sm shadow-[#00bbff]/30"
                    : "border-zinc-300/70 bg-white/70 text-zinc-600 hover:border-zinc-400",
                )}
                aria-pressed={n.voted}
              >
                <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
                {n.votes}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-zinc-800">
                  {n.textKey != null ? t.cta.notes[n.textKey] : n.text}
                </p>
                <p className="mt-2 text-xs text-zinc-500">— {n.mine ? t.cta.you : n.author}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
