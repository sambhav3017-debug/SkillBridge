/** Validation helpers shared by client forms and server route handlers. Each returns an error string or null. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRequired(v: string, label: string, max = 200): string | null {
  const t = v.trim();
  if (!t) return `${label} is required.`;
  if (t.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function validateEmail(v: string): string | null {
  const t = v.trim();
  if (!t) return "Email address is required.";
  if (t.length > 254 || !EMAIL_RE.test(t)) return "Enter a valid email address.";
  return null;
}

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "A letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
] as const;

export function validatePassword(v: string): string | null {
  if (!v) return "Password is required.";
  if (v.length > 128) return "Password must be 128 characters or fewer.";
  const failed = PASSWORD_RULES.find((r) => !r.test(v));
  return failed ? `Password needs: ${failed.label.toLowerCase()}.` : null;
}

/** Optional by default. Only http(s) URLs are accepted. */
export function validateUrl(v: string, label: string, required = false): string | null {
  const t = v.trim();
  if (!t) return required ? `${label} is required.` : null;
  if (t.length > 300) return `${label} is too long.`;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return `${label} must start with http:// or https://`;
    if (!u.hostname.includes(".")) return `Enter a valid ${label}.`;
  } catch {
    return `Enter a valid ${label} (including https://).`;
  }
  return null;
}

export function validateGradYear(v: string): string | null {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1990 || n > 2100) return "Enter a valid graduation year.";
  return null;
}

export function validatePastDate(v: string, label: string): string | null {
  if (!v) return `${label} is required.`;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return `Enter a valid ${label.toLowerCase()}.`;
  if (d.getTime() > Date.now() + 86400000) return `${label} cannot be in the future.`;
  return null;
}
