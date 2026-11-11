"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { PasswordField } from "@/components/student/ui";
import { PASSWORD_RULES, validatePassword } from "@/lib/student/validation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }
    const errPw = validatePassword(newPassword);
    if (errPw) {
      setError(errPw);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/academia/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/academia/login");
        }, 1800);
      } else {
        setError(data?.error || "Failed to reset password.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-[var(--color-text)]">
            <SkillBridgeWordmark portal="academia" />{" "}
            <span className="text-xs font-semibold text-sb-pink">Academia</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <Link href="/academia/login" className="text-xs text-sb-muted hover:text-[var(--color-text)]">
            ← Sign In
          </Link>
        </div>
      </div>

      <section className="glass p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sb-cyan">
          <KeyRound size={22} />
          <span className="text-xs font-semibold uppercase tracking-wider">Security</span>
        </div>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
          Set New Password
        </h1>
        <p className="mt-1 text-sm text-sb-muted">
          Choose a strong password to protect your institution placement and administration workspace.
        </p>

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-400 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-base font-bold">Password Reset Successful!</p>
              <p className="mt-1 text-xs text-emerald-300/80">
                Your password has been securely updated. Redirecting you to sign in…
              </p>
            </div>
            <Link href="/academia/login" className="btn btn-primary w-full text-center py-2.5 font-semibold text-sm">
              Sign In Now →
            </Link>
          </div>
        ) : !token ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 p-4 text-xs text-[#ff9fcb]">
              <ShieldAlert size={18} className="mb-1 text-sb-pink" />
              <p className="font-semibold">Missing or Invalid Reset Link</p>
              <p className="mt-1 text-sb-muted">
                Please request a password reset link using your registered institutional email.
              </p>
            </div>
            <Link href="/academia/forgot-password" className="btn btn-primary w-full text-center py-2.5 text-sm">
              Go to Account Recovery
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 px-4 py-2.5 text-xs text-[#ff9fcb] flex items-center gap-2">
                <ShieldAlert size={16} className="flex-none" />
                <span>{error}</span>
              </div>
            )}

            <PasswordField
              label="New Password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <PasswordField
              label="Confirm New Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Password requirements helper */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-sb-muted space-y-1">
              <p className="font-semibold text-sb-text">Password requirements:</p>
              {PASSWORD_RULES.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={r.test(newPassword) ? "text-emerald-400 font-bold" : "text-sb-muted"}>
                    {r.test(newPassword) ? "✓" : "•"}
                  </span>
                  <span className={r.test(newPassword) ? "text-emerald-400" : ""}>{r.label}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? "Updating Password…" : "Update Password"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function AcademiaResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 py-12 bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[130px]" />
      <Suspense fallback={<div className="text-center text-sb-muted">Loading reset interface…</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
