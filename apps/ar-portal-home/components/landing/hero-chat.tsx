"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { MessageBubble } from "@/components/ui/message-bubble";
import { useT } from "@/lib/i18n";

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3">
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="h-1.5 w-1.5 rounded-full bg-zinc-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
        />
      ))}
    </div>
  );
}

export function HeroChat() {
  const t = useT();
  const SCRIPT = t.hero.chat.lines;
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    if (i < SCRIPT.length) {
      const isReceived = SCRIPT[i].v === "received";
      setTyping(isReceived);
      t1 = setTimeout(
        () => {
          setTyping(false);
          setI((n) => n + 1);
        },
        i === 0 ? 500 : isReceived ? 1150 : 850,
      );
    } else {
      t2 = setTimeout(() => setI(0), 4200);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i]);

  return (
    <div className="relative w-full max-w-lg rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_70px_-30px_rgba(0,82,217,0.45)]">
      {/* window header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <div className="ml-2 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Mr.smARt"
            width={20}
            height={20}
            className="h-5 w-5 rounded-md object-cover"
          />
          <span className="text-sm font-medium text-zinc-700">Mr.smARt</span>
        </div>
        <span className="ml-auto text-xs text-zinc-400">{t.hero.chat.drafting}</span>
      </div>

      {/* conversation */}
      <div className="flex min-h-[430px] flex-col justify-end gap-2.5 px-8 py-5">
        {SCRIPT.slice(0, i).map((b, idx) => (
          <motion.div
            key={`${idx}-${b.t}`}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={cn("max-w-[82%]", b.v === "sent" ? "self-end" : "self-start")}
          >
            <MessageBubble message={b.t} variant={b.v} />
          </motion.div>
        ))}

        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start"
          >
            <TypingDots />
          </motion.div>
        )}
      </div>

      {/* faux composer */}
      <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3">
        <div className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-400">
          {t.hero.chat.composer}
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#00bbff] text-white">
          ↑
        </span>
      </div>
    </div>
  );
}
