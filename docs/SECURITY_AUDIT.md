# SkillBridge Security Audit, RBAC & Hardening Guide

## 1. Security Posture Assessment

### 1.1 Evaluated Threat Vectors & Existing Safeguards

| Threat Vector | Vulnerability Level | Mitigation in Place | Production Requirement |
|---|---|---|---|
| **SQL Injection** | **LOW (Protected)** | Prisma ORM parameterizes all SQL queries automatically. | Retain Prisma; never use raw string concatenation in `$queryRaw`. |
| **Cross-Site Scripting (XSS)** | **LOW (Protected)** | React 19 automatically escapes JSX interpolations. | Maintain Content Security Policy (CSP) headers disallowing unsafe-eval scripts. |
| **Cross-Site Request Forgery (CSRF)** | **MEDIUM (Addressed)** | Cookies use `SameSite=Lax`, `HttpOnly=true`, `Path=/`. | Implement anti-CSRF token verification on state-changing non-GET mutations. |
| **Broken Object-Level Auth (BOLA / IDOR)** | **HIGH (Audited)** | Existing routes checked `u.role`, but lacked explicit owner-matching on sub-resources. | Enforce row-level tenant validation (`where: { id: taskId, studentId: user.studentId }`). |
| **Credential Cracking / Brute Force** | **MEDIUM (Addressed)** | `throttle()` in `src/lib/server/auth.ts` limits login attempts per IP. | Migrate in-memory throttle to distributed Redis sliding-window rate limiter. |
| **File Upload Exploits** | **MEDIUM (Addressed)** | Resumes checked file extensions on disk. | Move to presigned direct-to-R2 upload with magic-byte verification and malware scan. |

---

## 2. Authentication & Session Architecture

### 2.1 Password Hashing Specification
SkillBridge enforces salted key derivation using Node.js crypto `scrypt`:
- **Salt**: 16 bytes of cryptographically secure pseudo-random bytes (`crypto.randomBytes(16)`).
- **Digest Length**: 64 bytes.
- **Storage Format**: `scrypt$<saltHex>$<hashHex>`.
- **Verification**: Evaluated with `crypto.timingSafeEqual()` to neutralize side-channel timing attacks.

### 2.2 Cookie Configuration
```typescript
cookies().set("sb_session", token, {
  httpOnly: true,                                // Inaccessible to client JavaScript
  sameSite: "lax",                               // CSRF protection for cross-site requests
  secure: process.env.NODE_ENV === "production", // Enforced over HTTPS only
  path: "/",
  maxAge: 7 * 24 * 60 * 60,                     // 7 days
});
```

---

## 3. Role-Based Access Control (RBAC) Matrix

SkillBridge maintains 4 distinct user roles:

| Action / Endpoint | Anonymous Visitor | Student | Recruiter | Academia / Faculty | Platform Admin |
|---|---|---|---|---|---|
| **View Landing & Public Portals** | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| **Browse Open Opportunities** | ALLOW (read-only) | ALLOW | ALLOW | ALLOW | ALLOW |
| **Apply for Opportunities** | DENY (401) | ALLOW | DENY (403) | DENY (403) | ALLOW |
| **Post Job / Capstone Offerings** | DENY (401) | DENY (403) | ALLOW (own company) | DENY (403) | ALLOW |
| **Manage ATS Pipeline & Candidates** | DENY (401) | DENY (403) | ALLOW (own company) | DENY (403) | ALLOW |
| **View Institutional Analytics** | DENY (401) | DENY (403) | DENY (403) | ALLOW (own university) | ALLOW |
| **Access System Telemetry & Audits**| DENY (401) | DENY (403) | DENY (403) | DENY (403) | ALLOW |

---

## 4. Multi-Tenant Data Isolation (IDOR Prevention)

In production PostgreSQL, multi-tenant safety is guaranteed at two levels:

### 4.1 Application-Level Scoping
Every data mutation explicitly binds the authenticated user's ID to the query filter:
```typescript
// SECURE: Enforces that student can only update their own tasks
await prisma.studentTask.update({
  where: {
    id: taskId,
    studentId: currentStudent.id, // IDOR barrier
  },
  data: { completed: true },
});
```

### 4.2 PostgreSQL Row-Level Security (RLS)
When deployed on Supabase or PostgreSQL with RLS enabled:
```sql
ALTER TABLE "StudentTask" ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_own_tasks ON "StudentTask"
  FOR ALL
  USING (student_id = auth.uid());
```

---

## 5. Secret Hygiene & Environment Variable Auditing

1. **Zero Hardcoded Secrets**: Secrets (`DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `STORAGE_SECRET_KEY`) must strictly be injected via environment variables or secret vaults (AWS Secrets Manager / Doppler / Vercel Environment Variables).
2. **Never Commit `.env`**: `.gitignore` explicitly excludes `.env`, `.env.local`, and `.data/demo-db.json`.
3. **Session Secret Rotation**: Ensure session tokens stored in the database are SHA-256 hashed so that raw session tokens can never be recovered from a database backup dump.
