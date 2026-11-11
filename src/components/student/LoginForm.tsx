"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/student/client";
import { validateEmail } from "@/lib/student/validation";
import { PasswordField, TextField } from "./ui";

/** Only allow same-site /student/... redirects. */
function safeNext(next?: string) {
  return next && /^\/student\/[a-z-]+/.test(next) && !next.startsWith("//") ? next : null;
}

export default function LoginForm({
  next,
  notice,
  onPasswordFocus,
  onPasswordVisibilityChange,
  onEmailFocus,
}: {
  next?: string;
  notice?: string;
  onPasswordFocus?: (focused: boolean) => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  onEmailFocus?: (focused: boolean) => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const check = (em = email, pw = password) => {
    const e: typeof errors = {};
    const m = validateEmail(em);
    if (m) e.email = m;
    if (!pw) e.password = "Password is required.";
    return e;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || done) return;
    const errs = check();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setFormError(null);
    setBusy(true);
    const r = await api<{ onboarded: boolean }>("/api/student/auth/login", { method: "POST", json: { email, password } });
    if (r.ok && r.data) {
      setDone(true);
      router.push(r.data.onboarded ? (safeNext(next) ?? "/student/dashboard") : "/student/onboarding");
      router.refresh();
      return;
    }
    setBusy(false);
    setPassword("");
    if (r.fieldErrors) setErrors(r.fieldErrors);
    setFormError(r.error ?? "Could not log in.");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      {notice && (
        <p role="status" className="rounded-xl border border-sb-cyan/30 bg-sb-blue/10 px-4 py-2.5 text-sm text-sb-cyan">
          {notice}
        </p>
      )}
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => onEmailFocus?.(true)}
        onBlur={() => {
          setErrors(check());
          onEmailFocus?.(false);
        }}
        placeholder="you@college.edu"
      />
      <div>
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => onPasswordFocus?.(true)}
          onBlur={() => onPasswordFocus?.(false)}
          onVisibilityChange={onPasswordVisibilityChange}
        />
        <div className="mt-2 text-right">
          <Link href="/student/forgot-password" className="text-xs text-sb-cyan underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      {formError && (
        <p role="alert" className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 px-4 py-2.5 text-sm text-[#ff9fcb]">
          {formError}
        </p>
      )}
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-sb-cyan/40 bg-sb-blue/10 px-4 py-2.5 text-sm text-sb-cyan">
          <CheckCircle2 size={16} /> Logged in. Redirecting…
        </p>
      )}
      <button type="submit" disabled={busy || done} className="btn btn-primary w-full shadow-lg">
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {busy ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
