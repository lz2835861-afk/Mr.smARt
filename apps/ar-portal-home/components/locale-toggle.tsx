"use client";

import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/dictionaries";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "zh", label: "中" },
  { value: "en", label: "EN" },
];

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white/70 p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language / 语言"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLocale(o.value)}
          aria-pressed={locale === o.value}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            locale === o.value
              ? "bg-[#00bbff] text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
