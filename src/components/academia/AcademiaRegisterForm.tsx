"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { academiaApi } from "@/lib/academia/client";
import { INSTITUTION_TYPES } from "@/lib/academia/types";
import { PASSWORD_RULES, validateEmail, validatePassword, validateRequired, validateUrl } from "@/lib/student/validation";
import { PasswordField, SelectField, TextField } from "@/components/student/ui";

type Values = {
  institutionName: string;
  type: string;
  website: string;
  email: string;
  repName: string;
  designation: string;
  city: string;
  state: string;
  accreditation: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  const set = (k: keyof Values, m: string | null) => m && (e[k] = m);
  set("institutionName", validateRequired(v.institutionName, "Official institution name", 140));
  set("website", validateUrl(v.website, "Official website", true));
  set("email", validateEmail(v.email));
  set("repName", validateRequired(v.repName, "Authorized representative name", 80));
  set("designation", validateRequired(v.designation, "Designation / role", 80));
  set("city", validateRequired(v.city, "City", 80));
  set("state", validateRequired(v.state, "State", 80));
  set("password", validatePassword(v.password));
  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password.";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match.";
  if (!v.acceptTerms) e.acceptTerms = "You must accept the terms and privacy policy.";
  return e;
}

export default function AcademiaRegisterForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>({
    institutionName: "",
    type: INSTITUTION_TYPES[0],
    website: "",
    email: "",
    repName: "",
    designation: "Training & Placement Officer",
    city: "",
    state: "",
    accreditation: "",
    password: "",
    confirmPassword: "",
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
      institutionName: true,
      type: true,
      website: true,
      email: true,
      repName: true,
      designation: true,
      city: true,
      state: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });
    if (Object.keys(errs).length) {
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setFormError(null);
    setBusy(true);
    const r = await academiaApi("/api/academia/auth/register", { method: "POST", json: v });
    if (r.ok) {
      setDone(true);
      router.push("/academia/onboarding");
      router.refresh();
      return;
    }
    setBusy(false);
    if (r.fieldErrors) setErrors((p) => ({ ...p, ...r.fieldErrors }));
    setFormError(r.error ?? "Could not register your institution.");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Official institution name"
          value={v.institutionName}
          error={show("institutionName")}
          onChange={(e) => update("institutionName", e.target.value)}
          onBlur={() => blur("institutionName")}
          placeholder="MIT ADT University"
        />
        <SelectField
          label="Institution type"
          options={INSTITUTION_TYPES}
          value={v.type}
          onChange={(e) => update("type", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Official website"
          type="url"
          value={v.website}
          error={show("website")}
          onChange={(e) => update("website", e.target.value)}
          onBlur={() => blur("website")}
          placeholder="https://university.edu.in"
        />
        <TextField
          label="Institutional email"
          type="email"
          autoComplete="email"
          value={v.email}
          error={show("email")}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => blur("email")}
          placeholder="tpo@university.edu.in"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Authorized representative name"
          autoComplete="name"
          value={v.repName}
          error={show("repName")}
          onChange={(e) => update("repName", e.target.value)}
          onBlur={() => blur("repName")}
          placeholder="Dr. Rajeshwari Joshi"
        />
        <TextField
          label="Designation / role"
          value={v.designation}
          error={show("designation")}
          onChange={(e) => update("designation", e.target.value)}
          onBlur={() => blur("designation")}
          placeholder="Dean — Training & Placement"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="City"
          value={v.city}
          error={show("city")}
          onChange={(e) => update("city", e.target.value)}
          onBlur={() => blur("city")}
          placeholder="Pune"
        />
        <TextField
          label="State"
          value={v.state}
          error={show("state")}
          onChange={(e) => update("state", e.target.value)}
          onBlur={() => blur("state")}
          placeholder="Maharashtra"
        />
        <TextField
          label="Accreditation / Affiliation"
          optional
          value={v.accreditation}
          onChange={(e) => update("accreditation", e.target.value)}
          placeholder="UGC / AICTE / NAAC"
        />
      </div>

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
            className="mt-0.5 h-4 w-4 flex-none accent-[#19b8e6]"
          />
          <span>
            I confirm that I am authorized to represent this institution and accept the{" "}
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
          <p role="alert" className="mt-1.5 text-xs text-[#ff7ab8]">
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
          <CheckCircle2 size={16} /> Institution account created. Starting onboarding…
        </p>
      )}

      <button type="submit" disabled={busy || done} className="btn btn-primary w-full">
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {busy ? "Registering institution…" : "Create Institution Account"}
      </button>
    </form>
  );
}
