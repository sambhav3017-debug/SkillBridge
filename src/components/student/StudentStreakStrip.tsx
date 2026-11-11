"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame, Sparkles } from "lucide-react";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface StudentStreakStripProps {
  currentStreakDays?: number;
}

export default function StudentStreakStrip({
  currentStreakDays = 5,
}: StudentStreakStripProps) {
  const weekDays = [
    { label: "Mon", done: true },
    { label: "Tue", done: true },
    { label: "Wed", done: true },
    { label: "Thu", done: true },
    { label: "Fri", done: true, isToday: true },
    { label: "Sat", done: false },
    { label: "Sun", done: false },
  ];

  return (
    <section
      aria-label="Student Learning and Placement Streak"
      className="card-interactive relative overflow-hidden rounded-3xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-[var(--card-glass-border)] p-5 sm:p-6 shadow-sm select-none"
    >
      {/* Background Accent Glow in Light Mode (Warm Orange) & Dark Mode (Cerulean Blue) */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-orange-500/10 dark:bg-sb-cyan/10 blur-[50px]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Streak Icon & Motivational Status Message */}
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#FF5B00] to-[#FFA040] text-white shadow-md flex-none">
            <Flame size={24} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-[#E94E00] dark:bg-sb-cyan/10 dark:text-sb-cyan px-2.5 py-0.5 rounded-full border border-orange-500/20 dark:border-transparent">
                <Sparkles size={11} />
                Daily Discipline
              </span>
              <span className="text-xs font-semibold text-[#686868] dark:text-sb-muted">
                Cohort Rank: Top 5%
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#171717] dark:text-white mt-1">
              You&apos;re on a <SpinningCounter value={currentStreakDays} />-day placement readiness streak!
            </h3>
            <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 max-w-xl">
              Complete your daily skill audit or application review to maintain tier-1 campus recruiter visibility.
            </p>
          </div>
        </div>

        {/* Middle: Horizontal Sequence of Day Indicators (Mon-Sun) */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          {weekDays.map((d) => (
            <div
              key={d.label}
              className={`btn-bounce-sm flex flex-col items-center justify-center w-10 sm:w-11 py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                d.isToday
                  ? "bg-gradient-to-b from-[#FF6A00] to-[#E63900] text-white border-transparent shadow-md scale-105"
                  : d.done
                  ? "bg-orange-500/10 text-[#FF6A00] border-orange-200/80 dark:bg-sb-cyan/10 dark:text-sb-cyan dark:border-sb-cyan/25"
                  : "bg-[#F7F7F7] dark:bg-white/[0.02] text-[#686868] dark:text-[#A1A1AA] border-[#E3E3E3] dark:border-white/10"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase">{d.label}</span>
              <span className="mt-1 flex items-center justify-center h-4 w-4">
                {d.done ? (
                  <Check size={13} className="stroke-[3]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4D4D8] dark:bg-white/20" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Strong Pill-Shaped Action Button (Matching Reference) */}
        <div className="flex items-center gap-3 flex-none">
          <Link
            href="/student/skills"
            className="btn-bounce group/cta inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] dark:bg-white text-white dark:text-[#18181B] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-[0_4px_14px_-2px_rgba(255,106,0,0.35)] dark:shadow-md hover:brightness-105 dark:hover:bg-neutral-100 transition-all"
          >
            <span>Continue Streak</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
