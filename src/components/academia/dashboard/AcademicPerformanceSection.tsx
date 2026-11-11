"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
} from "lucide-react";
import type { InstitutionStudentRecord } from "@/lib/academia/types";
import AcademiaSpatialHub3D from "../AcademiaSpatialHub3D";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface PerformanceSectionProps {
  students: InstitutionStudentRecord[];
  activePartnersCount?: number;
}

const PALETTE = ["#007ba7", "#4f46e5", "#10b981", "#7c3aed", "#f59e0b", "#ec4899"];

export default function AcademicPerformanceSection({
  students,
  activePartnersCount = 18,
}: PerformanceSectionProps) {

  // 1. Top Verified Skills
  const skillBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      for (const sk of s.skills || []) {
        counts.set(sk.name, (counts.get(sk.name) ?? 0) + 1);
      }
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalOccurrences = sorted.reduce((acc, [, c]) => acc + c, 0);

    return sorted.map(([name, count], i) => ({
      name,
      count,
      pct: totalOccurrences > 0 ? Math.round((count / totalOccurrences) * 100) : 0,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [students]);

  // 2. Student Application Stages Funnel
  const funnelStages = useMemo(() => {
    const counts = {
      Applied: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Interview: 0,
      "Offer / Hired": 0,
    };

    for (const s of students) {
      const stage = s.latestStage || (s.placementStatus === "Placed" ? "Hired" : "Applied");
      if (stage === "Applied") counts.Applied += 1;
      else if (stage === "Under Review") counts["Under Review"] += 1;
      else if (stage === "Shortlisted") counts.Shortlisted += 1;
      else if (stage === "Interview") counts.Interview += 1;
      else if (stage === "Offer" || stage === "Hired") counts["Offer / Hired"] += 1;
      else counts.Applied += 1;
    }

    const max = Math.max(...Object.values(counts), 1);

    return [
      { stage: "Applied", count: counts.Applied, pct: Math.round((counts.Applied / max) * 100), color: "#007ba7" },
      { stage: "Under Review", count: counts["Under Review"], pct: Math.round((counts["Under Review"] / max) * 100), color: "#38bdf8" },
      { stage: "Shortlisted", count: counts.Shortlisted, pct: Math.round((counts.Shortlisted / max) * 100), color: "#818cf8" },
      { stage: "Interview", count: counts.Interview, pct: Math.round((counts.Interview / max) * 100), color: "#f59e0b" },
      { stage: "Offer / Hired", count: counts["Offer / Hired"], pct: Math.round((counts["Offer / Hired"] / max) * 100), color: "#10b981" },
    ];
  }, [students]);

  // 3. Overall Readiness & CGPA Stats
  const performanceStats = useMemo(() => {
    const total = students.length;
    const withProjects = students.filter((s) => s.projects && s.projects.length > 0).length;
    const withCerts = students.filter((s) => s.certifications && s.certifications.length > 0).length;
    const avgCompletion =
      total > 0 ? Math.round(students.reduce((acc, s) => acc + s.profileCompletion, 0) / total) : 0;
    const placed = students.filter(
      (s) => s.placementStatus === "Placed" || s.placementStatus === "Internship Secured"
    ).length;
    const eligible = students.filter((s) => s.placementEligible).length;
    const placementRate = eligible > 0 ? Math.round((placed / eligible) * 100) : 0;

    return {
      total,
      withProjects,
      withCerts,
      avgCompletion,
      placementRate,
      placed,
      eligible,
    };
  }, [students]);

  return (
    <section
      aria-labelledby="academic-performance-title"
      className="glass group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-lg hover:border-[#007BA7]/30 dark:hover:border-sb-cyan/30"
    >
      {/* Specular Edge Top Rim */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20 select-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[#7C3AED]/35 bg-gradient-to-br from-[#7C3AED]/20 to-[#4F46E5]/10 text-[#7C3AED] dark:text-purple-300 shadow-sm">
            <Award size={19} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="academic-performance-title" className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text)]">
                Academic Performance &amp; Career Readiness
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007ba7]/10 text-[#007ba7] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-[#007ba7]/20 dark:border-sb-cyan/30">
                Institutional Matrix
              </span>
            </div>
            <p className="text-xs text-sb-muted light:text-[#686868] mt-0.5">
              ATS recruitment pipeline progression, verified skill clusters &amp; spatial topology
            </p>
          </div>
        </div>

        <Link
          href="/academia/reports"
          className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-[#007BA7] dark:text-sb-cyan hover:border-[#007BA7]/40 dark:hover:border-sb-cyan/40 shadow-xs transition-all"
          title="Open NIRF & Accreditation Analytics"
        >
          Full Accreditation Reports <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Main Grid: Application Funnel + Interactive 3D Spatial Hub */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Application Pipeline Funnel (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white/50 dark:bg-black/20 p-5 lg:col-span-7">
          <div>
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-sb-muted light:text-[#686868]">
                Corporate Recruitment Pipeline Funnel
              </span>
              <span className="font-bold text-[#007ba7] dark:text-sb-cyan bg-[#007ba7]/10 dark:bg-sb-cyan/15 px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                <SpinningCounter value={performanceStats.placed} /> of <SpinningCounter value={performanceStats.eligible} /> Placed (<SpinningCounter value={performanceStats.placementRate} suffix="%" />)
              </span>
            </div>

            <div className="space-y-3">
              {funnelStages.map((item) => (
                <div
                  key={item.stage}
                  className="group/stage rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-3 text-xs transition-all hover:border-[#007ba7]/30 hover:shadow-xs"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-[var(--color-text)]">{item.stage}</span>
                    </div>
                    <span className="font-semibold text-sb-muted light:text-[#686868] inline-flex items-center gap-1">
                      <SpinningCounter value={item.count} /> student{item.count === 1 ? "" : "s"} (<SpinningCounter value={item.pct} suffix="%" />)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(item.count > 0 ? 8 : 0, item.pct)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Readiness Metrics Bar */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#E3E3E3] dark:border-white/10 pt-3.5 text-[11px]">
            <div className="rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-2.5">
              <span className="text-sb-muted light:text-[#686868] block">Profile Readiness:</span>
              <strong className="text-sm font-extrabold text-[var(--color-text)] flex items-center gap-1">
                <SpinningCounter value={performanceStats.avgCompletion} suffix="%" /> Avg
              </strong>
            </div>
            <div className="rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-2.5">
              <span className="text-sb-muted light:text-[#686868] block">Capstone Projects:</span>
              <strong className="text-sm font-extrabold text-[#007ba7] dark:text-sb-cyan flex items-center gap-1">
                <SpinningCounter value={performanceStats.withProjects} /> Students
              </strong>
            </div>
            <div className="rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-2.5">
              <span className="text-sb-muted light:text-[#686868] block">Certifications:</span>
              <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <SpinningCounter value={performanceStats.withCerts} /> Verified
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Interactive 3D Spatial Knowledge & Placement Core (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <AcademiaSpatialHub3D
            placementRate={performanceStats.placementRate}
            totalStudents={performanceStats.total}
            topSkills={skillBreakdown}
            activePartnersCount={activePartnersCount}
            className="h-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E3E3E3] dark:border-[var(--glass-border)] pt-3.5 text-xs text-sb-muted light:text-[#686868]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Evaluated in real-time from student credentials &amp; institutional ATS tracking</span>
        </div>
        <Link href="/academia/reports" className="font-bold text-[#007BA7] dark:text-sb-cyan hover:underline">
          Export NAAC/NIRF Ready Dataset →
        </Link>
      </div>
    </section>
  );
}
