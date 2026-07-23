import { useEffect, useState, type ReactNode } from "react";

/**
 * Client-side half of the external allowlist gate.
 *
 * - If a valid `ar_access` session cookie exists → render the app.
 * - Else if the URL carries `?access=<token>` (the woa portal embeds us with
 *   it) → call /api/access to validate server-side and set the cookie.
 * - Else → show a "无权访问" screen so outsiders never see the content.
 */
const COOKIE = "ar_access";
const TOKEN_PARAM = "access";

function hasCookie(): boolean {
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE}=1`));
}

function readTokenFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(TOKEN_PARAM);
}

function stripTokenFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(TOKEN_PARAM)) return;
  url.searchParams.delete(TOKEN_PARAM);
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

type GateState = "checking" | "granted" | "denied";

export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(hasCookie() ? "granted" : "checking");

  useEffect(() => {
    if (hasCookie()) {
      setState("granted");
      return;
    }
    const token = readTokenFromUrl();
    if (!token) {
      setState("denied");
      return;
    }
    let cancelled = false;
    fetch(`/api/access?access=${encodeURIComponent(token)}`, {
      credentials: "same-origin",
    })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          stripTokenFromUrl();
          setState("granted");
        } else {
          setState("denied");
        }
      })
      .catch(() => {
        if (!cancelled) setState("denied");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "granted") return <>{children}</>;
  if (state === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50">
        <div className="text-sm text-zinc-400">正在校验访问权限…</div>
      </div>
    );
  }
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">无权访问</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          该内容仅限授权用户访问。请通过公司内部门户（iOA 登录）打开，或联系管理员获取访问权限。
        </p>
      </div>
    </div>
  );
}
