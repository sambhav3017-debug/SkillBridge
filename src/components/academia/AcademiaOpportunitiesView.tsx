"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Loader2, Share2 } from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { EmptyState, PageHeader, formatDate } from "@/components/student/ui";
import { SearchInput } from "@/components/ui/SearchInput";

export default function AcademiaOpportunitiesView() {
  const { data, managePlacements, notify } = useAcademia();
  const { staff, departments, industryJobs, sharedJobEndorsements } = data;
  const canEndorse = staff.role !== "Read-Only Analyst";

  const [q, setQ] = useState("");
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  const endorsedMap = new Map(sharedJobEndorsements.map((s) => [s.jobId, s]));

  const filtered = industryJobs.filter((j) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return [j.title, j.companyName, j.type, j.location, ...j.requiredSkills]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const handleEndorse = async (jobId: string, title: string) => {
    setBusyJobId(jobId);
    const res = await managePlacements(
      {
        endorseJobId: jobId,
        targetDepartments: departments.map((d) => d.code),
      },
      "POST",
    );
    setBusyJobId(null);
    if (res.ok) notify("success", `Shared “${title}” with eligible departments.`);
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employer Job & Internship Opportunities"
        subtitle="Review live internships and graduate roles published by companies in the Industry Portal and endorse them for your students."
      />

      <div className="glass p-4">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search employer opportunities by title, company, skill, or location…"
          aria-label="Search employer opportunities"
          portalVariant="academia"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="No published employer listings found"
          text="When companies publish internships or full-time roles in the Industry Portal, they automatically appear here for Placement Cell review."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((j) => {
            const endorsed = endorsedMap.get(j.id);
            return (
              <article key={j.id} className="glass flex flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                      {j.companyName}
                    </span>
                    <span className="chip">{j.type}</span>
                  </div>

                  <h2 className="mt-2.5 text-lg font-bold">{j.title}</h2>
                  <p className="mt-1 text-xs text-sb-muted">
                    {j.department} · {j.mode} · {j.location}
                    {j.salaryRange ? ` · ${j.salaryRange} (${j.currency})` : ""}
                  </p>

                  <p className="mt-3 line-clamp-3 text-xs text-sb-text">{j.description}</p>

                  {j.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.requiredSkills.map((sk) => (
                        <span key={sk} className="chip">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5 text-xs">
                  <span className="text-sb-muted">
                    {j.deadline ? `Deadline: ${formatDate(j.deadline)}` : "Open"} · {j.openings} opening(s)
                  </span>

                  {endorsed ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-sb-cyan">
                      <CheckCircle2 size={14} /> Shared with Students ({endorsed.sharedBy})
                    </span>
                  ) : (
                    canEndorse && (
                      <button
                        type="button"
                        disabled={busyJobId === j.id}
                        onClick={() => handleEndorse(j.id, j.title)}
                        className="btn btn-primary btn-sm"
                      >
                        {busyJobId === j.id ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
                        Share with Eligible Students
                      </button>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
