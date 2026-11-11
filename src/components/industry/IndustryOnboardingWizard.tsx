"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Clock, Loader2, LogOut, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import { imageToAvatar } from "@/lib/student/image";
import { validateEmail, validateRequired, validateUrl } from "@/lib/student/validation";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";
import { COMPANY_SIZES, INDUSTRY_CATEGORIES, type VerificationState } from "@/lib/industry/types";
import { useIndustry } from "./IndustryProvider";
import { Avatar, SelectField, TagInput, TextAreaField, TextField, ToggleGroup } from "@/components/student/ui";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

const STEPS = ["Company Info", "Recruiter Info", "Hiring Preferences", "Review & Verify"] as const;

export function VerificationBadge({ status }: { status: VerificationState }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        <ShieldCheck size={14} /> Verified Employer
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/50 bg-sb-blue/20 px-3 py-1 text-xs font-semibold text-sb-cyan">
        <Clock size={14} /> Pending verification review
      </span>
    );
  }
  if (status === "changes_requested") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-pink/50 bg-sb-pink/10 px-3 py-1 text-xs font-semibold text-sb-pink">
        <ShieldAlert size={14} /> Additional info required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-sb-muted">
      Verification not submitted
    </span>
  );
}

export default function IndustryOnboardingWizard() {
  const router = useRouter();
  const { data, updateMe, notify, logout } = useIndustry();
  const c = data.company;
  const r = data.recruiter;

  const [d, setD] = useState({
    companyName: c.name,
    logo: c.logo,
    website: c.website,
    industry: c.industry || INDUSTRY_CATEGORIES[0],
    size: c.size || COMPANY_SIZES[1],
    headquarters: c.headquarters,
    description: c.description,
    recruiterName: r.name,
    jobTitle: r.jobTitle,
    email: r.email,
    contactPreference: r.contactPreference,
    roles: c.hiringPreferences.roles,
    skills: c.hiringPreferences.skills,
    hireInterns: c.hiringPreferences.hireInterns,
    hireGraduates: c.hiringPreferences.hireGraduates,
    locations: c.hiringPreferences.locations,
    modes: c.hiringPreferences.modes as WorkMode[],
  });

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));

  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      const m1 = validateRequired(d.companyName, "Company name", 120);
      const m2 = validateUrl(d.website, "Company website", true);
      const m3 = validateRequired(d.headquarters, "Headquarters or location", 120);
      if (m1) e.companyName = m1;
      if (m2) e.website = m2;
      if (m3) e.headquarters = m3;
      if (d.description.length > 1200) e.description = "Description must be 1,200 characters or fewer.";
    }
    if (s === 1) {
      const m1 = validateRequired(d.recruiterName, "Full name", 80);
      const m2 = validateRequired(d.jobTitle, "Job title", 80);
      const m3 = validateEmail(d.email);
      if (m1) e.name = m1;
      if (m2) e.jobTitle = m2;
      if (m3) e.email = m3;
    }
    return e;
  }

  async function persist(extra?: { onboarded?: boolean; submitForVerification?: boolean }) {
    const res = await updateMe({
      company: {
        name: d.companyName,
        logo: d.logo,
        website: d.website,
        industry: d.industry,
        size: d.size,
        headquarters: d.headquarters,
        description: d.description,
        hiringPreferences: {
          roles: d.roles,
          skills: d.skills,
          hireInterns: d.hireInterns,
          hireGraduates: d.hireGraduates,
          locations: d.locations,
          modes: d.modes,
        },
        submitForVerification: extra?.submitForVerification,
      },
      recruiter: {
        name: d.recruiterName,
        jobTitle: d.jobTitle,
        email: d.email,
        contactPreference: d.contactPreference,
        onboarded: extra?.onboarded,
      },
    });
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error ?? "Could not save progress.");
    }
    return res.ok;
  }

  async function next() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await persist();
    setBusy(false);
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function finish(submitVerification: boolean) {
    if (busy) return;
    for (const s of [0, 1]) {
      const e = validateStep(s);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        return;
      }
    }
    setBusy(true);
    const ok = await persist({ onboarded: true, submitForVerification: submitVerification });
    if (ok) {
      notify(
        "success",
        submitVerification
          ? "Company profile submitted for verification review!"
          : "Setup saved. Welcome to your Industry workspace!",
      );
      router.replace("/industry/dashboard");
      router.refresh();
    } else setBusy(false);
  }

  async function pickLogo(file?: File) {
    if (!file) return;
    try {
      set("logo", await imageToAvatar(file));
      setErrors((e) => ({ ...e, logo: "" }));
    } catch (err) {
      setErrors((e) => ({ ...e, logo: err instanceof Error ? err.message : "Could not use that image." }));
    }
  }

  const last = step === STEPS.length - 1;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[130px]" />
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SkillBridge home">
          <Logo size={28} />
          <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
            <SkillBridgeWordmark portal="industry" />{" "}
            <span className="text-xs font-semibold text-sb-pink">Industry</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => finish(false)}
            className="text-xs text-sb-cyan underline-offset-2 hover:underline"
          >
            Save &amp; finish later
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 text-sm text-sb-muted hover:text-white"
          >
            <LogOut size={15} aria-hidden="true" /> Log out
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-16">
        <nav aria-label="Company onboarding progress" className="mb-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <span
                  className={`grid h-7 w-7 flex-none place-items-center rounded-full border text-xs font-bold transition-colors ${
                    i < step
                      ? "border-sb-cyan bg-sb-blue/40 text-white"
                      : i === step
                        ? "border-sb-cyan text-sb-cyan shadow-[0_0_14px_-3px_rgba(25,184,230,0.8)]"
                        : "border-white/20 text-sb-muted"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-white" : "text-sb-muted"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className={`h-px flex-1 ${i < step ? "bg-sb-cyan/60" : "bg-white/10"}`} />
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-sb-muted sm:hidden">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </nav>

        <section className="glass rise p-6 sm:p-8" aria-labelledby="ind-step-title" key={step}>
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 id="ind-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Company information
                </h1>
                <p className="mt-1 text-sm text-sb-muted">
                  Introduce your organization to students and campus partners.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={d.companyName || "Co"} src={d.logo} size={72} />
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    aria-label="Upload company logo"
                    onChange={(e) => pickLogo(e.target.files?.[0])}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-glass btn-sm !px-4"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera size={14} /> {d.logo ? "Change logo" : "Upload logo"}
                    </button>
                    {d.logo && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("logo", "")}>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-sb-muted">Optional square PNG/JPG/WebP logo.</p>
                  {errors.logo && (
                    <p role="alert" className="mt-1 text-xs text-[#ff7ab8]">
                      {errors.logo}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Company name"
                  value={d.companyName}
                  error={errors.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                />
                <TextField
                  label="Website"
                  type="url"
                  value={d.website}
                  error={errors.website}
                  onChange={(e) => set("website", e.target.value)}
                />
                <SelectField
                  label="Industry"
                  options={INDUSTRY_CATEGORIES}
                  value={d.industry}
                  onChange={(e) => set("industry", e.target.value)}
                />
                <SelectField
                  label="Company size"
                  options={COMPANY_SIZES}
                  value={d.size}
                  onChange={(e) => set("size", e.target.value)}
                />
              </div>

              <TextField
                label="Headquarters / location"
                value={d.headquarters}
                error={errors.headquarters}
                onChange={(e) => set("headquarters", e.target.value)}
                placeholder="e.g. Bengaluru, India"
              />
              <TextAreaField
                label="Short company description"
                optional
                rows={4}
                maxLength={1200}
                value={d.description}
                error={errors.description}
                onChange={(e) => set("description", e.target.value)}
                hint={`${d.description.length}/1200 · What does your company build and why should students join?`}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 id="ind-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Recruiter information
                </h1>
                <p className="mt-1 text-sm text-sb-muted">Your primary recruiting profile and contact preferences.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  value={d.recruiterName}
                  error={errors.name}
                  onChange={(e) => set("recruiterName", e.target.value)}
                />
                <TextField
                  label="Job title"
                  value={d.jobTitle}
                  error={errors.jobTitle}
                  onChange={(e) => set("jobTitle", e.target.value)}
                />
              </div>
              <TextField
                label="Work email"
                type="email"
                value={d.email}
                error={errors.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <SelectField
                label="Candidate contact preference"
                options={["Both", "In-app messages", "Email"] as const}
                value={d.contactPreference}
                onChange={(e) =>
                  set("contactPreference", e.target.value as "Email" | "In-app messages" | "Both")
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 id="ind-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Hiring preferences
                </h1>
                <p className="mt-1 text-sm text-sb-muted">
                  Configure the roles, skills, and work modes your team recruits for.
                </p>
              </div>
              <TagInput
                label="Roles you hire for"
                optional
                value={d.roles}
                onChange={(v) => set("roles", v)}
                placeholder="e.g. Frontend Intern, Backend Engineer"
              />
              <TagInput
                label="Preferred skills & tech stack"
                optional
                value={d.skills}
                onChange={(v) => set("skills", v)}
                placeholder="e.g. React, Python, SQL"
              />
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] text-sm">
                  <span>Hiring interns / co-ops</span>
                  <SkillBridgeToggle
                    checked={d.hireInterns}
                    onChange={(next) => set("hireInterns", next)}
                    aria-label="Hiring interns / co-ops"
                    accent="cyan"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] text-sm">
                  <span>Hiring graduating students (Full-time)</span>
                  <SkillBridgeToggle
                    checked={d.hireGraduates}
                    onChange={(next) => set("hireGraduates", next)}
                    aria-label="Hiring graduating students (Full-time)"
                    accent="cyan"
                  />
                </div>
              </div>
              <TagInput
                label="Hiring locations"
                optional
                value={d.locations}
                onChange={(v) => set("locations", v)}
                placeholder="e.g. Pune, Bengaluru, Remote"
              />
              <ToggleGroup
                legend="Supported work modes"
                options={WORK_MODES}
                value={d.modes}
                onChange={(v) => set("modes", v)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 id="ind-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                    Review &amp; submit for verification
                  </h1>
                  <p className="mt-1 text-sm text-sb-muted">
                    Confirm your company profile details before entering the workspace.
                  </p>
                </div>
                <VerificationBadge status={c.verificationStatus} />
              </div>

              <div className="rounded-xl border border-sb-cyan/30 bg-sb-blue/10 p-4 text-xs leading-relaxed text-sb-muted">
                <strong className="text-white">Transparent Verification Policy:</strong> Submitting your company profile
                places it in <span className="text-sb-cyan">Pending verification review</span>. Because an external
                administrative review backend is not connected in this demo environment, verification is never falsely
                auto-granted by the frontend. You can immediately post jobs and evaluate candidates while review is pending.
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Company</h2>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={d.companyName} src={d.logo} size={48} />
                  <div>
                    <p className="font-semibold">{d.companyName}</p>
                    <p className="text-xs text-sb-muted">
                      {[d.industry, d.size, d.headquarters].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-sb-cyan">{d.website}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-sb-muted">{d.description || "No company overview added yet."}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Recruiter</h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <p className="text-sm font-medium">
                  {d.recruiterName} · <span className="text-sb-muted">{d.jobTitle}</span>
                </p>
                <p className="text-xs text-sb-muted">
                  {d.email} · Preferred contact: {d.contactPreference}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Hiring Preferences</h2>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.hireInterns && <span className="chip">Internships</span>}
                  {d.hireGraduates && <span className="chip">Graduate Roles</span>}
                  {d.modes.map((m) => (
                    <span key={m} className="chip chip-pink">
                      {m}
                    </span>
                  ))}
                  {d.skills.map((s) => (
                    <span key={s} className="chip chip-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={step === 0 || busy}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {last ? (
                <>
                  <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => finish(false)}>
                    Skip verification for now
                  </button>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => finish(true)}>
                    {busy && <Loader2 size={16} className="animate-spin" />} Submit for Verification &amp; Continue
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary" disabled={busy} onClick={next}>
                  {busy && <Loader2 size={16} className="animate-spin" />} Continue{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
