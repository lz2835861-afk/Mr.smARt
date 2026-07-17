import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/reports-in-progress";

/**
 * Renders a product's icon.
 * - Branded products (Workbody, Cobody …) with a `logo` set → the image.
 * - Tencent Cloud product lines → a styled monogram tile of their `code`.
 *
 * `size` is the box edge in px. The monogram font scales down for longer codes
 * (e.g. "TDSQL") so it always fits.
 */
export function ProductLogo({
  product,
  size = 48,
  rounded = "rounded-2xl",
  className,
}: {
  product: Product;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  if (product.logo) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-black/5",
          rounded,
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={product.logo}
          alt={product.name}
          width={size}
          height={size}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  // Monogram tile — the code IS the icon for cloud product lines.
  const len = product.code.length;
  const fontSize = Math.round(size * (len >= 5 ? 0.27 : len === 4 ? 0.32 : len === 3 ? 0.38 : 0.44));

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold tracking-tight text-white select-none",
        rounded,
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize,
        background: `linear-gradient(140deg, ${product.accent} 0%, ${product.accent}cc 55%, ${product.accent}99 100%)`,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -8px 16px -8px rgba(0,0,0,0.35)`,
      }}
    >
      {product.code}
    </span>
  );
}
