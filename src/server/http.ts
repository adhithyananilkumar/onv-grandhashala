import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { findUser, read, write, type DB, type StoredUser } from "./db";

export const SESSION_COOKIE = "onv_session";
/** Readable by the page, so it can switch to the signed-in layout before first paint. Holds no secret. */
export const ROLE_COOKIE = "onv_role";
const SESSION_DAYS = 30;

export const ok = (data: unknown, status = 200) => Response.json(data, { status });
export const fail = (error: string, status = 400, extra?: Record<string, unknown>) => Response.json({ error, ...extra }, { status });

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Wrap a handler: request-time only, and thrown HttpErrors become JSON errors. */
export function handle<A extends unknown[]>(fn: (...a: A) => Promise<Response>) {
  return async (...a: A) => {
    await connection();
    try {
      return await fn(...a);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.message, e.status);
      console.error(e);
      return fail("Something went wrong on our side.", 500);
    }
  };
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try { return (await req.json()) as T; } catch { throw new HttpError(400, "Send JSON in the request body."); }
}

export const hashPin = (pin: string, salt: string) => createHash("sha256").update(`${salt}:${pin}`).digest("hex");
export const newSalt = () => randomBytes(8).toString("hex");

function userFrom(db: DB, token?: string): StoredUser | null {
  if (!token) return null;
  const s = db.sessions[token];
  if (!s || s.exp < Date.now()) return null;
  const u = findUser(db, s.card);
  return u && !u.blocked ? u : null;
}

/** The signed-in member for this request, or null. */
export async function currentUser(db?: DB) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return userFrom(db ?? (await read()), token);
}

export async function requireUser(db?: DB) {
  const u = await currentUser(db);
  if (!u) throw new HttpError(401, "Please sign in first.");
  return u;
}

export async function requireAdmin(db?: DB) {
  const u = await requireUser(db);
  if (u.role !== "admin") throw new HttpError(403, "Only library staff can do this.");
  return u;
}

/** Start a session for this card and set the cookies. */
export async function startSession(card: string, role: string) {
  const token = randomBytes(24).toString("hex");
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  await write((db) => {
    for (const [t, s] of Object.entries(db.sessions)) if (s.exp < Date.now()) delete db.sessions[t];
    db.sessions[token] = { card, exp };
  });
  const jar = await cookies();
  // Secure cookies only over https, so sign-in also works on http://<LAN IP> while testing on a phone.
  const h = await headers();
  const https = h.get("x-forwarded-proto") === "https" || (h.get("origin") ?? "").startsWith("https:");
  const opts = { path: "/", sameSite: "lax" as const, secure: https, maxAge: SESSION_DAYS * 86_400 };
  jar.set(SESSION_COOKIE, token, { ...opts, httpOnly: true });
  jar.set(ROLE_COOKIE, role, opts);
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await write((db) => { delete db.sessions[token]; });
  jar.delete(SESSION_COOKIE);
  jar.delete(ROLE_COOKIE);
}

export const validPhone = (v: unknown) => typeof v === "string" && /^[6-9]\d{9}$/.test(v);
export const validPin = (v: unknown) => typeof v === "string" && /^\d{4}$/.test(v);
export const weakPin = (p: string) => /^(\d)\1+$/.test(p) || "0123456789876543210".includes(p);
export const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
