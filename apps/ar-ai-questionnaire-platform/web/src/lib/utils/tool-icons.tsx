import type { ReactNode } from "react";
import { HugeiconsIcon, ToolsIcon } from "@/components/icons";

export function formatToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getToolCategoryIcon(
  _category: string,
  opts?: { showBackground?: boolean; width?: number; height?: number },
): ReactNode {
  const size = opts?.width ?? 20;
  return <HugeiconsIcon icon={ToolsIcon} size={size} className="text-zinc-400" />;
}
