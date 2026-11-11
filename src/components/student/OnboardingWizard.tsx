"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Loader2, LogOut, Pencil } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import { imageToAvatar } from "@/lib/student/image";
import { validateGradYear, validateRequired } from "@/lib/student/validation";
import { OPP_TYPES, WORK_MODES, type OppType, type Skill, type WorkMode } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import SkillsEditor, { SkillTag } from "./SkillsEditor";
import { Avatar, SelectField, TagInput, TextAreaField, TextField, ToggleGroup } from "./ui";

const STEPS = ["Personal", "Education", "Skills", "Preferences", "Review"] as const;
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate", "Graduated"] as const;
const DEGREES = ["B.Tech / B.E.", "B.Sc", "BCA", "B.Com", "BBA", "B.A.", "M.Tech / M.E.", "M.Sc", "MCA", "MBA", "Diploma"];

interface Draft {
  name: string;
  avatar: string;
  bio: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  gradYear: string;
  skills: Skill[];
  types: OppType[];
  modes: WorkMode[];
  roles: string[];
  areas: string[];
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { data, patch, notify, logout } = useStudent();
  const p = data.profile;
  // Initial values come from what is already saved, so a reload resumes where the student left off.
  const [d, setD] = useState<Draft>({
    name: data.user.name,
    avatar: p.avatar,
    bio: p.bio,
    college: p.college,
    degree: p.degree,
    branch: p.branch,
    year: p.year,
    gradYear: p.gradYear,
    skills: data.skills,
    types: p.preferences.types,
    modes: p.preferences.modes,
    roles: p.preferences.roles,
    areas: p.preferences.areas,
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      const m = validateRequired(d.name, "Full name", 80);
      if (m) e.name = m;
      if (d.bio.length > 500) e.bio = "Bio must be 500 characters or fewer.";
    }
    if (s === 1) {
      const a = validateRequired(d.college, "College or university", 120);
      const b = validateRequired(d.degree, "Degree", 80);
      const c = validateGradYear(d.gradYear);
      if (a) e.college = a;
      if (b) e.degree = b;
      if (c) e.gradYear = c;
    }
    return e;
  }

  const body = () => ({
    account: { name: d.name, email: data.user.email },
    profile: {
      avatar: d.avatar,
      bio: d.bio,
      college: d.college,
      degree: d.degree,
      branch: d.branch,
      year: d.year,
      gradYear: d.gradYear,
      preferences: { types: d.types, modes: d.modes, roles: d.roles, areas: d.areas },
    },
    skills: d.skills,
  });

  async function save(extra?: Record<string, unknown>) {
    const b = body();
    const r = await patch({ ...b, profile: { ...b.profile, ...extra } });
    if (!r.ok) {
      setErrors(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not save your progress.");
    }
    return r.ok;
  }

  async function next() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await save();
    setBusy(false);
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function complete() {
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
    const ok = await save({ onboarded: true });
    if (ok) {
      notify("success", "Profile complete. Welcome to SkillBridge!");
      router.replace("/student/dashboard");
      router.refresh();
    } else setBusy(false);
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    try {
      set("avatar", await imageToAvatar(file));
      setErrors((e) => ({ ...e, avatar: "" }));
    } catch (err) {
      setErrors((e) => ({ ...e, avatar: err instanceof Error ? err.message : "Could not use that image." }));
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
          <SkillBridgeWordmark className="text-lg" portal="student" />
        </Link>
        <button type="button" onClick={() => logout()} className="inline-flex items-center gap-2 text-sm text-sb-muted hover:text-white">
          <LogOut size={15} aria-hidden="true" /> Log out
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-16">
        <nav aria-label="Onboarding progress" className="mb-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <span
                  className={`grid h-7 w-7 flex-none place-items-center rounded-full border text-xs font-bold transition-colors ${
                    i < step ? "border-sb-cyan bg-sb-blue/40 text-white" : i === step ? "border-sb-cyan text-sb-cyan shadow-[0_0_14px_-3px_rgba(25,184,230,0.8)]" : "border-white/20 text-sb-muted"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-white" : "text-sb-muted"}`}>{label}</span>
                {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-sb-cyan/60" : "bg-white/10"}`} />}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-sb-muted sm:hidden">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </nav>

        <section className="glass rise p-6 sm:p-8" aria-labelledby="step-title" key={step}>
          {step === 0 && (
            <div className="space-y-5">
              <Heading title="Tell us about you" text="This is how you will appear to industry." />
              <div className="flex items-center gap-4">
                <Avatar name={d.name} src={d.avatar} size={72} />
                <div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload profile photo" onChange={(e) => pickPhoto(e.target.files?.[0])} />
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-glass btn-sm !px-4" onClick={() => fileRef.current?.click()}>
                      <Camera size={14} /> {d.avatar ? "Change photo" : "Upload photo"}
                    </button>
                    {d.avatar && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("avatar", "")}>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-sb-muted">Optional. Without one we use your initials.</p>
                  {errors.avatar && <p role="alert" className="mt-1 text-xs text-[#ff7ab8]">{errors.avatar}</p>}
                </div>
              </div>
              <TextField label="Full name" value={d.name} error={errors.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
              <TextAreaField label="Short bio" optional rows={4} maxLength={500} value={d.bio} error={errors.bio} onChange={(e) => set("bio", e.target.value)} hint={`${d.bio.length}/500 · What are you studying and what do you want to build?`} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Heading title="Your education" text="Used to match you with the right opportunities." />
              <TextField label="College or university" value={d.college} error={errors.college} onChange={(e) => set("college", e.target.value)} />
              <TextField label="Degree" list="degrees" value={d.degree} error={errors.degree} onChange={(e) => set("degree", e.target.value)} placeholder="e.g. B.Tech / B.E." />
              <datalist id="degrees">{DEGREES.map((x) => <option key={x} value={x} />)}</datalist>
              <TextField label="Branch or specialization" optional value={d.branch} onChange={(e) => set("branch", e.target.value)} placeholder="e.g. Computer Science" />
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField label="Current year" optional placeholder="Select…" options={YEARS} value={d.year} onChange={(e) => set("year", e.target.value)} />
                <TextField label="Graduation year" optional inputMode="numeric" maxLength={4} value={d.gradYear} error={errors.gradYear} onChange={(e) => set("gradYear", e.target.value.replace(/\D/g, ""))} placeholder="2027" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Heading title="Your skills" text="Add what you know and how well. You can change this any time." />
              <SkillsEditor skills={d.skills} onChange={(next) => set("skills", next)} />
              {d.skills.length === 0 && <p className="text-sm text-sb-muted">No skills yet. You can skip this and add them later.</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Heading title="Career preferences" text="Tell us what you are looking for. All optional." />
              <ToggleGroup legend="Opportunity types" options={OPP_TYPES} value={d.types} onChange={(v) => set("types", v)} />
              <ToggleGroup legend="Work mode" options={WORK_MODES} value={d.modes} onChange={(v) => set("modes", v)} />
              <TagInput label="Interested roles" optional value={d.roles} onChange={(v) => set("roles", v)} placeholder="e.g. Frontend Developer" />
              <TagInput label="Technology areas" optional value={d.areas} onChange={(v) => set("areas", v)} placeholder="e.g. Web, AI, Cloud" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <Heading title="Review your profile" text="Check everything looks right, then complete your profile." />
              <ReviewBlock title="Personal" onEdit={() => setStep(0)}>
                <div className="flex items-center gap-3">
                  <Avatar name={d.name} src={d.avatar} size={48} />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-sb-muted">{data.user.email}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-sb-muted">{d.bio || "No bio added."}</p>
              </ReviewBlock>
              <ReviewBlock title="Education" onEdit={() => setStep(1)}>
                <p className="text-sm">{d.college}</p>
                <p className="text-sm text-sb-muted">
                  {[d.degree, d.branch, d.year, d.gradYear && `Class of ${d.gradYear}`].filter(Boolean).join(" · ")}
                </p>
              </ReviewBlock>
              <ReviewBlock title="Skills" onEdit={() => setStep(2)}>
                {d.skills.length ? <div className="flex flex-wrap gap-2">{d.skills.map((s) => <SkillTag key={s.id} skill={s} />)}</div> : <p className="text-sm text-sb-muted">None added yet.</p>}
              </ReviewBlock>
              <ReviewBlock title="Preferences" onEdit={() => setStep(3)}>
                {d.types.length + d.modes.length + d.roles.length + d.areas.length === 0 ? (
                  <p className="text-sm text-sb-muted">Not set.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {d.types.map((t) => <span key={t} className="chip">{t}</span>)}
                    {d.modes.map((t) => <span key={t} className="chip chip-pink">{t}</span>)}
                    {[...d.roles, ...d.areas].map((t) => <span key={t} className="chip chip-muted">{t}</span>)}
                  </div>
                )}
              </ReviewBlock>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button type="button" className="btn btn-ghost" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} aria-hidden="true" /> Back
            </button>
            <div className="flex items-center gap-3">
              {(step === 2 || step === 3) && (
                <button type="button" className="text-sm text-sb-muted underline-offset-2 hover:text-white hover:underline" disabled={busy} onClick={() => setStep((s) => s + 1)}>
                  Skip
                </button>
              )}
              {last ? (
                <button type="button" className="btn btn-primary" disabled={busy} onClick={complete}>
                  {busy && <Loader2 size={16} className="animate-spin" />} Complete Profile
                </button>
              ) : (
                <button type="button" className="btn btn-primary" disabled={busy} onClick={next}>
                  {busy && <Loader2 size={16} className="animate-spin" />} Continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Heading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 id="step-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-sb-muted">{text}</p>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">{title}</h2>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-xs text-sb-cyan hover:underline" aria-label={`Edit ${title}`}>
          <Pencil size={12} /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}
