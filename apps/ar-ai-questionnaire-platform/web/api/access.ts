/**
 * Vercel serverless function: GET /api/access?access=<token>
 *
 * Server-side half of the "external allowlist" gate. The woa portal
 * (iOA-protected) embeds this app with `?access=<token>` in the iframe URL.
 * On a valid token we set an HttpOnly session cookie `ar_access=1` so the SPA
 * and subsequent /api/* calls are authorized. Direct public hits without the
 * token are rejected with 401 — the app content stays invisible to outsiders.
 *
 * NOTE: explicit `.js` is NOT required here (this file is the entry), but the
 * shared helper it uses is imported with `.js` because the project is ESM.
 */
interface Req {
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | undefined>;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

const COOKIE = "ar_access";
const MAX_AGE = 60 * 60 * 24; // 24h

export function hasAccessCookie(req: Req): boolean {
  const cookie = req.headers?.cookie ?? "";
  return cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE}=1`));
}

export default async function handler(req: Req, res: Res): Promise<void> {
  // Already holding a valid session cookie → no need to re-present the token.
  if (hasAccessCookie(req)) {
    res.status(200).json({ ok: true });
    return;
  }

  const provided = Array.isArray(req.query?.access)
    ? req.query!.access[0]
    : req.query?.access;
  const expected = process.env.ACCESS_TOKEN;

  if (!expected || provided !== expected) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`,
  );
  res.status(200).json({ ok: true });
}
