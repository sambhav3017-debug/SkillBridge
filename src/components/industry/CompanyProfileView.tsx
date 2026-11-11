"use client";

import { useState } from "react";
import { Building2, Eye, Globe, Loader2, MapPin, ShieldCheck, Upload, Users } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { VerificationBadge } from "./IndustryOnboardingWizard";
import {
  Avatar,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TagInput,
  TextAreaField,
  TextField,
  ToggleGroup,
} from "@/components/student/ui";
import { COMPANY_SIZES, INDUSTRY_CATEGORIES } from "@/lib/industry/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";

async function resizeImageToDataUrl(file: File, maxW: number, maxH: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function CompanyProfileView() {
  const { data, updateMe, notify } = useIndustry();
  const { company, jobs } = data;

  const [name, setName] = useState(company.name);
  const [logo, setLogo] = useState(company.logo);
  const [coverImage, setCoverImage] = useState(company.coverImage);
  const [website, setWebsite] = useState(company.website);
  const [industry, setIndustry] = useState(company.industry);
  const [size, setSize] = useState(company.size);
  const [headquarters, setHeadquarters] = useState(company.headquarters);
  const [description, setDescription] = useState(company.description);
  const [mission, setMission] = useState(company.mission);
  const [techAreas, setTechAreas] = useState<string[]>(company.techAreas);
  const [roles, setRoles] = useState<string[]>(company.hiringPreferences.roles);
  const [skills, setSkills] = useState<string[]>(company.hiringPreferences.skills);
  const [modes, setModes] = useState<WorkMode[]>(company.hiringPreferences.modes);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const publishedJobs = jobs.filter((j) => j.status === "Published");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    setBusy(true);
    const res = await updateMe({
      company: {
        name,
        logo,
        coverImage,
        website,
        industry,
        size,
        headquarters,
        description,
        mission,
        techAreas,
        hiringPreferences: {
          ...company.hiringPreferences,
          roles,
          skills,
          modes,
        },
      },
    });
    setBusy(false);
    if (!res.ok) {
      setTopError(res.error);
      if (res.fieldErrors) setErrors(res.fieldErrors);
      return;
    }
    notify("success", "Company profile saved.");
  };

  const requestVerification = async () => {
    setVerifying(true);
    const res = await updateMe({
      company: {
        name,
        website,
        headquarters,
        description,
        submitForVerification: true,
      },
    });
    setVerifying(false);
    if (res.ok) notify("success", "Company profile submitted for verification review.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile & Branding"
        subtitle="Present a clear, credible employer brand to students exploring your internships and full-time roles."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <VerificationBadge status={company.verificationStatus} />
            <button type="button" onClick={() => setPreviewOpen(true)} className="btn btn-glass btn-sm">
              <Eye size={15} /> Student Preview
            </button>
          </div>
        }
      />

      {topError && <ErrorNote>{topError}</ErrorNote>}

      {/* Banner + Logo Card */}
      <div className="glass overflow-hidden">
        <div
          className="relative h-36 w-full bg-gradient-to-r from-[#0c2231] via-[#131824] to-[#281224] bg-cover bg-center sm:h-44"
          style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
        >
          <div className="absolute bottom-3 right-3 flex gap-2">
            <label className="btn btn-glass btn-sm cursor-pointer">
              <Upload size={14} /> Cover Banner
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setCoverImage(await resizeImageToDataUrl(file, 960, 280));
                  } catch (err) {
                    notify("error", err instanceof Error ? err.message : "Could not load banner.");
                  }
                }}
              />
            </label>
            {coverImage && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCoverImage("")}>
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="-mt-12 rounded-2xl border-2 border-[#0A0A0A] bg-[#0A0A0A] light:border-[#FFFEFC] light:bg-[#FFFEFC] p-1 shadow-xl">
              <Avatar name={name || "Company"} src={logo} size={72} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{name || "Your Company"}</h2>
              <p className="text-xs text-sb-muted">
                {industry} · {size} {headquarters ? `· ${headquarters}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="btn btn-glass btn-sm cursor-pointer">
              <Upload size={14} /> Upload Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setLogo(await resizeImageToDataUrl(file, 220, 220));
                  } catch (err) {
                    notify("error", err instanceof Error ? err.message : "Could not load logo.");
                  }
                }}
              />
            </label>
            {logo && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogo("")}>
                Remove Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-12" noValidate>
        <div className="glass space-y-5 p-6 lg:col-span-8">
          <h3 className="text-base font-bold">Organization Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.companyName}
              required
            />
            <TextField
              label="Company website"
              type="url"
              placeholder="https://acme.example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              error={errors.website}
              required
            />
            <SelectField
              label="Industry category"
              options={INDUSTRY_CATEGORIES}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <SelectField
              label="Company size"
              options={COMPANY_SIZES}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          <TextField
            label="Headquarters / Primary Location"
            placeholder="Pune, Maharashtra"
            value={headquarters}
            onChange={(e) => setHeadquarters(e.target.value)}
          />

          <TextAreaField
            label="Company Overview"
            rows={4}
            placeholder="Describe what your organization builds, the engineering or business problems you solve, and why students love working with your team."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextAreaField
            label="Culture, Mentorship & Mission"
            rows={3}
            optional
            placeholder="Share how interns and new graduates are mentored, code review practices, and growth paths."
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />

          <TagInput
            label="Key Technologies & Domains"
            value={techAreas}
            onChange={setTechAreas}
            placeholder="TypeScript, Kubernetes, PyTorch, Product Design…"
          />

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-4 text-base font-bold">Campus Hiring Preferences</h3>
            <div className="space-y-4">
              <TagInput
                label="Roles You Commonly Hire For"
                value={roles}
                onChange={setRoles}
                placeholder="Software Engineer Intern, Data Analyst…"
              />
              <TagInput
                label="Core Skills You Look For"
                value={skills}
                onChange={setSkills}
                placeholder="React, Python, SQL, Figma…"
              />
              <ToggleGroup
                legend="Supported Work Modes"
                options={WORK_MODES}
                value={modes}
                onChange={setModes}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-4">
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy && <Loader2 size={15} className="animate-spin" />}
              Save Company Profile
            </button>
          </div>
        </div>

        {/* Right Column: Verification & Completeness */}
        <div className="space-y-5 lg:col-span-4">
          <div className="glass space-y-4 p-6">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-sb-cyan" />
              <h3 className="text-base font-bold">Employer Verification</h3>
            </div>
            <VerificationBadge status={company.verificationStatus} />
            <p className="text-xs leading-relaxed text-sb-muted">
              SkillBridge never fabricates employer verification badges. Submitting your company profile records a transparent{" "}
              <strong className="text-white">Pending Verification Review</strong> state until an administrator verifies your domain and corporate registration.
            </p>
            {company.verificationNote && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-sb-muted">
                {company.verificationNote}
              </p>
            )}
            {company.verificationStatus === "not_submitted" && (
              <button
                type="button"
                disabled={verifying}
                onClick={requestVerification}
                className="btn btn-glass btn-sm w-full"
              >
                {verifying && <Loader2 size={14} className="animate-spin" />}
                Submit for Verification Review
              </button>
            )}
          </div>

          <div className="glass space-y-3 p-6">
            <h3 className="text-base font-bold">Public Active Listings ({publishedJobs.length})</h3>
            <p className="text-xs text-sb-muted">
              Students viewing your company profile see these live opportunities:
            </p>
            {publishedJobs.length === 0 ? (
              <p className="text-xs text-sb-muted">No published jobs yet.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {publishedJobs.map((j) => (
                  <li key={j.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <p className="font-semibold text-white">{j.title}</p>
                    <p className="text-sb-muted">
                      {j.type} · {j.mode} · {j.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>

      {/* Student Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Student-Facing Company Profile Preview"
        footer={
          <button type="button" className="btn btn-glass btn-sm" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </button>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
            <Avatar name={name || "Company"} src={logo} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">{name || "Your Company"}</h3>
                <VerificationBadge status={company.verificationStatus} />
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-sb-muted">
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} /> {industry}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> {size}
                </span>
                {headquarters && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {headquarters}
                  </span>
                )}
                {website && (
                  <span className="inline-flex items-center gap-1 text-sb-cyan">
                    <Globe size={12} /> {website}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">About the Company</h4>
            <p className="mt-1.5 whitespace-pre-line text-sm text-sb-text">
              {description || "No company overview added yet."}
            </p>
          </div>

          {mission && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Culture & Mentorship</h4>
              <p className="mt-1.5 whitespace-pre-line text-sm text-sb-muted">{mission}</p>
            </div>
          )}

          {techAreas.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Tech Stack & Domains</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {techAreas.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Open Roles on SkillBridge ({publishedJobs.length})
            </h4>
            {publishedJobs.length === 0 ? (
              <p className="mt-1.5 text-xs text-sb-muted">No published opportunities yet.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {publishedJobs.map((j) => (
                  <div key={j.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{j.title}</span>
                      <span className="chip">{j.type}</span>
                    </div>
                    <p className="mt-1 text-xs text-sb-muted">
                      {j.mode} · {j.location} {j.salaryRange ? `· ${j.salaryRange}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
