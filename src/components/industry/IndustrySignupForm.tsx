"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { industryApi } from "@/lib/industry/client";
import { INDUSTRY_CATEGORIES } from "@/lib/industry/types";
import { PASSWORD_RULES, validateEmail, validatePassword, validateRequired, validateUrl } from "@/lib/student/validation";
import { PasswordField, SelectField, TextField } from "@/components/student/ui";

type Values = {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  recruiterName: string;
  jobTitle: string;
  website: string;
  industry: string;
  acceptTerms: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  const set = (k: keyof Values, m: string | null) => m && (e[k] = m);
  set("companyName", validateRequired(v.companyName, "Company name", 120));
  set("email", validateEmail(v.email));
  set("password", validatePassword(v.password));
  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password.";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match.";
  set("recruiterName", validateRequired(v.recruiterName, "Your full name", 80));
  set("jobTitle", validateRequired(v.jobTitle, "Job title", 80));
  set("website", validateUrl(v.website, "Company website", true));
  set("industry", validateRequired(v.industry, "Industry category", 80));
  if (!v.acceptTerms) e.acceptTerms = "You must accept the terms and privacy policy.";
  return e;
}

export default function IndustrySignupForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    recruiterName: "",
    jobTitle: "",
    website: "",
    industry: INDUSTRY_CATEGORIES[0],
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update = <K extends keyof Values>(k: K, val: Values[K]) => {
    const next = { ...v, [k]: val };
    setV(next);
    if (touched[k] || (k === "password" && touched.confirmPassword)) setErrors(validate(next));
  };
  const blur = (k: keyof Values) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(v));
  };
  const show = (k: keyof Values) => (touched[k] ? errors[k] : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || done) return;
    const errs = validate(v);
    setErrors(errs);
    setTouched({
      companyName: true,
      email: true,
      password: true,
      confirmPassword: true,
      recruiterName: true,
      jobTitle: true,
      website: true,
      industry: true,
      acceptTerms: true,
    });
    if (Object.keys(errs).length) {
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setFormError(null);
    setBusy(true);
    const r = await industryApi("/api/industry/auth/signup", { method: "POST", json: v });
    if (r.ok) {
      setDone(true);
      router.push("/industry/onboarding");
      router.refresh();
      return;
    }
    setBusy(false);
    if (r.fieldErrors) setErrors((p) => ({ ...p, ...r.fieldErrors }));
    setFormError(r.error ?? "Could not create your company account.");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Company name"
          value={v.companyName}
          error={show("companyName")}
          onChange={(e) => update("companyName", e.target.value)}
          onBlur={() => blur("companyName")}
          placeholder="Acme Technologies"
        />
        <SelectField
          label="Industry category"
          options={INDUSTRY_CATEGORIES}
          value={v.industry}
          error={show("industry")}
          onChange={(e) => update("industry", e.target.value)}
        />
      </div>

      <TextField
        label="Company website"
        type="url"
        value={v.website}
        error={show("website")}
        onChange={(e) => update("website", e.target.value)}
        onBlur={() => blur("website")}
        placeholder="https://company.com"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Recruiter's full name"
          autoComplete="name"
          value={v.recruiterName}
          error={show("recruiterName")}
          onChange={(e) => update("recruiterName", e.target.value)}
          onBlur={() => blur("recruiterName")}
          placeholder="Priya Verma"
        />
        <TextField
          label="Recruiter's job title"
          value={v.jobTitle}
          error={show("jobTitle")}
          onChange={(e) => update("jobTitle", e.target.value)}
          onBlur={() => blur("jobTitle")}
          placeholder="Head of Talent Acquisition"
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        autoComplete="email"
        value={v.email}
        error={show("email")}
        onChange={(e) => update("email", e.target.value)}
        onBlur={() => blur("email")}
        placeholder="priya@company.com"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={v.password}
            error={show("password")}
            onChange={(e) => update("password", e.target.value)}
            onBlur={() => blur("password")}
          />
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label="Password requirements">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(v.password);
              return (
                <li key={r.label} className={`flex items-center gap-1 ${ok ? "text-sb-cyan" : "text-sb-muted"}`}>
                  {ok ? <CheckCircle2 size={12} /> : <Circle size={12} />} {r.label}
                </li>
              );
            })}
          </ul>
        </div>
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={v.confirmPassword}
          error={show("confirmPassword")}
          onChange={(e) => update("confirmPassword", e.target.value)}
          onBlur={() => blur("confirmPassword")}
        />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-sb-muted">
          <input
            type="checkbox"
            checked={v.acceptTerms}
            onChange={(e) => update("acceptTerms", e.target.checked)}
            onBlur={() => blur("acceptTerms")}
            aria-invalid={show("acceptTerms") ? true : undefined}
            aria-describedby={show("acceptTerms") ? "ind-terms-err" : undefined}
            className="mt-0.5 h-4 w-4 flex-none accent-[#19b8e6]"
          />
          <span>
            I accept the{" "}
            <Link href="/legal#terms" target="_blank" className="text-sb-cyan underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal#privacy" target="_blank" className="text-sb-cyan underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {show("acceptTerms") && (
          <p id="ind-terms-err" role="alert" className="mt-1.5 text-xs text-[#ff7ab8]">
            {errors.acceptTerms}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="rounded-xl border border-sb-pink/40 bg-sb-pink/5 px-4 py-2.5 text-sm text-[#ff9fcb]">
          {formError}
        </p>
      )}
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-sb-cyan/40 bg-sb-blue/10 px-4 py-2.5 text-sm text-sb-cyan">
          <CheckCircle2 size={16} /> Company account created. Starting onboarding…
        </p>
      )}

      <button type="submit" disabled={busy || done} className="btn btn-primary w-full">
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {busy ? "Creating company account…" : "Create Company Account"}
      </button>
    </form>
  );
}
