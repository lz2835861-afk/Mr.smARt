import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Whether remote sync is configured. If false, the app falls back to localStorage-only mode. */
export const isRemoteEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isRemoteEnabled
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // No OAuth/magic-link redirects in invite-code mode.
        detectSessionInUrl: false,
      },
    })
  : null;

/**
 * Comma-separated list of allowed names. Each name doubles as the soft auth
 * token AND the display name shown in the presence bar / audit columns.
 *
 * NOTE: the names are bundled into the JS, so this is a UI gate, not a real
 * auth control. The actual data protection is "URL is private + anon key only
 * works against this Supabase project + RLS enforces authenticated".
 */
const RAW_INVITE_NAMES =
  (import.meta.env.VITE_INVITE_NAMES as string | undefined) ??
  "meen,april,lindsay,lux,kevin";

export const INVITE_NAMES: string[] = RAW_INVITE_NAMES.split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function matchInviteName(name: string): boolean {
  return INVITE_NAMES.includes(name.trim().toLowerCase());
}

/**
 * Collaboration roles. Drives "我的待办" (my tasks) filtering: each role owns a
 * different set of actionable workflow states.
 *   - product : confirms facts on AI drafts (state PRODUCT REVIEW)
 *   - kevin   : confirms strategic framing (state KEVIN REVIEW)
 *   - ar      : drives drafting / finalization / submission (AI DRAFTED, READY, BLOCKED)
 *
 * Mapping is name → role, overridable via VITE_ROLE_MAP="name:role,...".
 * Unknown names default to "product" (the persona we're expanding to).
 */
export type Role = "product" | "kevin" | "ar";

const RAW_ROLE_MAP =
  (import.meta.env.VITE_ROLE_MAP as string | undefined) ??
  "kevin:kevin,meen:ar,april:ar,lindsay:ar,lux:ar";

const ROLE_MAP: Record<string, Role> = Object.fromEntries(
  RAW_ROLE_MAP.split(",")
    .map((pair) => pair.split(":").map((s) => s.trim().toLowerCase()))
    .filter((kv) => kv.length === 2 && kv[0] && kv[1])
    .map(([name, role]) => [name, role as Role]),
);

export function roleForName(name?: string | null): Role {
  if (!name) return "product";
  return ROLE_MAP[name.trim().toLowerCase()] ?? "product";
}
