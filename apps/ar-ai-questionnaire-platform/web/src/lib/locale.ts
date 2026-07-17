import type { AnswerState } from "../hooks/useAnswerMeta";
import type { Role } from "./supabase";

/** Parse "1.2 Top 3 competitors · 三大竞品" → num + EN + ZH segments. */
export function parseBilingualTitle(title: string) {
  const m = title.match(/^(\d+\.\d+)\s+(.*)$/);
  if (!m) {
    return { num: "", en: title, zh: title, displayZh: title };
  }
  const rest = m[2];
  const parts = rest.split(" · ").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const zh = parts[parts.length - 1]!;
    const en = parts.slice(0, -1).join(" · ");
    return { num: m[1]!, en, zh, displayZh: zh };
  }
  return { num: m[1]!, en: rest, zh: rest, displayZh: rest };
}

/** Chinese section label from "Business · 业务". */
export function sectionLabelZh(title: string) {
  const parts = title.split(" · ").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1]! : title;
}

export const STATE_LABEL: Record<AnswerState, string> = {
  "NOT STARTED": "未开始",
  "AI DRAFTED": "AI 初稿",
  "PRODUCT REVIEW": "待产品核对",
  "KEVIN REVIEW": "待 Kevin 确认",
  READY: "已定稿",
  SUBMITTED: "已提交",
  BLOCKED: "阻塞",
};

export const ROLE_LABEL: Record<Role, string> = {
  product: "产品",
  kevin: "Kevin",
  ar: "AR",
};
