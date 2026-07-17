import type { ReactNode } from "react";
import { Tooltip } from "@heroui/react";
import { cn } from "@/lib/utils";

export interface Author {
  id?: string;
  name: string;
  avatar: string;
  role: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

const SIZE_CLASS = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
  xl: "size-14 text-base",
} as const;

function initials(name: string) {
  return name
    .replace(/\s+/g, "")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  author: Author;
  avatarSize?: keyof typeof SIZE_CLASS;
  avatarClassName?: string;
  trigger?: ReactNode;
  children?: ReactNode;
}

/** GAIA-style author avatar + hover card (name + role). */
export function AuthorTooltip({
  author,
  avatarSize = "sm",
  avatarClassName,
  trigger,
  children,
}: Props) {
  const avatarEl = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-surface font-semibold text-muted cursor-help",
        SIZE_CLASS[avatarSize],
        avatarClassName,
      )}
    >
      {author.avatar ? (
        <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
      ) : (
        initials(author.name)
      )}
    </span>
  );

  return (
    <Tooltip>
      <Tooltip.Trigger>{trigger ?? avatarEl}</Tooltip.Trigger>
      <Tooltip.Content className="p-0 rounded-xl overflow-hidden max-w-[240px]">
        <div className="flex flex-col gap-2 p-3">
          <div className="flex flex-row items-center gap-3">
            <span className="inline-flex size-10 shrink-0 overflow-hidden rounded-full border border-border">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#00bbff]/10 text-sm font-semibold text-[#00bbff]">
                  {initials(author.name)}
                </span>
              )}
            </span>
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-medium text-foreground truncate">{author.name}</span>
              <span className="text-xs text-muted truncate">{author.role}</span>
            </div>
          </div>
          {children}
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}

interface StackProps {
  authors: Author[];
  max?: number;
  avatarSize?: keyof typeof SIZE_CLASS;
}

export function AuthorTooltipStack({ authors, max = 3, avatarSize = "sm" }: StackProps) {
  const shown = authors.slice(0, max);
  const extra = authors.length - shown.length;

  return (
    <div className="flex items-center -space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
      {shown.map((author) => (
        <AuthorTooltip
          key={author.id ?? author.name}
          author={author}
          avatarSize={avatarSize}
        />
      ))}
      {extra > 0 && (
        <span className="inline-flex size-7 items-center justify-center rounded-full border-2 border-border bg-surface-secondary text-[10px] font-semibold text-muted z-10">
          +{extra}
        </span>
      )}
    </div>
  );
}
