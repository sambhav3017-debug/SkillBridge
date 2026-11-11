"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, ChevronRight, HelpCircle, Sparkles, TrendingUp } from "lucide-react";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

export interface TRScoreBreakdown {
  score: number;
  tier: "Tier-1 Qualified" | "Placement Ready" | "Developing";
  skillsScore: number;
  projectsScore: number;
  completionScore: number;
}

export function computeTRScore(params: {
  skillsCount: number;
  projectsCount: number;
  completionPercent?: number;
  hasAssessments?: boolean;
}): TRScoreBreakdown {
  const completion = params.completionPercent ?? 85;
  const skillsScore = Math.min(100, Math.round((params.skillsCount / 5) * 100));
  const projectsScore = Math.min(100, Math.round((params.projectsCount / 2) * 100));
  const assessmentWeight = params.hasAssessments ? 5 : 0;

  const rawScore = Math.round(
    completion * 0.35 + skillsScore * 0.4 + projectsScore * 0.25 + assessmentWeight
  );
  const score = Math.min(100, Math.max(10, rawScore));

  let tier: TRScoreBreakdown["tier"] = "Developing";
  if (score >= 80) tier = "Tier-1 Qualified";
  else if (score >= 60) tier = "Placement Ready";

  return {
    score,
    tier,
    skillsScore,
    projectsScore,
    completionScore: completion,
  };
}

interface TRIndicatorProps {
  score?: number;
  skillsCount?: number;
  projectsCount?: number;
  completionPercent?: number;
  variant?: "badge" | "compact" | "card";
  showTooltip?: boolean;
  className?: string;
}

export function TRIndicator({
  score: explicitScore,
  skillsCount = 4,
  projectsCount = 2,
  completionPercent = 85,
  variant = "badge",
  showTooltip = true,
  className = "",
}: TRIndicatorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const breakdown = computeTRScore({
    skillsCount,
    projectsCount,
    completionPercent,
  });

  const finalScore = explicitScore !== undefined ? explicitScore : breakdown.score;
  const tier =
    finalScore >= 80
      ? "Tier-1 Qualified"
      : finalScore >= 60
      ? "Placement Ready"
      : "Developing";

  const tierColors =
    finalScore >= 80
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : finalScore >= 60
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";

  const ringColor =
    finalScore >= 80
      ? "text-emerald-500 dark:text-emerald-400"
      : finalScore >= 60
      ? "text-sky-500 dark:text-sky-400"
      : "text-amber-500 dark:text-amber-400";

  // COMPACT VARIANT (for data tables)
  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${tierColors}`}
          title={`Talent & Technical Readiness: ${finalScore}% (${tier})`}
        >
          <span className="font-sans font-semibold text-[9px] uppercase tracking-wider opacity-75">TR</span>
          <span><SpinningCounter value={finalScore} suffix="%" /></span>
        </span>
      </div>
    );
  }

  // CARD VARIANT (rich overview widget)
  if (variant === "card") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-5 backdrop-blur-md shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
              <Award size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#18181B] dark:text-white">
                Talent & Technical Readiness (TR)
              </h3>
              <p className="text-[11px] text-[#71717A] dark:text-sb-muted">
                Composite verified skills & project mastery
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tierColors}`}>
            <Sparkles size={11} />
            {tier}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-[#18181B] dark:text-white tracking-tight">
                <SpinningCounter value={finalScore} suffix="%" />
              </span>
              <span className="text-xs font-semibold text-sb-muted">TR Score</span>
            </div>
            <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
              Ranked against Tier-1 campus recruitment benchmarks.
            </p>
          </div>

          <div className="relative h-16 w-16 flex-none flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-black/5 dark:text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${ringColor} transition-all duration-700 ease-out`}
                strokeDasharray={`${finalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-[#18181B] dark:text-white">
              <SpinningCounter value={finalScore} suffix="%" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD BADGE VARIANT
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-[1.02] ${tierColors}`}
        aria-label={`Talent Readiness score: ${finalScore}%. Click for details.`}
      >
        <span className="h-2 w-2 rounded-full bg-current opacity-80 animate-pulse" />
        <span className="font-bold tracking-tight">TR <SpinningCounter value={finalScore} suffix="%" /></span>
        <span className="text-[10px] uppercase font-semibold tracking-wider opacity-75 hidden sm:inline">
          · {tier}
        </span>
        {showTooltip && (
          <HelpCircle size={12} className="opacity-60 group-hover:opacity-100 ml-0.5" />
        )}
      </button>

      {/* Popover Breakdown Dialog */}
      {popoverOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setPopoverOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Talent Readiness Explanation"
            className="absolute left-0 top-full mt-2 z-40 w-72 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#18181B] p-4 shadow-xl text-left"
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <Award size={14} className="text-orange-500 dark:text-sb-cyan" />
                <span className="text-xs font-bold text-[#18181B] dark:text-white">
                  Talent & Technical Readiness
                </span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${tierColors}`}>
                {tier}
              </span>
            </div>

            <p className="mt-2 text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              <strong>TR</strong> is a verified composite index combining your skill depth, portfolio projects, and assessment milestones against Tier-1 hiring standards.
            </p>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-sb-muted">Skill Depth</span>
                <span className="font-mono font-semibold text-sb-text"><SpinningCounter value={breakdown.skillsScore} suffix="%" /></span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-sb-muted">Verified Projects</span>
                <span className="font-mono font-semibold text-sb-text"><SpinningCounter value={breakdown.projectsScore} suffix="%" /></span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-sb-muted">Profile Completeness</span>
                <span className="font-mono font-semibold text-sb-text"><SpinningCounter value={breakdown.completionScore} suffix="%" /></span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 text-right">
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="text-[11px] font-semibold text-sb-cyan hover:underline"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
