"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clock,
  Loader2,
  LogOut,
  Pencil,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import { imageToAvatar } from "@/lib/student/image";
import { validateEmail, validateRequired, validateUrl } from "@/lib/student/validation";
import { INSTITUTION_TYPES, type InstitutionType, type InstitutionVerificationStatus } from "@/lib/academia/types";
import { useAcademia } from "./AcademiaProvider";
import { Avatar, SelectField, TagInput, TextAreaField, TextField } from "@/components/student/ui";

const STEPS = [
  "Institution Details",
  "Departments & Programs",
  "Placement & Contacts",
  "Review & Verify",
] as const;

export function InstitutionVerificationBadge({ status }: { status: InstitutionVerificationStatus }) {
  if (status === "Verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        <ShieldCheck size={14} /> Verified Institution
      </span>
    );
  }
  if (status === "Pending Verification") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/50 bg-sb-blue/20 px-3 py-1 text-xs font-semibold text-sb-cyan">
        <Clock size={14} /> Pending Verification
      </span>
    );
  }
  if (status === "Action Required" || status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-pink/50 bg-sb-pink/10 px-3 py-1 text-xs font-semibold text-sb-pink">
        <ShieldAlert size={14} /> {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-sb-muted">
      Draft — Not Submitted
    </span>
  );
}

export default function AcademiaOnboardingWizard() {
  const router = useRouter();
  const { data, updateMe, notify, logout } = useAcademia();
  const inst = data.institution;

  const [d, setD] = useState({
    name: inst.name,
    type: inst.type,
    logo: inst.logo,
    website: inst.website,
    institutionalEmail: inst.institutionalEmail,
    country: inst.country || "India",
    state: inst.state,
    city: inst.city,
    address: inst.address,
    description: inst.description,
    specializations: inst.specializations,
    programsOffered: inst.programsOffered,
    accreditation: inst.accreditation,
    affiliation: inst.affiliation,
    contactPersonName: inst.contactPersonName,
    contactPersonTitle: inst.contactPersonTitle,
    placementOfficeEmail: inst.placementOfficeEmail,
    placementOfficePhone: inst.placementOfficePhone,
    academicYearLabel: inst.academicYearLabel || "2026–2027",
  });

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));

  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      const m1 = validateRequired(d.name, "Institution name", 140);
      const m2 = validateUrl(d.website, "Official website", true);
      const m3 = validateRequired(d.city, "City", 80);
      if (m1) e.institutionName = m1;
      if (m2) e.website = m2;
      if (m3) e.city = m3;
    }
    if (s === 2) {
      const m1 = validateRequired(d.contactPersonName, "Contact person name", 80);
      const m2 = validateEmail(d.placementOfficeEmail);
      if (m1) e.contactPersonName = m1;
      if (m2) e.placementOfficeEmail = m2;
    }
    return e;
  }

  async function persist(extra?: { onboarded?: boolean; submitForVerification?: boolean }) {
    const res = await updateMe({
      institution: {
        ...d,
        submitForVerification: extra?.submitForVerification,
      },
      staff: {
        onboarded: extra?.onboarded,
      },
    });
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error);
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
    for (const s of [0, 2]) {
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
          ? "Institution profile submitted for verification review!"
          : "Setup saved. Welcome to your Academia workspace!",
      );
      router.replace("/academia/dashboard");
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
            <SkillBridgeWordmark portal="academia" />{" "}
            <span className="text-xs font-semibold text-sb-pink">Academia</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => finish(false)}
            className="text-xs text-sb-cyan underline-offset-2 hover:underline"
          >
            Save draft &amp; enter workspace
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
        <nav aria-label="Institution onboarding progress" className="mb-6">
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
        </nav>

        <section className="glass rise p-6 sm:p-8" aria-labelledby="acad-step-title" key={step}>
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 id="acad-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Institution profile &amp; location
                </h1>
                <p className="mt-1 text-sm text-sb-muted">
                  Set up your official institution identity for students and corporate recruiters.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Avatar name={d.name || "Inst"} src={d.logo} size={72} />
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    aria-label="Upload institution crest or logo"
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
                  <p className="mt-1.5 text-xs text-sb-muted">Optional square PNG/JPG/WebP crest or logo.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Official institution name"
                  value={d.name}
                  error={errors.institutionName}
                  onChange={(e) => set("name", e.target.value)}
                />
                <SelectField
                  label="Institution type"
                  options={INSTITUTION_TYPES}
                  value={d.type}
                  onChange={(e) => set("type", e.target.value as InstitutionType)}
                />
                <TextField
                  label="Official website"
                  type="url"
                  value={d.website}
                  error={errors.website}
                  onChange={(e) => set("website", e.target.value)}
                />
                <TextField
                  label="Institutional email"
                  type="email"
                  value={d.institutionalEmail}
                  onChange={(e) => set("institutionalEmail", e.target.value)}
                />
                <TextField
                  label="City"
                  value={d.city}
                  error={errors.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                <TextField
                  label="State"
                  value={d.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>

              <TextField
                label="Campus address"
                optional
                value={d.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rajbaug, Loni Kalbhor, Pune — 412201"
              />

              <TextAreaField
                label="Institution overview"
                optional
                rows={3}
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe your university's academic heritage, research focus, and placement ecosystem."
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 id="acad-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Academic programs &amp; specializations
                </h1>
                <p className="mt-1 text-sm text-sb-muted">
                  Define the degree programs, specializations, and accreditation details of your institution.
                </p>
              </div>

              <TagInput
                label="Programs offered"
                value={d.programsOffered}
                onChange={(v) => set("programsOffered", v)}
                placeholder="B.Tech / B.E., M.Tech, MBA, B.Des…"
              />

              <TagInput
                label="Areas of specialization"
                value={d.specializations}
                onChange={(v) => set("specializations", v)}
                placeholder="Computer Science, AI & Data Science, Robotics, Design…"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Accreditation (if applicable)"
                  optional
                  value={d.accreditation}
                  onChange={(e) => set("accreditation", e.target.value)}
                  placeholder="NAAC / NBA / UGC Recognized"
                />
                <TextField
                  label="University Affiliation"
                  optional
                  value={d.affiliation}
                  onChange={(e) => set("affiliation", e.target.value)}
                  placeholder="State University / Autonomous"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 id="acad-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Training &amp; Placement Cell contacts
                </h1>
                <p className="mt-1 text-sm text-sb-muted">
                  Primary points of contact for industry recruiters and campus hiring coordination.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Authorized contact person"
                  value={d.contactPersonName}
                  error={errors.contactPersonName}
                  onChange={(e) => set("contactPersonName", e.target.value)}
                />
                <TextField
                  label="Designation / Title"
                  value={d.contactPersonTitle}
                  onChange={(e) => set("contactPersonTitle", e.target.value)}
                />
                <TextField
                  label="Placement Office email"
                  type="email"
                  value={d.placementOfficeEmail}
                  error={errors.placementOfficeEmail}
                  onChange={(e) => set("placementOfficeEmail", e.target.value)}
                />
                <TextField
                  label="Placement Office phone"
                  optional
                  value={d.placementOfficePhone}
                  onChange={(e) => set("placementOfficePhone", e.target.value)}
                  placeholder="+91 20 2691 2901"
                />
              </div>

              <TextField
                label="Current Academic Year"
                value={d.academicYearLabel}
                onChange={(e) => set("academicYearLabel", e.target.value)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 id="acad-step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
                    Review &amp; submit for verification
                  </h1>
                  <p className="mt-1 text-sm text-sb-muted">
                    Confirm your institutional details before launching your campus workspace.
                  </p>
                </div>
                <InstitutionVerificationBadge status={inst.verificationStatus} />
              </div>

              <div className="rounded-xl border border-sb-cyan/30 bg-sb-blue/10 p-4 text-xs leading-relaxed text-sb-muted">
                <strong className="text-white">Transparent Verification Policy:</strong> Submitting your institution
                profile marks it as <span className="text-sb-cyan">Pending Verification</span>. SkillBridge never
                fabricates institutional accreditation or auto-verifies institutions without an external review. All
                campus modules (Students, Faculty, Placements, Research, and Events) are immediately unlocked.
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Institution</h2>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={d.name} src={d.logo} size={48} />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-xs text-sb-muted">
                      {[d.type, d.city, d.state].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-sb-cyan">{d.website}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
                    Programs &amp; Specializations
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.programsOffered.map((p) => (
                    <span key={p} className="chip">
                      {p}
                    </span>
                  ))}
                  {d.specializations.map((s) => (
                    <span key={s} className="chip chip-pink">
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
                    Save as Draft &amp; Enter
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
