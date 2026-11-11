"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, Camera, Check, Download, Eye, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { imageToAvatar } from "@/lib/student/image";
import { validateGradYear, validateRequired, validateUrl } from "@/lib/student/validation";
import { useStudent } from "./StudentProvider";
import { SkillTag } from "./SkillsEditor";
import { Avatar, ConfirmModal, PageHeader, SelectField, TextAreaField, TextField, formatDate } from "./ui";
import { useAutoSave } from "@/lib/hooks/useAutoSave";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate", "Graduated"] as const;

export default function ProfileView() {
  const { data, completion, patch, notify, uploadResume, removeResume } = useStudent();
  const p = data.profile;
  const [f, setF] = useState({
    name: data.user.name,
    avatar: p.avatar,
    headline: p.headline,
    bio: p.bio,
    college: p.college,
    degree: p.degree,
    branch: p.branch,
    year: p.year,
    gradYear: p.gradYear,
    linkedin: p.linkedin,
    github: p.github,
    portfolio: p.portfolio,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(false);
  const photo = useRef<HTMLInputElement>(null);
  const resume = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  // Close lightbox on Escape key
  useEffect(() => {
    if (!viewingPhoto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingPhoto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewingPhoto]);

  // Lock body scroll when viewing full-size photo
  useEffect(() => {
    if (viewingPhoto) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [viewingPhoto]);

  const { status: autoSaveStatus } = useAutoSave({
    data: f,
    delayMs: 1500,
    enabled: true,
    onSave: async (currentForm) => {
      if (!currentForm.name.trim() || !currentForm.college.trim() || !currentForm.degree.trim()) {
        return;
      }
      const { name, ...profile } = currentForm;
      const res = await patch({ account: { name, email: data.user.email }, profile });
      return res;
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    const add = (k: string, m: string | null) => m && (e[k] = m);
    add("name", validateRequired(f.name, "Full name", 80));
    add("college", validateRequired(f.college, "College or university", 120));
    add("degree", validateRequired(f.degree, "Degree", 80));
    add("gradYear", validateGradYear(f.gradYear));
    add("linkedin", validateUrl(f.linkedin, "LinkedIn URL"));
    add("github", validateUrl(f.github, "GitHub URL"));
    add("portfolio", validateUrl(f.portfolio, "Portfolio URL"));
    if (f.bio.length > 500) e.bio = "Bio must be 500 characters or fewer.";
    return e;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return notify("error", "Please fix the highlighted fields.");
    setSaving(true);
    const { name, ...profile } = f;
    const r = await patch({ account: { name, email: data.user.email }, profile });
    setSaving(false);
    if (r.ok) notify("success", "Profile saved.");
    else {
      setErrors(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not save your profile.");
    }
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    try {
      const highResAvatar = await imageToAvatar(file);
      set("avatar", highResAvatar);
      setErrors((e) => ({ ...e, avatar: "" }));
      // Immediately synchronize and save to server so Dashboard banner updates instantly
      const { name, ...profileData } = f;
      const r = await patch({
        account: { name, email: data.user.email },
        profile: { ...profileData, avatar: highResAvatar },
      });
      if (r.ok) {
        notify("success", "Profile picture updated successfully.");
      } else {
        notify("error", r.error || "Could not save profile picture.");
      }
    } catch (err) {
      setErrors((e) => ({ ...e, avatar: err instanceof Error ? err.message : "Could not use that image." }));
    }
  }

  async function removePhoto() {
    set("avatar", "");
    const { name, ...profileData } = f;
    const r = await patch({
      account: { name, email: data.user.email },
      profile: { ...profileData, avatar: "" },
    });
    if (r.ok) {
      notify("success", "Profile picture removed.");
    }
  }

  async function pickResume(file?: File) {
    if (!file) return;
    setResumeBusy(true);
    const r = await uploadResume(file);
    setResumeBusy(false);
    notify(r.ok ? "success" : "error", r.ok ? "Resume uploaded." : (r.error ?? "Upload failed."));
    if (resume.current) resume.current.value = "";
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="This is what industry sees. Keep it accurate and current." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={save} noValidate className="glass space-y-6 p-6 dash-entrance dash-delay-1" aria-busy={saving}>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setViewingPhoto(true)}
              className="btn-bounce-sm group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan/80 cursor-pointer select-none"
              title="Click to view full profile picture"
              aria-label="View profile picture"
            >
              <Avatar name={f.name} src={f.avatar} size={80} />
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                <Eye size={20} className="drop-shadow-md" />
              </span>
            </button>
            <div>
              <input ref={photo} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload profile photo" onChange={(e) => pickPhoto(e.target.files?.[0])} />
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn btn-glass btn-sm !px-4" onClick={() => photo.current?.click()}>
                  <Camera size={14} /> {f.avatar ? "Change photo" : "Upload photo"}
                </button>
                <button
                  type="button"
                  className="btn btn-glass btn-sm !px-3.5"
                  onClick={() => setViewingPhoto(true)}
                  aria-label="View profile picture"
                >
                  <Eye size={14} /> View Profile Picture
                </button>
                {f.avatar && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-sb-muted hover:text-sb-pink"
                    onClick={removePhoto}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-sb-muted">High-resolution photo synchronized across your profile and dashboard.</p>
              {errors.avatar && <p role="alert" className="mt-1 text-xs text-[#ff7ab8]">{errors.avatar}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Full name" value={f.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
            <TextField label="Headline" optional value={f.headline} maxLength={120} onChange={(e) => set("headline", e.target.value)} placeholder="e.g. CS student · aspiring frontend developer" />
          </div>
          <TextAreaField label="Short bio" optional rows={4} maxLength={500} value={f.bio} error={errors.bio} onChange={(e) => set("bio", e.target.value)} hint={`${f.bio.length}/500`} />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="College or university" value={f.college} error={errors.college} onChange={(e) => set("college", e.target.value)} />
            <TextField label="Degree" value={f.degree} error={errors.degree} onChange={(e) => set("degree", e.target.value)} />
            <TextField label="Branch or specialization" optional value={f.branch} onChange={(e) => set("branch", e.target.value)} />
            <SelectField label="Current year" optional placeholder="Select…" options={YEARS} value={f.year} onChange={(e) => set("year", e.target.value)} />
            <TextField label="Graduation year" optional inputMode="numeric" maxLength={4} value={f.gradYear} error={errors.gradYear} onChange={(e) => set("gradYear", e.target.value.replace(/\D/g, ""))} />
          </div>

          <div className="grid gap-5">
            <TextField label="LinkedIn URL" optional type="url" value={f.linkedin} error={errors.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" />
            <TextField label="GitHub URL" optional type="url" value={f.github} error={errors.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/…" />
            <TextField label="Portfolio URL" optional type="url" value={f.portfolio} error={errors.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://…" />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div className="text-xs text-sb-muted flex items-center gap-2">
              {autoSaveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Loader2 size={13} className="animate-spin text-sb-cyan" />
                  Auto-saving…
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                  <Check size={14} />
                  Changes auto-saved
                </span>
              )}
              {autoSaveStatus === "unsaved" && (
                <span className="inline-flex items-center gap-1.5 text-amber-500/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {autoSaveStatus === "error" && (
                <span className="inline-flex items-center gap-1.5 text-rose-500">
                  <AlertCircle size={13} />
                  Auto-save failed
                </span>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving && <Loader2 size={16} className="animate-spin mr-1.5" />} {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        <aside className="space-y-5 dash-entrance dash-delay-2">
          <section className="glass glass-hover p-5" aria-labelledby="pc-h">
            <h2 id="pc-h" className="text-sm font-bold text-sb-text">Profile completion</h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
              <div className="h-full rounded-full bg-gradient-to-r from-sb-cyan to-sb-pink transition-[width] duration-700" style={{ width: `${completion.percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-sb-muted">{completion.percent}% complete</p>
            {completion.missing.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-sb-muted">
                {completion.missing.map((m) => (
                  <li key={m.key}><Link href={m.href} className="hover:text-sb-text transition-colors">• {m.label}</Link></li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-sb-muted/70">Based on saved data. Save your changes to update it.</p>
          </section>

          <section id="resume" className="glass glass-hover scroll-mt-24 p-5" aria-labelledby="resume-h">
            <h2 id="resume-h" className="text-sm font-bold text-sb-text">Resume</h2>
            {data.resume ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 light:border-black/10 bg-white/[0.03] light:bg-black/[0.02] p-3">
                <FileText size={20} className="flex-none text-sb-cyan" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{data.resume.name}</p>
                  <p className="text-xs text-sb-muted">{(data.resume.size / 1024).toFixed(0)} KB · {formatDate(data.resume.uploadedAt)}</p>
                </div>
                <a href="/api/student/resume" download aria-label="Download resume" className="grid h-8 w-8 place-items-center rounded-lg text-sb-muted hover:text-sb-text transition-colors"><Download size={16} /></a>
                <button type="button" aria-label="Remove resume" onClick={() => setConfirmRemove(true)} className="grid h-8 w-8 place-items-center rounded-lg text-sb-muted hover:text-sb-pink transition-colors"><Trash2 size={16} /></button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-sb-muted">No resume uploaded yet.</p>
            )}
            <input ref={resume} type="file" accept=".pdf,.doc,.docx" className="sr-only" aria-label="Upload resume" onChange={(e) => pickResume(e.target.files?.[0])} />
            <button type="button" disabled={resumeBusy} onClick={() => resume.current?.click()} className="btn btn-glass btn-sm mt-3 !px-4">
              {resumeBusy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {data.resume ? "Replace resume" : "Upload resume"}
            </button>
            <p className="mt-2 text-xs text-sb-muted">PDF, DOC or DOCX, up to 2 MB.</p>
          </section>

          <section className="glass glass-hover p-5" aria-labelledby="sk-h">
            <div className="flex items-center justify-between">
              <h2 id="sk-h" className="text-sm font-bold text-sb-text">Skills &amp; certifications</h2>
              <Link href="/student/skills" className="text-xs text-sb-cyan hover:underline light:text-sb-blue">Manage</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.skills.length ? data.skills.map((s) => <SkillTag key={s.id} skill={s} />) : <p className="text-sm text-sb-muted">No skills yet.</p>}
            </div>
            <p className="mt-3 text-xs text-sb-muted">{data.certifications.length} certification{data.certifications.length === 1 ? "" : "s"}</p>
          </section>

          <section className="glass glass-hover p-5" aria-labelledby="pr-h">
            <div className="flex items-center justify-between">
              <h2 id="pr-h" className="text-sm font-bold text-sb-text">Projects</h2>
              <Link href="/student/projects" className="text-xs text-sb-cyan hover:underline light:text-sb-blue">Manage</Link>
            </div>
            {data.projects.length ? (
              <ul className="mt-3 space-y-1.5 text-sm">{data.projects.map((x) => <li key={x.id} className="truncate text-sb-muted">{x.title}</li>)}</ul>
            ) : (
              <p className="mt-2 text-sm text-sb-muted">No projects yet.</p>
            )}
          </section>
        </aside>
      </div>

      <ConfirmModal
        open={confirmRemove}
        title="Remove resume?"
        text="Your uploaded resume file will be deleted."
        confirmLabel="Remove"
        onClose={() => setConfirmRemove(false)}
        onConfirm={async () => {
          const r = await removeResume();
          setConfirmRemove(false);
          notify(r.ok ? "success" : "error", r.ok ? "Resume removed." : (r.error ?? "Could not remove resume."));
        }}
      />

      {/* Full-Size Profile Picture Lightbox Viewer */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-dash-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-profile-pic-title"
          onClick={() => setViewingPhoto(false)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0D1117] border border-black/[0.08] dark:border-white/15 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 px-6 py-4">
              <div>
                <h3
                  id="view-profile-pic-title"
                  className="text-base font-bold text-sb-text light:text-[#161B2E]"
                >
                  {f.name}&apos;s Profile Picture
                </h3>
                <p className="text-xs text-sb-muted light:text-[#686868]">
                  {f.avatar ? "Full-size photo view" : "Standard avatar fallback"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPhoto(false)}
                aria-label="Close image viewer"
                className="btn-bounce-sm grid h-9 w-9 place-items-center rounded-full border border-black/[0.08] dark:border-white/15 text-sb-muted hover:text-sb-text light:hover:text-[#161B2E] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Display */}
            <div className="flex-1 flex items-center justify-center p-6 bg-black/[0.02] dark:bg-black/40 overflow-auto min-h-[260px]">
              {f.avatar ? (
                <div className="relative max-h-[60vh] max-w-full overflow-hidden rounded-2xl flex items-center justify-center shadow-md border border-black/10 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.avatar}
                    alt={`${f.name}'s profile picture`}
                    decoding="async"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                    className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-2xl select-none"
                  />
                </div>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                  <Avatar name={f.name} size={130} />
                  <p className="mt-4 text-base font-bold text-sb-text light:text-[#161B2E]">
                    {f.name}
                  </p>
                  <p className="mt-1.5 text-xs text-sb-muted light:text-[#686868] max-w-xs leading-relaxed">
                    No custom profile picture uploaded yet. Your initials are currently used as your avatar.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-5 inline-flex items-center gap-1.5"
                    onClick={() => {
                      setViewingPhoto(false);
                      photo.current?.click();
                    }}
                  >
                    <Camera size={14} /> Upload a photo now
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-black/[0.06] dark:border-white/10 px-6 py-3.5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="text-xs text-sb-muted light:text-[#686868]">
                {f.avatar ? "Active student profile photo" : "Initials placeholder"}
              </div>
              <div className="flex items-center gap-2">
                {f.avatar && (
                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={() => {
                      setViewingPhoto(false);
                      photo.current?.click();
                    }}
                  >
                    <Camera size={14} /> Change photo
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setViewingPhoto(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
