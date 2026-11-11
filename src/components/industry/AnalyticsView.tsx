"use client";

import { useMemo, useState } from "react";
import { BarChart3, Briefcase, Calendar, Download, Sparkles, Users } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { EmptyState, PageHeader } from "@/components/student/ui";
import { ATS_STAGES } from "@/lib/industry/types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

const STAGE_BAR_COLORS: Record<string, string> = {
  Applied: "bg-slate-500",
  "Under Review": "bg-sky-500",
  Shortlisted: "bg-indigo-500",
  Interview: "bg-purple-500",
  Offer: "bg-amber-500",
  Hired: "bg-emerald-500",
  Rejected: "bg-slate-400 dark:bg-slate-600",
};

export default function AnalyticsView() {
  const { data } = useIndustry();
  const { jobs, applicants, interviews } = data;
  const [jobFilter, setJobFilter] = useState<string>("All");

  const scopedApplicants = useMemo(
    () => (jobFilter === "All" ? applicants : applicants.filter((a) => a.jobId === jobFilter)),
    [applicants, jobFilter],
  );

  const stageCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of ATS_STAGES) map.set(s, 0);
    for (const a of scopedApplicants) {
      map.set(a.stage, (map.get(a.stage) ?? 0) + 1);
    }
    return map;
  }, [scopedApplicants]);

  const totalApps = scopedApplicants.length;
  const shortlistedPlus = scopedApplicants.filter((a) =>
    ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.stage),
  ).length;
  const interviewedPlus = scopedApplicants.filter((a) =>
    ["Interview", "Offer", "Hired"].includes(a.stage),
  ).length;
  const offersExtended = scopedApplicants.filter((a) => ["Offer", "Hired"].includes(a.stage)).length;
  const hiredApps = scopedApplicants.filter((a) => a.stage === "Hired");

  const avgTimeToHireDays = useMemo(() => {
    if (hiredApps.length === 0) return null;
    let totalDays = 0;
    let validCount = 0;
    for (const a of hiredApps) {
      const start = +new Date(a.appliedAt);
      const hiredEntry = [...a.history].reverse().find((h) => h.stage === "Hired");
      const end = hiredEntry ? +new Date(hiredEntry.changedAt) : start;
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        totalDays += (end - start) / 86_400_000;
        validCount++;
      }
    }
    return validCount > 0 ? Math.max(1, Math.round(totalDays / validCount)) : null;
  }, [hiredApps]);

  const appsByJob = useMemo(() => {
    return jobs.map((j) => ({
      job: j,
      count: applicants.filter((a) => a.jobId === j.id).length,
      shortlisted: applicants.filter(
        (a) => a.jobId === j.id && ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.stage),
      ).length,
    }));
  }, [jobs, applicants]);

  const exportAnalyticsCsv = () => {
    const headers = ["Job Title", "Status", "Type", "Total Applicants", "Shortlisted or Beyond"];
    const rows = appsByJob.map((r) => [
      r.job.title,
      r.job.status,
      r.job.type,
      String(r.count),
      String(r.shortlisted),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skillbridge-hiring-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Analytics & Insights"
        subtitle="Track real recruitment performance across your job listings, pipeline funnel stages, and interview conversions."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter analytics by job"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="field h-9 w-auto py-1 text-xs"
            >
              <option value="All">All Job Listings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            {jobs.length > 0 && (
              <button type="button" onClick={exportAnalyticsCsv} className="btn btn-glass btn-sm">
                <Download size={14} /> Download Report
              </button>
            )}
          </div>
        }
      />

      {/* Top Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sb-muted">
            <span>Total Applications</span>
            <Users size={16} className="text-sb-cyan" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            <SpinningCounter value={totalApps} />
          </p>
          <p className="mt-1 text-xs text-sb-muted">
            Across {jobFilter === "All" ? `${jobs.length} listing(s)` : "selected role"}
          </p>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sb-muted">
            <span>Shortlist Conversion</span>
            <Sparkles size={16} className="text-sb-pink" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            <SpinningCounter value={totalApps > 0 ? Math.round((shortlistedPlus / totalApps) * 100) : 0} suffix="%" />
          </p>
          <p className="mt-1 text-xs text-sb-muted">
            {shortlistedPlus} of {totalApps} shortlisted or beyond
          </p>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sb-muted">
            <span>Interview Conversion</span>
            <Calendar size={16} className="text-sb-cyan" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            <SpinningCounter value={totalApps > 0 ? Math.round((interviewedPlus / totalApps) * 100) : 0} suffix="%" />
          </p>
          <p className="mt-1 text-xs text-sb-muted">
            {interviews.length} interview session(s) scheduled
          </p>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sb-muted">
            <span>Offers & Hires</span>
            <Briefcase size={16} className="text-sb-cyan" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            <SpinningCounter value={offersExtended} />
          </p>
          <p className="mt-1 text-xs text-sb-muted">
            {avgTimeToHireDays !== null
              ? `Avg. time-to-hire: ${avgTimeToHireDays} day(s)`
              : `${hiredApps.length} hired (time-to-hire computed after hires)`}
          </p>
        </div>
      </div>

      {jobs.length === 0 && applicants.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={22} />}
          title="No recruitment metrics recorded yet"
          text="Analytics are computed strictly from real job listings and candidate pipeline transitions — never fabricated."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Pipeline Stage Funnel */}
          <section className="glass p-6 lg:col-span-6">
            <h2 className="text-base font-bold">Pipeline Stage Distribution</h2>
            <p className="text-xs text-sb-muted">Candidate count at each stage of your ATS funnel</p>

            <div className="mt-5 space-y-3.5">
              {ATS_STAGES.map((stage) => {
                const count = stageCounts.get(stage) ?? 0;
                const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                return (
                  <div key={stage}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{stage}</span>
                      <span className="text-sb-muted inline-flex items-center gap-1">
                        <SpinningCounter value={count} /> (<SpinningCounter value={pct} suffix="%" />)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${STAGE_BAR_COLORS[stage] || "bg-sky-500"}`}
                        style={{ width: `${Math.max(count > 0 ? 6 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Applications Per Job Listing */}
          <section className="glass p-6 lg:col-span-6">
            <h2 className="text-base font-bold">Performance by Job Listing</h2>
            <p className="text-xs text-sb-muted">Applications and shortlisted candidates per role</p>

            {appsByJob.length === 0 ? (
              <p className="mt-4 text-xs text-sb-muted">No job listings created yet.</p>
            ) : (
              <div className="mt-4 divide-y divide-white/10">
                {appsByJob.map(({ job, count, shortlisted }) => (
                  <div key={job.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{job.title}</p>
                      <p className="text-xs text-sb-muted">
                        {job.type} · {job.status} · {job.mode}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-white">{count} applicant(s)</p>
                      <p className="text-sb-cyan">{shortlisted} shortlisted+</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
