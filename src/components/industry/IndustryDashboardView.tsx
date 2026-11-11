"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { Avatar, EmptyState, formatDate } from "@/components/student/ui";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import { triggerMilestoneCelebration } from "@/lib/motion";
import type { AtsStage, JobListing } from "@/lib/industry/types";
import IndustryWelcomeBanner from "./IndustryWelcomeBanner";
import IndustryKpiCard3D from "./IndustryKpiCard3D";

export function StagePill({ stage }: { stage: AtsStage }) {
  const styles: Record<AtsStage, string> = {
    Applied: "border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/[0.04] text-[var(--color-text)]",
    "Under Review": "border-cyan-500/35 bg-cyan-500/10 text-[#007BA7] dark:text-cyan-300",
    Shortlisted: "border-indigo-500/40 bg-indigo-500/15 text-[#4F46E5] dark:text-indigo-300",
    Interview: "border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300",
    Offer: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    Hired: "border-emerald-500/60 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 font-bold",
    Rejected: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[stage]}`}>
      {stage}
    </span>
  );
}

export function JobStatusBadge({ job, now }: { job: JobListing; now: number }) {
  const isExpired =
    job.status === "Published" &&
    job.deadline &&
    new Date(job.deadline.includes("T") ? job.deadline : `${job.deadline}T23:59:59.000Z`).getTime() < now;
  const label = isExpired ? "Expired" : job.status;
  const styles: Record<string, string> = {
    Published: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    Draft: "border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/[0.04] text-sb-muted",
    Paused: "border-amber-400/40 bg-amber-400/15 text-amber-700 dark:text-amber-200",
    Closed: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300",
    Expired: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[label]}`}>
      {label}
    </span>
  );
}

export default function IndustryDashboardView() {
  const { data, updateJob, updateApplicants, notify } = useIndustry();
  const { recruiter, company, jobs, applicants, interviews, activities } = data;
  const [now] = useState(() => Date.now());
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);

  const activeJobs = jobs.filter((j) => {
    if (j.status !== "Published") return false;
    if (!j.deadline) return true;
    const dl = new Date(j.deadline.includes("T") ? jobDeadlineISO(j.deadline) : `${j.deadline}T23:59:59.000Z`).getTime();
    return Number.isNaN(dl) || dl >= now;
  });

  function jobDeadlineISO(dl: string) {
    return dl.includes("T") ? dl : `${dl}T23:59:59.000Z`;
  }

  const shortlistedCount = applicants.filter((a) =>
    ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.stage),
  ).length;

  const upcomingInterviews = interviews
    .filter((iv) => (iv.status === "Scheduled" || iv.status === "Rescheduled") && new Date(iv.scheduledAt).getTime() >= now - 3600_000)
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  const applicantCountByJob = new Map<string, number>();
  for (const a of applicants) {
    applicantCountByJob.set(a.jobId, (applicantCountByJob.get(a.jobId) ?? 0) + 1);
  }

  const toggleJobStatus = async (job: JobListing, status: JobListing["status"]) => {
    setBusyJobId(job.id);
    const res = await updateJob(job.id, { status });
    setBusyJobId(null);
    if (res.ok) notify("success", `“${job.title}” is now ${status}.`);
    else notify("error", res.error);
  };

  const quickShortlist = async (applicationId: string, candidateName: string) => {
    setBusyAppId(applicationId);
    const res = await updateApplicants({ applicationId, stage: "Shortlisted" });
    setBusyAppId(null);
    if (res.ok) {
      triggerMilestoneCelebration();
      notify("success", `${candidateName} moved to Shortlisted.`);
    } else notify("error", res.error);
  };

  return (
    <div className="space-y-7">
      {/* 1. Resized Welcome Banner & Dedicated Action Buttons Grid (Desktop side-by-side, Mobile stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
        <div className="lg:col-span-8 flex flex-col">
          <IndustryWelcomeBanner company={company} recruiter={recruiter} />
        </div>

        {/* Dedicated Quick Action Container Outside Banner */}
        <section
          id="industry-quick-actions"
          aria-label="Recruitment Quick Actions"
          className="lg:col-span-4 flex flex-col justify-between rounded-3xl p-5 sm:p-6 glass border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs"
        >
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sb-muted light:text-[#686868]">
              Recruiter Quick Actions
            </h2>
            <p className="text-[11px] text-sb-muted light:text-[#686868] mt-0.5">
              Rapid access to talent sourcing and job publishing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 flex-1 justify-center">
            {/* Action 1: Post a Job */}
            <Link
              href="/industry/jobs/new"
              className="group relative flex items-center justify-between p-4 rounded-2xl border border-[#6366F1]/30 dark:border-sb-cyan/35 bg-gradient-to-br from-[#6366F1]/15 via-white/80 to-transparent dark:from-sb-cyan/15 dark:via-white/[0.03] text-[#171717] dark:text-white hover:border-[#6366F1] dark:hover:border-sb-cyan hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#6366F1] dark:bg-sb-cyan text-white dark:text-[#0B101D] group-hover:scale-110 transition-transform shadow-xs">
                  <Plus size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold text-[#4F46E5] dark:text-sb-cyan">Post a Job</p>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6366F1]/10 text-[#4F46E5] dark:bg-sb-cyan/20 dark:text-sb-cyan">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-sb-muted light:text-[#686868]">New internship or campus opening</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-sb-muted group-hover:translate-x-1 group-hover:text-[#4F46E5] dark:group-hover:text-sb-cyan transition-all" />
            </Link>

            {/* Action 2: Discover Talent */}
            <Link
              href="/industry/talent"
              className="group relative flex items-center justify-between p-4 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/[0.04] dark:to-transparent text-[#171717] dark:text-white hover:border-[#06B6D4]/50 dark:hover:border-sb-cyan/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#06B6D4]/15 dark:bg-sb-cyan/15 text-[#007BA7] dark:text-sb-cyan group-hover:scale-110 transition-transform shadow-xs">
                  <Compass size={18} />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold">Discover Talent</p>
                  <p className="text-[11px] text-sb-muted light:text-[#686868]">Search verified student pool</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-sb-muted group-hover:translate-x-1 group-hover:text-[#007BA7] dark:group-hover:text-sb-cyan transition-all" />
            </Link>
          </div>
        </section>
      </div>

      {/* 2. Recruitment Overview Cards (Strictly 4 cards in a row with 3D Parallax Tilt) */}
      <section
        aria-label="Recruitment overview metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both"
      >
        {/* Card 1: Active Job Listings */}
        <IndustryKpiCard3D
          href="/industry/jobs"
          title="Active Job Listings"
          value={<AnimatedNumber value={activeJobs.length} />}
          subtitle={`${jobs.length} total created`}
          trendText="Top Sourcing"
          badgeText="Open Roles"
          footerLeft="Manage active listings"
          footerRightText="View →"
          accentColor="cyan"
          icon={<Briefcase size={19} />}
        />

        {/* Card 2: Total Applicants */}
        <IndustryKpiCard3D
          href="/industry/applicants"
          title="Total Applicants"
          value={<AnimatedNumber value={applicants.length} />}
          subtitle={`${applicants.filter((a) => a.stage === "Applied").length} awaiting review`}
          trendText="+12% Weekly"
          badgeText="Candidate ATS"
          footerLeft="Candidate recruitment pipeline"
          footerRightText="Open ATS →"
          accentColor="violet"
          icon={<Users size={19} />}
        />

        {/* Card 3: Shortlisted Candidates */}
        <IndustryKpiCard3D
          href="/industry/applicants?stage=Shortlisted"
          title="Shortlisted Candidates"
          value={<AnimatedNumber value={shortlistedCount} />}
          subtitle={`${data.recruiter.savedCandidateIds.length} saved in talent pool`}
          trendText="High Match"
          badgeText="Matched Talent"
          footerLeft="High priority candidates"
          footerRightText="Review →"
          accentColor="emerald"
          icon={<Sparkles size={19} />}
        />

        {/* Card 4: Upcoming Interviews */}
        <IndustryKpiCard3D
          href="/industry/interviews"
          title="Upcoming Interviews"
          value={<AnimatedNumber value={upcomingInterviews.length} />}
          subtitle={`${interviews.length} total scheduled`}
          trendText="Campus Rounds"
          badgeText="Interview Sessions"
          footerLeft="Campus & tech evaluations"
          footerRightText="Schedule →"
          accentColor="amber"
          icon={<Calendar size={19} />}
        />
      </section>

      {/* 3. Main Two-Column Grid: Recent Applicants + Active Listings */}
      <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-200 fill-mode-both">
        {/* Recent Applicants */}
        <section className="glass flex min-w-0 flex-col p-6 sm:p-7 lg:col-span-7 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Recent Applicants</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/10 text-[#4F46E5] dark:bg-indigo-950/40 dark:text-indigo-300 border border-[#6366F1]/20 dark:border-indigo-400/30">
                  Live ATS
                </span>
              </div>
              <p className="text-xs text-sb-muted light:text-[#686868] mt-0.5">Candidates who applied to your published listings</p>
            </div>
            <Link href="/industry/applicants" className="btn btn-ghost btn-sm text-[#4F46E5] dark:text-sb-cyan font-semibold">
              Open ATS <ArrowRight size={14} />
            </Link>
          </div>

          {applicants.length === 0 ? (
            <EmptyState
              icon={<Users size={22} />}
              title="No applications received yet"
              text="Publish an internship or full-time role so students can discover and apply from the Student Portal, or shortlist candidates directly from Talent Discovery."
              action={
                <div className="flex flex-wrap justify-center gap-2.5">
                  <Link href="/industry/jobs/new" className="btn btn-primary btn-sm">
                    <Plus size={15} /> Create Job Listing
                  </Link>
                  <Link href="/industry/talent" className="btn btn-glass btn-sm">
                    Browse Student Talent
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {applicants.slice(0, 5).map((app) => (
                <div key={app.applicationId} className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1 group/cand transition-colors rounded-xl px-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={app.candidate.name} src={app.candidate.avatar} size={42} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-[var(--color-text)]">{app.candidate.name}</p>
                        {app.isDemoRecord && (
                          <span className="rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 text-[10px] text-sb-muted light:text-[#686868]">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-sb-muted light:text-[#686868]">
                        Applied for <span className="font-semibold text-[var(--color-text)]">{app.jobTitle}</span> · {formatDate(app.appliedAt)}
                      </p>
                      {app.candidate.skills.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {app.candidate.skills.slice(0, 3).map((s) => (
                            <span key={s.id} className="rounded-md border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-2 py-0.5 text-[11px] text-sb-muted light:text-[#686868]">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StagePill stage={app.stage} />
                    {app.stage === "Applied" && recruiter.role !== "Interviewer" && (
                      <button
                        type="button"
                        disabled={busyAppId === app.applicationId}
                        onClick={() => quickShortlist(app.applicationId, app.candidate.name)}
                        className="btn btn-glass btn-sm font-bold text-xs rounded-xl hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        Shortlist
                      </button>
                    )}
                    <Link
                      href={`/industry/applicants?jobId=${app.jobId}&appId=${app.applicationId}`}
                      className="btn btn-ghost btn-sm font-semibold text-xs text-[#007BA7] dark:text-sb-cyan"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Job Listings */}
        <section className="glass flex min-w-0 flex-col p-6 sm:p-7 lg:col-span-5 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Job Listings</h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">Manage status, deadlines, and pipelines</p>
            </div>
            <Link href="/industry/jobs" className="btn btn-ghost btn-sm text-[#4F46E5] dark:text-sb-cyan font-semibold">
              All jobs <ArrowRight size={14} />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={22} />}
              title="No job or internship listings yet"
              text="Create your first opportunity to reach students across engineering, design, and business disciplines."
              action={
                <Link href="/industry/jobs/new" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Post Your First Role
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map((job) => {
                const count = applicantCountByJob.get(job.id) ?? 0;
                return (
                  <div key={job.id} className="rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-4 transition-all hover:border-[#6366F1]/30 hover:shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/industry/jobs/${job.id}`} className="truncate font-bold text-[var(--color-text)] hover:text-[#4F46E5] dark:hover:text-sb-cyan block">
                          {job.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-sb-muted light:text-[#686868]">
                          {job.type} · {job.mode} · {job.location || "Remote"}
                        </p>
                      </div>
                      <JobStatusBadge job={job} now={now} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E3E3E3] dark:border-white/10 pt-3 text-xs text-sb-muted light:text-[#686868]">
                      <span>
                        <strong className="text-[var(--color-text)]">{count}</strong> applicant{count === 1 ? "" : "s"}
                        {job.deadline ? ` · Closes ${formatDate(job.deadline)}` : ""}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {recruiter.role !== "Interviewer" && (
                          <>
                            {job.status === "Published" ? (
                              <button
                                type="button"
                                disabled={busyJobId === job.id}
                                onClick={() => toggleJobStatus(job, "Paused")}
                                className="rounded-lg border border-[#E3E3E3] dark:border-white/10 px-2.5 py-1 text-[11px] font-medium text-sb-muted light:text-[#686868] hover:border-amber-400 hover:text-amber-600 dark:hover:border-white/25 dark:hover:text-white transition-colors"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyJobId === job.id}
                                onClick={() => toggleJobStatus(job, "Published")}
                                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:border-sb-cyan/40 dark:bg-sb-blue/15 px-2.5 py-1 text-[11px] font-medium dark:text-sb-cyan hover:bg-emerald-500/20 dark:hover:bg-sb-blue/25 transition-colors"
                              >
                                Publish
                              </button>
                            )}
                          </>
                        )}
                        <Link
                          href={`/industry/jobs/${job.id}`}
                          className="rounded-lg border border-[#E3E3E3] dark:border-white/10 px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] dark:hover:border-white/25 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 4. Upcoming Interviews & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-300 fill-mode-both">
        <section className="glass min-w-0 p-6 sm:p-7 lg:col-span-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Upcoming Interviews</h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">Scheduled technical and HR sessions</p>
            </div>
            <Link href="/industry/interviews" className="btn btn-ghost btn-sm text-[#4F46E5] dark:text-sb-cyan font-semibold">
              Schedule / Manage <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] p-6 text-center">
              <Calendar size={22} className="mx-auto text-[#4F46E5] dark:text-sb-cyan" />
              <p className="mt-2 text-sm font-bold text-[var(--color-text)]">No upcoming interviews scheduled</p>
              <p className="mt-1 text-xs text-sb-muted light:text-[#686868]">
                Schedule an interview from an applicant card or the Interviews tab.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.slice(0, 4).map((iv) => (
                <div key={iv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-3.5 transition-all hover:border-[#6366F1]/30">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text)]">{iv.candidateName}</p>
                    <p className="text-xs text-sb-muted light:text-[#686868]">
                      {iv.round} · {iv.jobTitle} ({iv.type})
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-[#4F46E5] dark:text-sb-cyan">
                      {new Date(iv.scheduledAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sb-muted light:text-[#686868]">{iv.durationMinutes} min · {iv.interviewer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass min-w-0 p-6 sm:p-7 lg:col-span-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Workspace Activity</h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">Real-time audit log of your recruitment actions</p>
            </div>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-sb-muted light:text-[#686868]">No workspace activity recorded yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {activities.slice(0, 6).map((act) => (
                <li key={act.id} className="flex items-start gap-3 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] px-3.5 py-2.5 text-xs transition-all hover:border-[#6366F1]/30">
                  <CheckCircle2 size={15} className="mt-0.5 flex-none text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <Link href={act.href} className="text-sb-text light:text-[#171717] hover:text-[#4F46E5] dark:hover:text-sb-cyan font-medium">
                      {act.text}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-sb-muted light:text-[#686868]">
                      <Clock size={10} /> {formatDate(act.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
