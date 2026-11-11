"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Copy,
  Edit3,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { JobStatusBadge } from "./IndustryDashboardView";
import { ConfirmModal, EmptyState, PageHeader, formatDate } from "@/components/student/ui";
import SearchInput from "@/components/ui/SearchInput";
import { JOB_STATUSES, JOB_TYPES, type JobListing } from "@/lib/industry/types";
import { WORK_MODES } from "@/lib/student/types";

const PAGE_SIZE = 8;

export default function JobsManagerView() {
  const { data, createJob, updateJob, deleteJob, notify } = useIndustry();
  const { recruiter, jobs, applicants } = data;
  const [now] = useState(() => Date.now());

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [modeFilter, setModeFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "deadline" | "applicants">("newest");
  const [page, setPage] = useState(1);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobListing | null>(null);

  const applicantCountByJob = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of applicants) {
      map.set(a.jobId, (map.get(a.jobId) ?? 0) + 1);
    }
    return map;
  }, [applicants]);

  const effectiveStatus = (job: JobListing): string => {
    if (
      job.status === "Published" &&
      job.deadline &&
      new Date(job.deadline.includes("T") ? job.deadline : `${job.deadline}T23:59:59.000Z`).getTime() < now
    ) {
      return "Expired";
    }
    return job.status;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = jobs.filter((job) => {
      const eff = effectiveStatus(job);
      if (statusFilter !== "All" && eff !== statusFilter) return false;
      if (typeFilter !== "All" && job.type !== typeFilter) return false;
      if (modeFilter !== "All" && job.mode !== modeFilter) return false;
      if (query) {
        const hay = [
          job.title,
          job.department,
          job.location,
          job.type,
          ...job.requiredSkills,
          ...job.preferredSkills,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "applicants") {
        return (applicantCountByJob.get(b.id) ?? 0) - (applicantCountByJob.get(a.id) ?? 0);
      }
      if (sortBy === "deadline") {
        const da = a.deadline ? +new Date(a.deadline) : Number.MAX_SAFE_INTEGER;
        const db = b.deadline ? +new Date(b.deadline) : Number.MAX_SAFE_INTEGER;
        return da - db;
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, q, statusFilter, typeFilter, modeFilter, sortBy, applicantCountByJob, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const canModify = recruiter.role !== "Interviewer";

  const handleDuplicate = async (job: JobListing) => {
    setBusyId(job.id);
    const res = await createJob({ duplicateFromId: job.id });
    setBusyId(null);
    if (res.ok) notify("success", `Duplicated “${job.title}” as a draft.`);
    else notify("error", res.error);
  };

  const handleStatusChange = async (job: JobListing, status: JobListing["status"]) => {
    setBusyId(job.id);
    const res = await updateJob(job.id, { status });
    setBusyId(null);
    if (res.ok) notify("success", `“${job.title}” marked as ${status}.`);
    else notify("error", res.error);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const res = await deleteJob(deleteTarget.id);
    setBusyId(null);
    const title = deleteTarget.title;
    setDeleteTarget(null);
    if (res.ok) notify("success", `Deleted “${title}”.`);
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs & Internships Manager"
        subtitle="Create, publish, duplicate, pause, or close opportunities. Published roles sync directly with Student Opportunities."
        action={
          canModify ? (
            <Link href="/industry/jobs/new" className="btn btn-primary">
              <Plus size={16} /> Create New Listing
            </Link>
          ) : undefined
        }
      />

      {/* Search & Filters */}
      <div className="glass space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <SearchInput
              value={q}
              onChange={(val) => {
                setQ(val);
                setPage(1);
              }}
              placeholder="Search by job title, department, skill, or location…"
              aria-label="Search job listings"
              portalVariant="industry"
            />
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="All">All Statuses</option>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by opportunity type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="All">All Types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Sort listings"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="field"
            >
              <option value="newest">Sort: Newest Created</option>
              <option value="applicants">Sort: Most Applicants</option>
              <option value="deadline">Sort: Nearest Deadline</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-sb-muted">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Work mode:</span>
            {["All", ...WORK_MODES].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setModeFilter(m);
                  setPage(1);
                }}
                className={`rounded-full border px-2.5 py-0.5 transition-colors ${
                  modeFilter === m
                    ? "border-sb-cyan/50 bg-sb-blue/20 text-white"
                    : "border-white/10 bg-white/[0.02] text-sb-muted hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of {jobs.length} listing
            {jobs.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={22} />}
          title={jobs.length === 0 ? "No job or internship listings yet" : "No listings match your filters"}
          text={
            jobs.length === 0
              ? "Post your first internship, full-time graduate role, or capstone project to start receiving student applications."
              : "Try clearing your search query or status filters."
          }
          action={
            jobs.length === 0 && canModify ? (
              <Link href="/industry/jobs/new" className="btn btn-primary btn-sm">
                <Plus size={15} /> Create Job Listing
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => {
                  setQ("");
                  setStatusFilter("All");
                  setTypeFilter("All");
                  setModeFilter("All");
                }}
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3.5">
          {paged.map((job) => {
            const count = applicantCountByJob.get(job.id) ?? 0;
            const busy = busyId === job.id;
            return (
              <article key={job.id} className="glass p-5 transition-colors hover:border-white/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/industry/jobs/${job.id}`}
                        className="text-lg font-bold tracking-tight hover:text-sb-cyan"
                      >
                        {job.title}
                      </Link>
                      <JobStatusBadge job={job} now={now} />
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-sb-muted">
                        {job.type}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-sb-muted">
                      {job.department} · {job.mode} · {job.location || "Remote"}
                      {job.salaryRange ? ` · ${job.salaryRange} (${job.currency})` : ""}
                      {job.openings ? ` · ${job.openings} opening${job.openings === 1 ? "" : "s"}` : ""}
                    </p>

                    {job.requiredSkills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((s) => (
                          <span key={s} className="chip">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/industry/applicants?jobId=${job.id}`}
                      className="btn btn-glass btn-sm"
                    >
                      <Users size={14} /> {count} Applicant{count === 1 ? "" : "s"}
                    </Link>
                    <Link href={`/industry/jobs/${job.id}`} className="btn btn-ghost btn-sm">
                      <Edit3 size={14} /> {canModify ? "Edit" : "View"}
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3.5 text-xs text-sb-muted">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>Created {formatDate(job.createdAt)}</span>
                    {job.deadline && <span>Deadline: {formatDate(job.deadline)}</span>}
                    {job.hiringContact && <span>Contact: {job.hiringContact}</span>}
                  </div>

                  {canModify && (
                    <div className="flex flex-wrap items-center gap-2">
                      {job.status !== "Published" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusChange(job, "Published")}
                          className="inline-flex items-center gap-1 rounded-lg border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-1 text-xs font-medium text-sb-cyan hover:bg-sb-blue/25"
                        >
                          <PlayCircle size={13} /> Publish
                        </button>
                      )}
                      {job.status === "Published" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusChange(job, "Paused")}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-sb-muted hover:text-white"
                        >
                          <PauseCircle size={13} /> Pause
                        </button>
                      )}
                      {job.status !== "Closed" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusChange(job, "Closed")}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-sb-muted hover:text-white"
                        >
                          <XCircle size={13} /> Close
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDuplicate(job)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-sb-muted hover:text-white"
                      >
                        <Copy size={13} /> Duplicate
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeleteTarget(job)}
                        className="inline-flex items-center gap-1 rounded-lg border border-sb-pink/35 bg-sb-pink/10 px-2.5 py-1 text-xs font-medium text-[#ff9fcb] hover:bg-sb-pink/20"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-sb-muted">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-glass btn-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-glass btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Job Listing"
        text={
          deleteTarget
            ? `Are you sure you want to permanently delete “${deleteTarget.title}”? Existing applicant records will no longer appear in your active pipeline.`
            : ""
        }
        confirmLabel="Delete Listing"
        busy={!!deleteTarget && busyId === deleteTarget.id}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
