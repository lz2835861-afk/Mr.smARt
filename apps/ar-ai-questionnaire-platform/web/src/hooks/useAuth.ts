import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  supabase,
  isRemoteEnabled,
  matchInviteName,
  INVITE_NAMES,
} from "../lib/supabase";

export type AuthStatus =
  | "loading"
  | "signed-in"
  | "signed-out"
  | "remote-disabled"; // env not configured → app runs in local-only mode

export interface UseAuthResult {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  /** Sign in via team-name invite. Validates against INVITE_NAMES then
   *  creates a Supabase anonymous session with display_name in metadata. */
  signInWithName: (name: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isRemoteEnabled ? "loading" : "remote-disabled",
  );

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setStatus(data.session ? "signed-in" : "signed-out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setStatus(sess ? "signed-in" : "signed-out");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithName = useCallback(
    async (name: string): Promise<{ ok: boolean; error?: string }> => {
      if (!supabase) {
        return { ok: false, error: "Remote sync not configured." };
      }
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return { ok: false, error: "请输入名字" };
      if (!matchInviteName(trimmed)) {
        return {
          ok: false,
          error: `名字不在团队列表（${INVITE_NAMES.join(", ")}）`,
        };
      }
      const { error } = await supabase.auth.signInAnonymously({
        options: { data: { display_name: trimmed } },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    status,
    user: session?.user ?? null,
    session,
    signInWithName,
    signOut,
  };
}
