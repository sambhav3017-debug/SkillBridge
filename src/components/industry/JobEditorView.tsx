"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Loader2, Save, Send, Trash2 } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import {
  ConfirmModal,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TagInput,
  TextAreaField,
  TextField,
  formatDate,
} from "@/components/student/ui";
import { JOB_TYPES, type JobListing, type JobType } from "@/lib/industry/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

export default function JobEditorView({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const { data, createJob, updateJob, deleteJob, notify } = useIndustry();
  const { company, recruiter, jobs } = data;

  const existing = jobId ? jobs.find((j) => j.id === jobId) : undefined;
  const [defaultDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [title, setTitle] = useState(existing?.title ?? "");
  const [type, setType] = useState<JobType>(existing?.type ?? "Internship");
  const [department, setDepartment] = useState(existing?.department ?? "Engineering");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [responsibilities, setResponsibilities] = useState(existing?.responsibilities ?? "");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(existing?.requiredSkills ?? []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(existing?.preferredSkills ?? []);
  const [eligibility, setEligibility] = useState(existing?.eligibility ?? "");
  const [degreeRequirement, setDegreeRequirement] = useState(existing?.degreeRequirement ?? "B.Tech / B.E. / M.Tech / MCA");
  const [gradYearEligibility, setGradYearEligibility] = useState(existing?.gradYearEligibility ?? "2026, 2027, 2028");
  const [experienceRequirement, setExperienceRequirement] = useState(existing?.experienceRequirement ?? "Fresher / 0–1 year");
  const [location, setLocation] = useState(existing?.location ?? (company.headquarters || "Pune / Remote"));
  const [mode, setMode] = useState<WorkMode>(existing?.mode ?? "Hybrid");
  const [salaryRange, setSalaryRange] = useState(existing?.salaryRange ?? "₹25,000 – ₹40,000 / mo");
  const [currency, setCurrency] = useState(existing?.currency ?? "INR");
  const [deadline, setDeadline] = useState(
    existing?.deadline ? existing.deadline.slice(0, 10) : defaultDeadline,
  );
  const [openings, setOpenings] = useState(String(existing?.openings ?? 2));
  const [duration, setDuration] = useState(existing?.duration ?? "12 weeks");
  const [requireResume, setRequireResume] = useState(existing?.requireResume ?? true);
  const [requirePortfolio, setRequirePortfolio] = useState(existing?.requirePortfolio ?? false);
  const [applicationQuestions, setApplicationQuestions] = useState<string[]>(
    existing?.applicationQuestions ?? [],
  );
  const [hiringContact, setHiringContact] = useState(
    existing?.hiringContact ?? `${recruiter.name} (${recruiter.jobTitle})`,
  );

  const [busyStatus, setBusyStatus] = useState<JobListing["status"] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (jobId && !existing) {
    return (
      <div className="glass p-8 text-center">
        <h1 className="text-xl font-bold">Job listing not found</h1>
        <p className="mt-1.5 text-sm text-sb-muted">
          This opportunity may have been deleted or belongs to a different workspace.
        </p>
        <Link href="/industry/jobs" className="btn btn-primary btn-sm mt-5">
          Back to Jobs Manager
        </Link>
      </div>
    );
  }

  const buildPayload = (status: JobListing["status"]) => ({
    title,
    type,
    department,
    description,
    responsibilities,
    requiredSkills,
    preferredSkills,
    eligibility,
    degreeRequirement,
    gradYearEligibility,
    experienceRequirement,
    location,
    mode,
    salaryRange,
    currency,
    deadline,
    openings: Number(openings) || 1,
    duration,
    requireResume,
    requirePortfolio,
    applicationQuestions,
    hiringContact,
    status,
  });

  const submitWithStatus = async (status: JobListing["status"]) => {
    setErrors({});
    setTopError(null);
    setBusyStatus(status);
    const payload = buildPayload(status);
    const res = existing ? await updateJob(existing.id, payload) : await createJob(payload);
    setBusyStatus(null);
    if (!res.ok) {
      setTopError(res.error);
      if (res.fieldErrors) setErrors(res.fieldErrors);
      return;
    }
    notify(
      "success",
      status === "Published"
        ? `“${title}” published and visible in Student Opportunities.`
        : `“${title || "Listing"}” saved as ${status}.`,
    );
    router.push("/industry/jobs");
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    const res = await deleteJob(existing.id);
    setDeleting(false);
    setConfirmDeleteOpen(false);
    if (res.ok) {
      notify("success", `Deleted “${existing.title}”.`);
      router.push("/industry/jobs");
    } else {
      notify("error", res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/industry/jobs" className="inline-flex items-center gap-1.5 text-xs font-medium text-sb-muted hover:text-white">
          <ArrowLeft size={14} /> Back to Jobs & Internships
        </Link>
        {existing && (
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold">
            Current Status: {existing.status}
          </span>
        )}
      </div>

      <PageHeader
        title={existing ? `Edit: ${existing.title}` : "Post a New Job or Internship"}
        subtitle="Published listings immediately appear in the Student Portal with your company details, required skills, and deadline."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => setPreviewOpen(true)} className="btn btn-glass btn-sm">
              <Eye size={15} /> Preview Student View
            </button>
            {existing && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        }
      />

      {topError && <ErrorNote>{topError}</ErrorNote>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitWithStatus("Published");
        }}
        noValidate
        className="space-y-6"
      >
        {/* Section 1: Core Role Information */}
        <section className="glass space-y-4 p-6">
          <h2 className="text-base font-bold">1. Role Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Job / Internship Title"
              placeholder="Frontend Engineering Intern"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />
            <SelectField
              label="Opportunity Type"
              options={JOB_TYPES}
              value={type}
              onChange={(e) => setType(e.target.value as JobType)}
            />
            <TextField
              label="Department / Team"
              placeholder="Core Platform Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <TextField
              label="Duration (for internships / projects)"
              optional
              placeholder="12 weeks · Summer / Semester"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <TextAreaField
            label="Job Description"
            rows={4}
            placeholder="Explain what the candidate will build, the team they will join, and the impact of this role."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />

          <TextAreaField
            label="Key Responsibilities"
            rows={3}
            optional
            placeholder="• Build accessible React + TypeScript interfaces&#10;• Collaborate with product design and backend APIs&#10;• Write unit and integration tests"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />
        </section>

        {/* Section 2: Skills & Academic Eligibility */}
        <section className="glass space-y-4 p-6">
          <h2 className="text-base font-bold">2. Skills & Eligibility</h2>
          <TagInput
            label="Required Skills (used for transparent student skill matching)"
            value={requiredSkills}
            onChange={setRequiredSkills}
            placeholder="React, TypeScript, SQL, Python…"
            hint={errors.requiredSkills ?? "Add at least 1 required skill before publishing."}
          />
          {errors.requiredSkills && (
            <p role="alert" className="text-xs text-[#ff7ab8]">
              {errors.requiredSkills}
            </p>
          )}

          <TagInput
            label="Preferred / Bonus Skills"
            optional
            value={preferredSkills}
            onChange={setPreferredSkills}
            placeholder="Docker, GraphQL, Figma…"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Degree / Branch Requirements"
              placeholder="B.Tech / M.Tech CS, IT, ECE"
              value={degreeRequirement}
              onChange={(e) => setDegreeRequirement(e.target.value)}
            />
            <TextField
              label="Eligible Graduation Years"
              placeholder="2026, 2027, 2028"
              value={gradYearEligibility}
              onChange={(e) => setGradYearEligibility(e.target.value)}
            />
            <TextField
              label="Experience Requirement"
              placeholder="Fresher / 0–1 year"
              value={experienceRequirement}
              onChange={(e) => setExperienceRequirement(e.target.value)}
            />
          </div>

          <TextField
            label="Additional Eligibility Criteria"
            optional
            placeholder="Minimum 7.0 CGPA or strong open-source project portfolio"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
          />
        </section>

        {/* Section 3: Location, Compensation & Deadlines */}
        <section className="glass space-y-4 p-6">
          <h2 className="text-base font-bold">3. Location, Compensation & Timeline</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Work Location"
              placeholder="Pune / Bengaluru / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
            />
            <SelectField
              label="Work Mode"
              options={WORK_MODES}
              value={mode}
              onChange={(e) => setMode(e.target.value as WorkMode)}
            />
            <TextField
              label="Number of Openings"
              type="number"
              min={1}
              max={500}
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
            />
            <TextField
              label="Stipend / Salary Range"
              placeholder="₹30,000 / mo or ₹10–14 LPA"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
            <SelectField
              label="Currency"
              options={CURRENCIES}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
            <TextField
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              error={errors.deadline}
            />
          </div>
        </section>

        {/* Section 4: Application Requirements */}
        <section className="glass space-y-4 p-6">
          <h2 className="text-base font-bold">4. Application Requirements & Screening</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm">
              <span>Require candidate resume / CV</span>
              <SkillBridgeToggle
                checked={requireResume}
                onChange={setRequireResume}
                aria-label="Require candidate resume / CV"
                accent="cyan"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm">
              <span>Require GitHub or portfolio link</span>
              <SkillBridgeToggle
                checked={requirePortfolio}
                onChange={setRequirePortfolio}
                aria-label="Require GitHub or portfolio link"
                accent="cyan"
              />
            </div>
          </div>

          <TagInput
            label="Screening / Application Questions"
            optional
            value={applicationQuestions}
            onChange={setApplicationQuestions}
            placeholder="Why are you interested in this role? Share a project you are proud of…"
            max={8}
          />

          <TextField
            label="Hiring Contact Person"
            optional
            placeholder="Aarav Mehta · Talent Acquisition"
            value={hiringContact}
            onChange={(e) => setHiringContact(e.target.value)}
          />
        </section>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="btn btn-glass"
          >
            <Eye size={16} /> Preview Student Listing
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busyStatus !== null}
              onClick={() => void submitWithStatus("Draft")}
              className="btn btn-ghost"
            >
              {busyStatus === "Draft" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={busyStatus !== null}
              className="btn btn-primary"
            >
              {busyStatus === "Published" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {existing?.status === "Published" ? "Update Published Listing" : "Publish Opportunity"}
            </button>
          </div>
        </div>
      </form>

      {/* Student Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Student Opportunity Card Preview"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreviewOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPreviewOpen(false);
                void submitWithStatus("Published");
              }}
            >
              Publish Now
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-[11px] font-semibold text-sb-cyan">
                Employer Listing · {company.name}
              </span>
              <h3 className="mt-2 text-lg font-bold">{title || "Untitled Opportunity"}</h3>
              <p className="text-xs text-sb-muted">
                {type} · {department} · {mode} · {location || "Remote"}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-semibold text-white">{salaryRange || "Compensation on discussion"}</p>
              {deadline && <p className="text-sb-muted">Apply by {formatDate(deadline)}</p>}
            </div>
          </div>

          <p className="whitespace-pre-line text-sm text-sb-text">
            {description || "Add a job description to show students what they will work on."}
          </p>

          {responsibilities && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Responsibilities</h4>
              <p className="mt-1 whitespace-pre-line text-xs text-sb-muted">{responsibilities}</p>
            </div>
          )}

          {requiredSkills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Required Skills</h4>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-sb-muted sm:grid-cols-2">
            <div>
              <strong className="text-white">Degrees:</strong> {degreeRequirement || "Open"}
            </div>
            <div>
              <strong className="text-white">Grad Years:</strong> {gradYearEligibility || "Open"}
            </div>
            <div>
              <strong className="text-white">Openings:</strong> {openings || 1}
            </div>
            <div>
              <strong className="text-white">Duration:</strong> {duration || "Flexible"}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Job Listing"
        text={`Are you sure you want to delete “${existing?.title ?? ""}”?`}
        confirmLabel="Delete Listing"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
