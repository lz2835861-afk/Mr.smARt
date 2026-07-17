/** Track who else is currently editing — uses Supabase Realtime presence. */
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface OnlineUser {
  id: string;
  email: string;
  name: string;
  color: string;
  joinedAt: number;
}

const COLORS = [
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#65a30d",
];

const colorFor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  return COLORS[Math.abs(hash) % COLORS.length];
};

export function usePresence(user: User | null): OnlineUser[] {
  const [online, setOnline] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!supabase || !user) {
      setOnline([]);
      return;
    }
    const displayName =
      (user.user_metadata?.display_name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "User";
    const me: OnlineUser = {
      id: user.id,
      email: user.email ?? "",
      name: displayName,
      // Color hashed from displayName so the same person keeps the same
      // color across reconnects / different sessions / different anon ids.
      color: colorFor(displayName),
      joinedAt: Date.now(),
    };

    // Key channel by displayName, not user.id — invite-code mode means each
    // sign-in creates a fresh anon user.id, but we still want one slot per name.
    const channel = supabase.channel("presence-omdia-rfi", {
      config: { presence: { key: displayName } },
    });

    const computeList = () => {
      const state = channel.presenceState() as Record<string, OnlineUser[]>;
      const all = Object.values(state).flat();
      // Dedupe by display name. Prefer this session's own entry so the
      // "· 你" marker (matched by user.id === selfId in PresenceBar) sticks.
      const dedup = new Map<string, OnlineUser>();
      for (const u of all) {
        const existing = dedup.get(u.name);
        if (!existing || u.id === user.id) {
          dedup.set(u.name, u);
        }
      }
      setOnline([...dedup.values()].sort((a, b) => a.joinedAt - b.joinedAt));
    };

    channel
      .on("presence", { event: "sync" }, computeList)
      .on("presence", { event: "join" }, computeList)
      .on("presence", { event: "leave" }, computeList)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(me);
        }
      });

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [user]);

  return online;
}
