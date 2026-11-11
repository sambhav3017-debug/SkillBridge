"use client";

import { CalendarClock, MapPin } from "lucide-react";
import type { Opportunity } from "@/lib/student/types";
import { ActionButtons, deadlineText } from "./OpportunityParts";
import { useInteractiveTilt } from "./useInteractiveTilt";

interface RecommendedOpportunityCardProps {
  opportunity: Opportunity;
  mySkills: Set<string>;
  onView: (o: Opportunity) => void;
}

export default function RecommendedOpportunityCard({
  opportunity: o,
  mySkills,
  onView,
}: RecommendedOpportunityCardProps) {
  // Independent interactive 3D perspective tilt & pointer-tracking for each opportunity card
  const {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  } = useInteractiveTilt({
    maxDeg: 5, // Restrained, refined tilt angle suitable for stacked cards
    perspective: 800,
    translateY: -2,
  });

  return (
    <article
      ref={cardRef}
      id={`recommended-opportunity-${o.id}`}
      data-testid="recommended-opportunity-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={transformStyle}
      className={`group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-4 sm:p-5 outline-none transition-all duration-300 trust-glass-card ${
        tilt
          ? "border-sb-cyan/40 dark:border-sb-cyan/40 shadow-[0_12px_32px_-8px_rgba(0,123,167,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] light:shadow-[0_10px_28px_-6px_rgba(255,106,0,0.18),inset_0_1px_0_#FFFFFF] light:border-[#FF6A00]/40"
          : "border-white/10 dark:border-white/10 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] light:border-[#E3E3E3] light:bg-[#FFFFFF] light:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04),inset_0_1px_0_#FFFFFF]"
      }`}
    >
      {/* 1. Base Resting Ambient Lighting Gradients */}
      <div
        className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[#007BA7]/10 blur-[60px] dark:bg-sb-cyan/10 light:bg-[#FF6A00]/8 transition-opacity duration-500"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-[#FF2D95]/8 blur-[60px] dark:bg-sb-pink/8 light:bg-[#FF9F1C]/6 transition-opacity duration-500"
        aria-hidden="true"
      />

      {/* 2. Dynamic Mouse-Synchronized Surface Illumination (Dark Mode) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 ease-out hidden dark:block"
        style={{
          opacity: tilt && !prefersReduced ? 1 : 0,
          background: `
            radial-gradient(360px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(0, 123, 167, 0.22) 0%, rgba(116, 59, 255, 0.10) 35%, rgba(255, 45, 149, 0.05) 60%, transparent 80%),
            radial-gradient(150px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)
          `,
        }}
        aria-hidden="true"
      />

      {/* 3. Dynamic Mouse-Synchronized Surface Illumination (Light Mode) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 ease-out block dark:hidden"
        style={{
          opacity: tilt && !prefersReduced ? 1 : 0,
          background: `
            radial-gradient(340px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(255, 106, 0, 0.12) 0%, rgba(255, 159, 28, 0.06) 35%, rgba(217, 56, 32, 0.02) 60%, transparent 80%),
            radial-gradient(140px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(255, 255, 255, 0.70) 0%, transparent 70%)
          `,
        }}
        aria-hidden="true"
      />

      {/* 4. Top Edge Specular Highlight that follows Cursor X Position */}
      <div
        className="pointer-events-none absolute -top-px h-[1.5px] rounded-full transition-all duration-150 ease-out"
        style={{
          left: tilt && !prefersReduced ? `calc(${tilt.px}% - 60px)` : "calc(50% - 40px)",
          width: tilt && !prefersReduced ? "120px" : "80px",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 106, 0, 0.85) 50%, transparent)",
          opacity: tilt && !prefersReduced ? 1 : 0.35,
        }}
        aria-hidden="true"
      />

      {/* 5. Primary Opportunity Details */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="rounded-md bg-sb-blue/10 px-2 py-0.5 text-[11px] font-semibold text-sb-cyan light:bg-orange-500/10 light:text-[#E94E00] light:border light:border-orange-500/20">
            {o.type}
          </span>
          <span className="text-xs text-sb-muted font-medium flex items-center gap-1 light:text-[#686868]">
            <MapPin size={12} className="text-sb-muted light:text-[#FF6A00]" /> {o.mode} · {o.location}
          </span>
          <span className="text-xs text-sb-muted font-medium flex items-center gap-1 light:text-[#686868]">
            <CalendarClock size={12} className="text-sb-muted light:text-[#FF9F1C]" /> {deadlineText(o.deadline)}
          </span>
        </div>

        <h3 className="text-base font-bold text-sb-text light:text-[#171717] truncate group-hover:text-sb-cyan light:group-hover:text-[#FF6A00] transition-colors">
          {o.title}
        </h3>
        <p className="text-xs text-sb-muted light:text-[#686868] font-medium mt-0.5">
          {o.org}
        </p>

        {/* Matched skills chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {o.skills.slice(0, 4).map((s) => {
            const isMatched = mySkills.has(s.toLowerCase());
            return (
              <span
                key={s}
                className={`btn-bounce-sm rounded-md px-2 py-0.5 text-[10px] font-medium transition-all cursor-default ${
                  isMatched
                    ? "bg-sb-cyan/15 text-sb-cyan border border-sb-cyan/30 light:bg-orange-50 light:text-[#E94E00] light:border light:border-orange-200"
                    : "bg-black/5 dark:bg-white/5 text-sb-muted light:bg-[#F7F7F7] light:text-[#686868] light:border light:border-[#E3E3E3]"
                }`}
              >
                {s}
              </span>
            );
          })}
          {o.skills.length > 4 && (
            <span className="text-[10px] text-sb-muted light:text-[#686868] self-center font-medium">
              +{o.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* 6. Action Controls (Elevated above lighting to preserve clean clicks & navigation) */}
      <div className="relative z-10 flex sm:flex-col items-center sm:items-end gap-2 flex-none pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--glass-border)] light:border-[#E3E3E3]">
        <ActionButtons o={o} onView={() => onView(o)} compact />
      </div>
    </article>
  );
}
