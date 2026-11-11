"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { TextField } from "@/components/student/ui";
import { validateEmail } from "@/lib/student/validation";

export default function AcademiaForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/academia/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setResetUrl(data?.data?.resetUrl || data?.resetUrl);
      } else {
        setError(data?.error || "Could not process password recovery.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 py-12 bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[130px]" />

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
            <span className="text-xs font-semibold uppercase tracking-wider">Account Recovery</span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
            Reset Academia Password
          </h1>
          <p className="mt-1 text-sm text-sb-muted">
            Enter the verified institutional email address associated with your faculty or placement cell account.
          </p>

          {resetUrl ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="flex-none" />
                  <p className="text-sm font-semibold">Account Verified</p>
                </div>
                <p className="mt-1 text-xs text-emerald-300/90 leading-relaxed">
                  A single-use, 15-minute recovery token has been safely generated for <strong>{email}</strong>.
                </p>
              </div>

              <Link
                href={resetUrl}
                className="btn btn-primary w-full text-center py-2.5 font-semibold text-sm shadow-lg shadow-blue-500/25"
              >
                Proceed to Reset Password →
              </Link>

              <div className="pt-2 text-center">
                <Link href="/academia/login" className="text-xs text-sb-muted hover:text-white">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 px-4 py-2.5 text-xs text-[#ff9fcb] flex items-center gap-2">
                  <ShieldAlert size={16} className="flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <TextField
                label="Institutional Email Address"
                type="email"
                autoComplete="email"
                value={email}
                error={error}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dean@university.ac.in"
              />

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                {busy ? "Verifying Account…" : "Generate Secure Reset Link"}
              </button>

              <p className="border-t border-white/10 pt-4 text-center text-xs text-sb-muted">
                Remember your password?{" "}
                <Link href="/academia/login" className="font-semibold text-sb-cyan hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
