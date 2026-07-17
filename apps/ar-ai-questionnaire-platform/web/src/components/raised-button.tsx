import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { getContrastColor, getLuminance, parseColor } from "@/lib/color-utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center dark:bg-zinc-500 dark:text-white whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 shadow-md before:absolute before:inset-0 before:border-t before:border-white/40 before:bg-gradient-to-b before:from-white/20 before:to-transparent cursor-pointer transition-transform duration-200 active:scale-[0.96] subpixel-antialiased gap-2",
  {
    variants: {
      variant: { default: "" },
      size: {
        default: "h-10 px-4 py-2 rounded-xl before:rounded-xl",
        sm: "h-9 rounded-lg px-3 before:rounded-xl",
        lg: "h-11 rounded-lg px-8 before:rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  color?: string;
}

const RaisedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, style = {}, ...props }, ref) => {
    const dynamicStyles = React.useMemo(() => {
      if (!color) return {};
      try {
        const rgb = parseColor(color);
        if (!rgb) return {};
        const textColor = getContrastColor(getLuminance(rgb));
        return {
          backgroundColor: color,
          color: textColor,
          borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
          "--hover-bg": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
          "--border": `rgba(255, 255, 255, 0.6)`,
          "--gradient": `rgba(255, 255, 255, 0.3)`,
          "--shadow-color": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
          boxShadow: `0 4px 5px 0px var(--shadow-color)`,
          transition: "all 0.2s ease-in-out",
        } as React.CSSProperties;
      } catch {
        return {};
      }
    }, [color]);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          color &&
            "hover:bg-[color:var(--hover-bg)] before:border-[color:var(--border)] before:from-[color:var(--gradient)] hover:opacity-80 overflow-hidden",
        )}
        ref={ref}
        style={{ ...style, ...dynamicStyles }}
        {...props}
      />
    );
  },
);
RaisedButton.displayName = "RaisedButton";

// Note: `buttonVariants` stays module-local (not re-exported) to satisfy the
// react-refresh/only-export-components lint rule. Nothing else consumes it.
export { RaisedButton };
