/**
 * DEMO AUTHENTICATION. Passwords are hashed with scrypt and sessions are random tokens stored hashed
 * server-side, delivered in an httpOnly cookie. This is a sound pattern, but the surrounding demo
 * pieces are NOT production-ready: no email verification, no password reset, no CSRF tokens beyond
 * SameSite=Lax, in-memory (per-process) rate limiting, and a JSON-file user store.
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import { ApiError } from "./http";
import { mutateDb, readDb, type DB, type UserRecord } from "./db";

export const SESSION_COOKIE = "sb_session";
export const INDUSTRY_SESSION_COOKIE = "sb_industry_session";
export const ACADEMIA_SESSION_COOKIE = "sb_academia_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/** Adds a session row (inside an existing mutateDb) and returns the raw token. */
export function addSession(db: DB, userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.sessions.push({ tokenHash: sha(token), userId, expires: Date.now() + SESSION_MS });
  return token;
}

export async function setSessionCookie(token: string, cookieName = SESSION_COOKIE) {
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearSession(cookieName = SESSION_COOKIE) {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  store.delete(cookieName);
  if (token) {
    const h = sha(token);
    await mutateDb((db) => {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== h);
    });
  }
}

export async function getSessionUser(cookieName = SESSION_COOKIE): Promise<UserRecord | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const h = sha(token);
  const db = await readDb();
  const s = db.sessions.find((x) => x.tokenHash === h && x.expires > Date.now());
  return s ? (db.users.find((u) => u.id === s.userId) ?? null) : null;
}

export async function requireUser(): Promise<UserRecord> {
  const u = await getSessionUser(SESSION_COOKIE);
  if (!u) throw new ApiError(401, "Please log in to continue.");
  if (u.role && u.role !== "student") {
    throw new ApiError(403, "Access restricted to student accounts.");
  }
  return u;
}

export async function getIndustrySessionUser(): Promise<UserRecord | null> {
  return getSessionUser(INDUSTRY_SESSION_COOKIE);
}

export async function requireIndustryUser(): Promise<UserRecord> {
  const u = await getIndustrySessionUser();
  if (!u) throw new ApiError(401, "Please log in to your recruiter account to continue.");
  if (u.role && u.role !== "recruiter") {
    throw new ApiError(403, "Access restricted to industry recruiter accounts.");
  }
  return u;
}

export async function getAcademiaSessionUser(): Promise<UserRecord | null> {
  return getSessionUser(ACADEMIA_SESSION_COOKIE);
}

export async function requireAcademiaUser(): Promise<UserRecord> {
  const u = await getAcademiaSessionUser();
  if (!u) throw new ApiError(401, "Please log in to your institution account to continue.");
  if (u.role && u.role !== "academia") {
    throw new ApiError(403, "Access restricted to academia accounts.");
  }
  return u;
}

/** Tiny in-memory throttle (per server process) for login attempts with automatic cleanup. */
const attempts = new Map<string, { n: number; reset: number }>();
export function throttle(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();

  // Periodic pruning to prevent memory leak
  if (attempts.size > 200) {
    for (const [k, v] of attempts.entries()) {
      if (v.reset < now) attempts.delete(k);
    }
  }

  const a = attempts.get(key);
  if (!a || a.reset < now) {
    attempts.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  a.n += 1;
  if (a.n > limit) throw new ApiError(429, "Too many attempts. Please wait a few minutes and try again.");
}
export const clearThrottle = (key: string) => attempts.delete(key);

const RESET_TOKEN_MS = 15 * 60 * 1000; // 15 minutes single-use

export function createPasswordResetToken(db: DB, userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  if (!db.passwordResetTokens) db.passwordResetTokens = [];
  // Invalidate any previous unused tokens for this user
  for (const t of db.passwordResetTokens) {
    if (t.userId === userId) t.used = true;
  }
  db.passwordResetTokens.push({
    tokenHash: sha(token),
    userId,
    expires: Date.now() + RESET_TOKEN_MS,
    used: false,
  });
  return token;
}

export function findValidResetTokenUser(db: DB, rawToken: string): { user: UserRecord; resetRecord: { tokenHash: string; userId: string; expires: number; used?: boolean } } | null {
  if (!rawToken || typeof rawToken !== "string") return null;
  const h = sha(rawToken);
  const entry = (db.passwordResetTokens || []).find((x) => x.tokenHash === h && !x.used && x.expires > Date.now());
  if (!entry) return null;
  const user = db.users.find((u) => u.id === entry.userId);
  return user ? { user, resetRecord: entry } : null;
}
