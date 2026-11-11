"use client";

import Link from "next/link";
import {
  Award,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Flame,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { StudentData } from "@/lib/student/types";

interface StudentAnalyticsSectionProps {
  data: StudentData;
  completionPercent: number;
}

export default function StudentAnalyticsSection({
  data,
  completionPercent,
}: StudentAnalyticsSectionProps) {
  // Skill proficiency counts
  const advancedCount = data.skills.filter((s) => s.level === "Advanced").length;
  const intermediateCount = data.skills.filter((s) => s.level === "Intermediate").length;
  const beginnerCount = data.skills.filter((s) => s.level === "Beginner").length;
  const totalSkills = data.skills.length;

  // Placement readiness indices
  const skillReadiness = Math.min(Math.round((totalSkills / 6) * 100), 100);
  const projectReadiness = Math.min(Math.round((data.projects.length / 2) * 100), 100);
  const overallReadiness = Math.round(
    completionPercent * 0.4 + skillReadiness * 0.35 + projectReadiness * 0.25
  );

  return (
    <section
      aria-labelledby="student-analytics-heading"
      className="rounded-3xl border border-[var(--card-glass-border)] bg-[var(--card-glass-bg)] p-6 sm:p-7 shadow-sm light:bg-[#FFFFFF] light:border-[#202536]/[0.08] backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--glass-border)] light:border-[#202536]/[0.06] gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-sb-cyan/10 text-sb-cyan light:bg-[#007BA7]/10 light:text-[#007BA7]">
            <BarChart3 size={17} />
          </span>
          <div>
            <h2
              id="student-analytics-heading"
              className="text-base sm:text-lg font-bold text-sb-text light:text-[#202536]"
            >
              Skill Competency Matrix & Placement Velocity
            </h2>
            <p className="text-xs text-sb-muted light:text-[#596579]">
              Verified technical benchmarks against Tier-1 campus recruitment criteria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sb-cyan/10 text-sb-cyan light:bg-[#007BA7]/10 light:text-[#007BA7]">
            <Flame size={12} className="text-sb-pink light:text-[#FF2D95]" />
            Top 10% Batch Cohort
          </span>
          <Link
            href="/student/skills"
            className="text-xs font-semibold text-sb-cyan hover:text-sb-pink light:text-[#007BA7] light:hover:text-[#FF2D95] flex items-center gap-1 transition-colors"
          >
            Manage skills <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Skill Matrix, Right Placement Readiness Indices */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Col (7/12): Skill Distribution & Tags */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sb-muted light:text-[#596579] mb-3">
              <span>Verified Competencies ({totalSkills})</span>
              <span className="font-mono text-sb-text light:text-[#202536]">
                {advancedCount} Adv · {intermediateCount} Inter · {beginnerCount} Beg
              </span>
            </div>

            {/* Proficiency Distribution Bar */}
            <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-sb-cyan to-sb-blue light:from-[#007BA7] light:to-[#38BDF8]"
                style={{ width: `${totalSkills ? (advancedCount / totalSkills) * 100 : 33}%` }}
                title={`Advanced: ${advancedCount}`}
              />
              <div
                className="h-full bg-gradient-to-r from-[#743BFF] to-sb-pink light:from-[#743BFF] light:to-[#FF2D95]"
                style={{ width: `${totalSkills ? (intermediateCount / totalSkills) * 100 : 33}%` }}
                title={`Intermediate: ${intermediateCount}`}
              />
              <div
                className="h-full bg-amber-400/80 light:bg-amber-500"
                style={{ width: `${totalSkills ? (beginnerCount / totalSkills) * 100 : 34}%` }}
                title={`Beginner: ${beginnerCount}`}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-sb-muted light:text-[#596579]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sb-cyan light:bg-[#007BA7]" />
                Advanced ({advancedCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sb-pink light:bg-[#FF2D95]" />
                Intermediate ({intermediateCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 light:bg-amber-500" />
                Beginner ({beginnerCount})
              </span>
            </div>
          </div>

          {/* Skill Tag Pills */}
          <div>
            <p className="text-xs font-semibold text-sb-text light:text-[#202536] mb-2.5">
              Verified Technical Skills
            </p>
            {data.skills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--glass-border)] p-4 text-center text-xs text-sb-muted">
                No skills added yet. Add at least 3 skills to unlock recruiter matching.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s) => (
                  <span
                    key={s.id}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all ${
                      s.level === "Advanced"
                        ? "border-sb-cyan/35 bg-sb-cyan/10 text-sb-cyan light:border-[#007BA7]/25 light:bg-[#007BA7]/10 light:text-[#007BA7]"
                        : s.level === "Intermediate"
                        ? "border-sb-pink/35 bg-sb-pink/10 text-sb-pink light:border-[#FF2D95]/25 light:bg-[#FF2D95]/10 light:text-[#FF2D95]"
                        : "border-white/15 bg-white/5 text-sb-muted light:border-[#E5E7EF] light:bg-[#F8F6F2] light:text-[#596579]"
                    }`}
                  >
                    <Award size={12} />
                    <span>{s.name}</span>
                    <span className="text-[10px] font-mono opacity-80">· {s.level}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col (5/12): Readiness Indexes & Score Card */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--glass-border)] bg-black/[0.02] dark:bg-white/[0.02] light:bg-[#F8F6F2] p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sb-muted light:text-[#596579] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Day-0 Readiness Score
            </span>
            <span className="text-2xl font-extrabold font-mono text-sb-text light:text-[#202536]">
              {overallReadiness}%
            </span>
          </div>

          {/* Sub-Metric Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-sb-muted light:text-[#596579]">Profile Completeness</span>
                <span className="font-semibold text-sb-text light:text-[#202536]">
                  {completionPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sb-cyan light:bg-[#007BA7]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-sb-muted light:text-[#596579]">Skill Verification Depth</span>
                <span className="font-semibold text-sb-text light:text-[#202536]">
                  {skillReadiness}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sb-pink light:bg-[#FF2D95]"
                  style={{ width: `${skillReadiness}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-sb-muted light:text-[#596579]">Capstone Portfolio</span>
                <span className="font-semibold text-sb-text light:text-[#202536]">
                  {projectReadiness}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 light:bg-[#743BFF]"
                  style={{ width: `${projectReadiness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--glass-border)] light:border-[#202536]/[0.06] flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <CheckCircle size={13} />
              Eligible for Shortlisting
            </span>
            <Link
              href="/student/profile"
              className="font-semibold text-sb-cyan light:text-[#007BA7] hover:underline flex items-center gap-0.5"
            >
              Audit <TrendingUp size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
