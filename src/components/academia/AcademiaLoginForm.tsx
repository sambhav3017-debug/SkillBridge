"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { academiaApi } from "@/lib/academia/client";
import { PasswordField, TextField } from "@/components/student/ui";

export default function AcademiaLoginForm({
  expired,
  loggedOut,
}: {
  expired?: boolean;
  loggedOut?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrors({});
    setFormError(null);
    setBusy(true);
    const r = await academiaApi<{ onboarded: boolean }>("/api/academia/auth/login", {
      method: "POST",
      json: { email, password },
    });
    if (r.ok) {
      router.push(r.data.onboarded ? "/academia/dashboard" : "/academia/onboarding");
      router.refresh();
      return;
    }
    setBusy(false);
    if (r.fieldErrors) setErrors(r.fieldErrors);
    setFormError(r.error);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      {expired && (
        <p role="status" className="rounded-xl border border-sb-cyan/40 bg-sb-blue/10 px-4 py-2.5 text-xs text-sb-cyan">
          Your session expired. Please sign in again to continue.
        </p>
      )}
      {loggedOut && (
        <p role="status" className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs text-sb-muted">
          You have been signed out of the Academia Portal.
        </p>
      )}
      {formError && (
        <p role="alert" className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 px-4 py-2.5 text-sm text-[#ff9fcb]">
          {formError}
        </p>
      )}

      <TextField
        label="Institutional email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tpo@university.edu.in"
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex justify-end">
        <Link
          href="/academia/forgot-password"
          className="text-xs text-sb-cyan hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {busy ? "Signing in…" : "Sign In to Academia Portal"}
      </button>
    </form>
  );
}
