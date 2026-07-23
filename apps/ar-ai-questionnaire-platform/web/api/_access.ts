/**
 * Shared access-gate helper for /api routes.
 * Returns true if the request carries a valid `ar_access` session cookie
 * (issued by /api/access after the portal token is verified). If not, it
 * writes a 401 and returns false so the caller can bail out.
 */
import { hasAccessCookie } from "./access.js";

interface Req {
  headers?: Record<string, string | undefined>;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
}

export function requireAccess(req: Req, res: Res): boolean {
  if (hasAccessCookie(req)) return true;
  res.status(401).json({ error: "unauthorized: access token required" });
  return false;
}
