"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// variants keyed by `${length}-${tone}` — length 0..2, tone 0..1
const VARIANTS: Record<string, string> = {
  "0-0": "TDSQL replicates synchronously across 5 regions (RPO ≈ 0, RTO < 30s).",
  "0-1": "TDSQL copies your data across 5 regions almost instantly — you basically never lose anything.",
  "1-0":
    "TDSQL provides synchronous, strongly-consistent replication across 5 regions, achieving an RPO approaching zero and an RTO under 30 seconds.",
  "1-1":
    "TDSQL keeps live copies of your database in 5 regions and fails over in under 30 seconds, so you basically never lose data.",
  "2-0":
    "TDSQL delivers synchronous, strongly-consistent replication across 5 geographic regions with configurable asynchronous modes, achieving an RPO approaching zero and an automatic-failover RTO under 30 seconds, validated through scheduled DR drills.",
  "2-1":
    "TDSQL keeps live copies of your database in 5 regions worldwide. If one region goes down it automatically switches over in under 30 seconds with virtually no data lost — and you can run regular drills to prove it.",
};

function Dial({
  label,
  value,
  ends,
  onChange,
}: {
  label: string;
  value: number;
  ends: string[];
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600">{label}</span>
        <span className="font-semibold text-[#00bbff]">{ends[value]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={ends.length - 1}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[#00bbff]"
        aria-label={label}
      />
      <div className="mt-0.5 flex justify-between text-[11px] text-zinc-400">
        {ends.map((e) => (
          <span key={e}>{e}</span>
        ))}
      </div>
    </div>
  );
}

export function ToneDials() {
  const d = useT().features.f4.dials;
  const [len, setLen] = useState(1);
  const [tone, setTone] = useState(0);
  const text = VARIANTS[`${len}-${tone}`];
  const words = text.trim().split(/\s+/).length;

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500">
          {d.q}
        </span>
        <span className="text-xs tabular-nums text-zinc-400">
          {words} {d.wordsSuffix}
        </span>
      </div>

      {/* the answer, with the selected sentence highlighted */}
      <div className="min-h-[132px] rounded-2xl bg-zinc-50 p-4 text-[15px] leading-relaxed text-zinc-700 sm:min-h-[116px]">
        <span className="text-zinc-400">{d.lead}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={text}
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
            transition={{ duration: 0.22 }}
            className="rounded-md bg-sky-100/80 px-1 py-0.5 text-zinc-900 decoration-sky-300 [box-decoration-break:clone]"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* the dials */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Dial label={d.length} value={len} ends={d.lengths} onChange={setLen} />
        <Dial label={d.tone} value={tone} ends={d.tones} onChange={setTone} />
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 transition",
          )}
        />
        {d.footer}
      </p>
    </div>
  );
}
