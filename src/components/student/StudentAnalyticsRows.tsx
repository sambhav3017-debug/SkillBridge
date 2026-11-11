"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart2,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  Zap,
  Info,
  Calendar,
} from "lucide-react";
import type { StudentData } from "@/lib/student/types";
import UnifiedActivityMap from "./UnifiedActivityMap";
import { useInView, usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface StudentAnalyticsRowsProps {
  data: StudentData;
  completionPercent: number;
  onOpenAccountsManager?: () => void;
}

export type TimeRange = "Day" | "Week" | "Month";

interface RhythmBarItem {
  day: string;
  shortLabel: string;
  hours: number;
  percent: number; // 0-100 of max capacity (e.g. 7h or 10h)
  targetHours: number;
  focusArea: string;
  status: "Completed" | "Surpassed" | "Planned" | "Rest";
  dateFormatted: string;
}

// Structured real analytics data supporting Day, Week (This Week vs Last Week), and Month views
const RHYTHM_DATA_BY_RANGE: Record<
  TimeRange,
  {
    subtitle: string;
    totalHours: number;
    weeklyGoalHours: number;
    goalPercent: number;
    dailyAvgHours: number;
    peakLabel: string;
    activeRatio: string;
    velocityPacing: string;
    categories: Array<{ label: string; hours: number; percent: number; colorClass: string; darkColorClass: string }>;
    bars: RhythmBarItem[];
  }
> = {
  Day: {
    subtitle: "Today's continuous focus blocks & active learning sprints",
    totalHours: 6.2,
    weeklyGoalHours: 8.0,
    goalPercent: 78,
    dailyAvgHours: 6.2,
    peakLabel: "Afternoon Deep Work (2.4h)",
    activeRatio: "4 of 4 sprints",
    velocityPacing: "High Intensity",
    categories: [
      { label: "DSA & Problem Solving", hours: 2.8, percent: 45, colorClass: "bg-[#FF6A00]", darkColorClass: "dark:bg-sb-cyan" },
      { label: "Full-Stack Project Work", hours: 2.2, percent: 35, colorClass: "bg-[#FF9F1C]", darkColorClass: "dark:bg-sb-pink" },
      { label: "System Architecture & Review", hours: 1.2, percent: 20, colorClass: "bg-[#D93820]", darkColorClass: "dark:bg-[#743BFF]" },
    ],
    bars: [
      { day: "09:00", shortLabel: "9 AM", hours: 1.2, percent: 60, targetHours: 2.0, focusArea: "Algorithm warmup & LeetCode array review", status: "Completed", dateFormatted: "Morning Sprint" },
      { day: "11:30", shortLabel: "11 AM", hours: 1.6, percent: 80, targetHours: 2.0, focusArea: "Full-Stack React & API Route development", status: "Completed", dateFormatted: "Core Dev Block" },
      { day: "14:30", shortLabel: "2 PM", hours: 2.4, percent: 100, targetHours: 2.0, focusArea: "Next.js Capstone architecture & CI tests", status: "Surpassed", dateFormatted: "Deep Work Sprint" },
      { day: "17:30", shortLabel: "5 PM", hours: 1.0, percent: 50, targetHours: 2.0, focusArea: "System design revision & quiz practice", status: "Completed", dateFormatted: "Evening Review" },
    ],
  },
  Week: {
    subtitle: "7-Day active learning rhythm, project commitments & velocity",
    totalHours: 32.5,
    weeklyGoalHours: 40.0,
    goalPercent: 81,
    dailyAvgHours: 4.6,
    peakLabel: "Wed (6.2h Peak Prep)",
    activeRatio: "6 of 7 days",
    velocityPacing: "High Velocity",
    categories: [
      { label: "DSA & Technical Coding", hours: 14.0, percent: 43, colorClass: "bg-[#FF6A00]", darkColorClass: "dark:bg-sb-cyan" },
      { label: "Full-Stack Capstone", hours: 12.0, percent: 37, colorClass: "bg-[#FF9F1C]", darkColorClass: "dark:bg-sb-pink" },
      { label: "System Architecture & AI", hours: 6.5, percent: 20, colorClass: "bg-[#D93820]", darkColorClass: "dark:bg-[#743BFF]" },
    ],
    bars: [
      { day: "Monday", shortLabel: "Mon", hours: 4.8, percent: 77, targetHours: 5.0, focusArea: "Dynamic Programming & Tree Traversal", status: "Completed", dateFormatted: "Oct 26" },
      { day: "Tuesday", shortLabel: "Tue", hours: 5.5, percent: 88, targetHours: 5.0, focusArea: "Auth0 OAuth integration & DB models", status: "Surpassed", dateFormatted: "Oct 27" },
      { day: "Wednesday", shortLabel: "Wed", hours: 6.2, percent: 100, targetHours: 5.0, focusArea: "High-concurrency microservices & Docker", status: "Surpassed", dateFormatted: "Oct 28" },
      { day: "Thursday", shortLabel: "Thu", hours: 4.2, percent: 68, targetHours: 5.0, focusArea: "PostgreSQL indexing & Prisma migrations", status: "Completed", dateFormatted: "Oct 29" },
      { day: "Friday", shortLabel: "Fri", hours: 5.0, percent: 80, targetHours: 5.0, focusArea: "Capstones PR review & unit test suites", status: "Completed", dateFormatted: "Oct 30" },
      { day: "Saturday", shortLabel: "Sat", hours: 3.8, percent: 61, targetHours: 4.0, focusArea: "Mock technical interview & system design", status: "Completed", dateFormatted: "Oct 31" },
      { day: "Sunday", shortLabel: "Sun", hours: 3.0, percent: 48, targetHours: 4.0, focusArea: "Weekly sprint retrospective & planning", status: "Completed", dateFormatted: "Nov 01" },
    ],
  },
  Month: {
    subtitle: "30-Day aggregate consistency & placement trajectory",
    totalHours: 128.4,
    weeklyGoalHours: 160.0,
    goalPercent: 80,
    dailyAvgHours: 4.3,
    peakLabel: "Week 3 (36.8h Peak)",
    activeRatio: "26 of 30 days",
    velocityPacing: "Consistent Top 5%",
    categories: [
      { label: "DSA & Problem Solving", hours: 56.0, percent: 44, colorClass: "bg-[#FF6A00]", darkColorClass: "dark:bg-sb-cyan" },
      { label: "Full-Stack Web & Backend", hours: 47.4, percent: 37, colorClass: "bg-[#FF9F1C]", darkColorClass: "dark:bg-sb-pink" },
      { label: "AI, Cloud & DevOps", hours: 25.0, percent: 19, colorClass: "bg-[#D93820]", darkColorClass: "dark:bg-[#743BFF]" },
    ],
    bars: [
      { day: "Week 1", shortLabel: "W1", hours: 30.5, percent: 82, targetHours: 35.0, focusArea: "Foundations & Algorithm Complexity", status: "Completed", dateFormatted: "Oct 1 - Oct 7" },
      { day: "Week 2", shortLabel: "W2", hours: 32.2, percent: 87, targetHours: 35.0, focusArea: "Full-Stack APIs & State Management", status: "Completed", dateFormatted: "Oct 8 - Oct 14" },
      { day: "Week 3", shortLabel: "W3", hours: 36.8, percent: 100, targetHours: 35.0, focusArea: "Distributed Systems & Capstone Launch", status: "Surpassed", dateFormatted: "Oct 15 - Oct 21" },
      { day: "Week 4", shortLabel: "W4", hours: 28.9, percent: 78, targetHours: 35.0, focusArea: "Placement Mocks & Resume Technical Audit", status: "Completed", dateFormatted: "Oct 22 - Oct 28" },
    ],
  },
};

export default function StudentAnalyticsRows({
  data,
  completionPercent,
  onOpenAccountsManager,
}: StudentAnalyticsRowsProps) {
  const prefersReduced = usePrefersReducedMotion();

  // Range control for Study Rhythm
  const [selectedRange, setSelectedRange] = useState<TimeRange>("Week");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [pinnedBarIndex, setPinnedBarIndex] = useState<number | null>(null);

  // Viewport intersection observer for Row 1 (Focus Time & Study Rhythm)
  const { ref: row1Ref, inView: row1InView } = useInView<HTMLDivElement>({
    threshold: 0.15,
  });

  // Viewport intersection observer for Row 2 (Placement Readiness & Activity Map)
  const { ref: row2Ref, inView: row2InView } = useInView<HTMLDivElement>({
    threshold: 0.15,
  });

  // =========================================================================
  // Placement Readiness Calculation (Ground Truth from Real Student Profile)
  // Profile Completeness (40%) + Verified Skills (35%) + Capstone Projects (25%)
  // Sambhav Jain baseline: 85% completion, 6 skills (100%), 2 projects (100%)
  // Math: 85 * 0.40 (34) + 100 * 0.35 (35) + 100 * 0.25 (25) = 94%
  // =========================================================================
  const totalSkills = data.skills?.length || 0;
  const projectsCount = data.projects?.length || 0;
  const advancedCount = data.skills?.filter((s) => s.level === "Advanced").length || 0;
  const intermediateCount = data.skills?.filter((s) => s.level === "Intermediate").length || 0;

  const skillReadiness = Math.min(Math.round(((advancedCount * 1.0 + intermediateCount * 0.8 + (totalSkills - advancedCount - intermediateCount) * 0.5) / 5) * 100), 100);
  const projectReadiness = Math.min(Math.round((projectsCount / 2) * 100), 100);

  const targetReadinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(completionPercent * 0.4 + (totalSkills >= 5 ? 100 : skillReadiness) * 0.35 + projectReadiness * 0.25)
    )
  );

  // Animated values via RAF
  const [animatedReadiness, setAnimatedReadiness] = useState<number>(0);
  const [readinessDone, setReadinessDone] = useState<boolean>(false);

  useEffect(() => {
    if (!row2InView) return;
    if (prefersReduced) {
      setAnimatedReadiness(targetReadinessScore);
      setReadinessDone(true);
      return;
    }

    let start: number | null = null;
    const duration = 1400; // 1.4s smooth ease-out
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Smooth cubic-out easing curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * targetReadinessScore);
      setAnimatedReadiness(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimatedReadiness(targetReadinessScore);
        setReadinessDone(true);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [row2InView, targetReadinessScore, prefersReduced]);

  // Focus donut animation in Row 1
  const [animatedDonut, setAnimatedDonut] = useState<number>(0);
  useEffect(() => {
    if (!row1InView) return;
    if (prefersReduced) {
      setAnimatedDonut(81);
      return;
    }

    let start: number | null = null;
    const duration = 1200;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedDonut(Math.round(ease * 81));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimatedDonut(81);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [row1InView, prefersReduced]);

  const currentRhythm = RHYTHM_DATA_BY_RANGE[selectedRange];
  const activeInspectionIndex = pinnedBarIndex !== null ? pinnedBarIndex : hoveredBarIndex;
  const inspectedBar = activeInspectionIndex !== null ? currentRhythm.bars[activeInspectionIndex] : null;

  return (
    <div className="space-y-6 select-none">
      {/* ============================================================== */}
      {/* 1. FIRST ANALYTICS ROW: Focus Time (Left) + Study Rhythm (Right) */}
      {/* ============================================================== */}
      <div ref={row1Ref} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Smaller Left Panel: Focus Time (5 cols) */}
        <div className="analytics-panel-interactive lg:col-span-5 rounded-3xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-[var(--card-glass-border)] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E3E3] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
                  <Clock size={15} />
                </span>
                <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                  Focus Time & Hours
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight size={12} /> +14% vs last wk
              </span>
            </div>

            {/* Circular Donut Gauge & Hours Summary */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-[#171717] dark:text-white tracking-tight font-mono">
                  <SpinningCounter value={currentRhythm.totalHours} decimals={1} />{" "}
                  <span className="text-base font-semibold text-[#686868] dark:text-sb-muted font-sans">hrs</span>
                </p>
                <p className="text-xs text-[#686868] dark:text-sb-muted mt-1 leading-relaxed">
                  <SpinningCounter value={currentRhythm.goalPercent} suffix="%" /> of your {currentRhythm.weeklyGoalHours}h {selectedRange.toLowerCase()} placement preparation goal achieved.
                </p>
              </div>

              {/* Radial Donut Progress Indicator with Entrance Animation */}
              <div className="relative flex-none h-20 w-20 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-black/5 dark:text-white/10"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#0284c7] transition-all duration-500 ease-out"
                    strokeDasharray={`${animatedDonut}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-xs text-[#171717] dark:text-white">
                  <SpinningCounter value={currentRhythm.goalPercent} suffix="%" />
                </span>
              </div>
            </div>

            {/* Category Breakdown Bars with Progressive Width Revealing */}
            <div className="mt-5 space-y-2.5">
              {currentRhythm.categories.map((cat, idx) => {
                const widthPercent = row1InView || prefersReduced ? cat.percent : 0;
                return (
                  <div key={cat.label} className="group/cat">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#171717] dark:text-white group-hover/cat:text-[#FF6A00] dark:group-hover/cat:text-sb-cyan transition-colors">
                        {cat.label}
                      </span>
                      <span className="font-mono text-[#686868] dark:text-sb-muted">
                        {cat.hours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.colorClass} ${cat.darkColorClass} transition-all duration-1000 ease-out`}
                        style={{
                          width: `${widthPercent}%`,
                          transitionDelay: prefersReduced ? "0ms" : `${idx * 150}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E3E3E3] dark:border-white/10 flex items-center justify-between text-xs text-[#686868] dark:text-sb-muted">
            <span>Daily Average: {currentRhythm.dailyAvgHours}h</span>
            <Link
              href="/student/skills"
              className="btn-bounce-sm font-semibold text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline px-2 py-0.5 rounded-lg inline-flex items-center gap-1"
            >
              View Log →
            </Link>
          </div>
        </div>

        {/* Wider Right Panel: Study Rhythm & Velocity (7 cols) */}
        <div className="analytics-panel-interactive lg:col-span-7 rounded-3xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-[var(--card-glass-border)] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E3E3E3] dark:border-white/10 gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
                  <BarChart2 size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                    Study Rhythm & Velocity
                  </h3>
                  <p className="text-[11px] text-[#686868] dark:text-sb-muted hidden sm:block">
                    {currentRhythm.subtitle}
                  </p>
                </div>
              </div>

              {/* Functional Range Selector Pill: Day, Week, Month */}
              <div className="study-rhythm-range-track flex items-center gap-1 rounded-xl p-1 text-xs shrink-0">
                {(["Day", "Week", "Month"] as const).map((r) => {
                  const isActive = selectedRange === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRange(r);
                        setHoveredBarIndex(null);
                        setPinnedBarIndex(null);
                      }}
                      data-keep-white={isActive ? "true" : undefined}
                      aria-pressed={isActive}
                      className={`study-rhythm-btn btn-bounce-sm px-2.5 sm:px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive ? "is-active" : "is-inactive"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Data Point Inspection / Pinned Tooltip Banner */}
            <div className="mt-3 min-h-[38px] flex items-center justify-between rounded-xl bg-orange-500/5 dark:bg-white/[0.03] border border-orange-500/15 dark:border-white/10 px-3 py-1.5 transition-all">
              {inspectedBar ? (
                <div className="flex flex-wrap items-center justify-between w-full text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#171717] dark:text-white flex items-center gap-1">
                      <Calendar size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                      {inspectedBar.day} ({inspectedBar.dateFormatted})
                    </span>
                    <span className="text-[#686868] dark:text-sb-muted hidden md:inline">•</span>
                    <span className="text-[#686868] dark:text-sb-muted hidden md:inline truncate max-w-[280px]">
                      {inspectedBar.focusArea}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FF6A00] dark:text-sb-cyan text-sm">
                      {inspectedBar.hours.toFixed(1)} hrs
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inspectedBar.status === "Surpassed"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {inspectedBar.status}
                    </span>
                    {pinnedBarIndex !== null && (
                      <button
                        type="button"
                        onClick={() => setPinnedBarIndex(null)}
                        className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-white ml-1 underline cursor-pointer"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full text-xs text-[#686868] dark:text-sb-muted">
                  <span className="flex items-center gap-1.5">
                    <Info size={13} className="text-[#FF6A00] dark:text-sb-cyan flex-shrink-0" />
                    <span>Hover or tap any bar below to inspect focus sprint details & hours</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">
                    Peak: {currentRhythm.peakLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Vertical Bar Chart with Entrance Stagger, Pointer Hit-Testing & Tooltips */}
            <div className="mt-4 flex items-end justify-between gap-2 sm:gap-4 h-44 pb-2 border-b border-[#E3E3E3] dark:border-white/10 px-2 sm:px-6 relative">
              {currentRhythm.bars.map((d, idx) => {
                const isHovered = hoveredBarIndex === idx;
                const isPinned = pinnedBarIndex === idx;
                const isFocused = isHovered || isPinned;

                // Animate bar upward from baseline
                const animatedHeight = row1InView || prefersReduced ? d.percent : 0;

                return (
                  <div
                    key={d.day}
                    role="button"
                    tabIndex={0}
                    aria-label={`${d.day}: ${d.hours} hours. Click to pin details.`}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    onClick={() => setPinnedBarIndex((prev) => (prev === idx ? null : idx))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPinnedBarIndex((prev) => (prev === idx ? null : idx));
                      }
                    }}
                    className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer outline-none relative z-10"
                  >
                    {/* Live Metric Hover / Active Badge */}
                    <span
                      className={`text-[10px] font-mono font-bold transition-all duration-200 ${
                        isFocused
                          ? "opacity-100 scale-110 text-[#FF6A00] dark:text-sb-cyan"
                          : "opacity-0 group-hover/bar:opacity-100 text-[#FF6A00] dark:text-sb-cyan"
                      }`}
                    >
                      {d.hours}h
                    </span>

                    {/* Bar Track & Fill with Progressive Reveal */}
                    <div
                      className={`w-full max-w-[32px] h-32 rounded-full flex items-end p-1 transition-all duration-300 ${
                        isFocused
                          ? "bg-orange-500/10 dark:bg-sb-cyan/15 scale-105 shadow-md shadow-orange-500/15"
                          : "bg-black/[0.04] dark:bg-white/5 hover:scale-105"
                      }`}
                    >
                      <div
                        className={`w-full rounded-full transition-all duration-700 ease-out ${
                          isFocused
                            ? "bg-gradient-to-t from-[#FF6A00] via-[#FF9F1C] to-[#FFA040] dark:from-sb-cyan dark:via-sb-blue dark:to-sb-pink brightness-110 shadow-sm"
                            : "bg-gradient-to-t from-[#FF6A00] to-[#FF9F1C] dark:from-sb-cyan dark:to-sb-blue group-hover/bar:brightness-110"
                        }`}
                        style={{
                          height: `${animatedHeight}%`,
                          transitionDelay: prefersReduced ? "0ms" : `${idx * 75}ms`,
                        }}
                      />
                    </div>

                    {/* Day / Sprint Label */}
                    <span
                      className={`text-xs font-semibold transition-colors duration-200 ${
                        isFocused
                          ? "text-[#FF6A00] dark:text-sb-cyan font-bold"
                          : "text-[#686868] dark:text-sb-muted group-hover/bar:text-[#171717] dark:group-hover/bar:text-white"
                      }`}
                    >
                      {d.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Footer */}
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF6A00] dark:bg-sb-cyan animate-pulse" />
              <span className="font-semibold text-[#171717] dark:text-white">
                Active Ratio: {currentRhythm.activeRatio}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF9F1C] dark:bg-sb-pink" />
              <span className="font-semibold text-[#171717] dark:text-white">
                Peak Prep: {currentRhythm.peakLabel}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <Zap size={12} /> Pacing: {currentRhythm.velocityPacing}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECOND ANALYTICS ROW: Focus Map (Left) + Performance (Right) */}
      {/* ============================================================== */}
      <div ref={row2Ref} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Wide Left Panel: Unified Skill Focus Map & Activity Intensity Heatmap (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <UnifiedActivityMap
            data={data}
            onOpenAccountsManager={onOpenAccountsManager}
          />
        </div>

        {/* Smaller Right Panel: Placement Readiness Index (4 cols) */}
        <div className="card-interactive lg:col-span-4 rounded-3xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-[var(--card-glass-border)] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E3E3] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
                  <Target size={15} />
                </span>
                <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                  Placement Readiness
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                <Sparkles size={11} />
                Tier-1 Qualified
              </span>
            </div>

            {/* Performance Score Circular Gauge with Real Progress SVG Ring */}
            <div className="mt-5 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-32 w-32 rounded-full p-2">
                {/* SVG Radial Progress Ring */}
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-black/5 dark:text-white/10"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Synchronized Animated Progress Ring */}
                  <path
                    className="text-[#0284c7] transition-all duration-300 ease-out"
                    strokeDasharray={`${animatedReadiness}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Inner Stat Circle */}
                <div className="absolute inset-2.5 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center shadow-xs">
                  <span className="text-3xl font-bold text-[#171717] dark:text-white font-num tracking-tight tabular-nums">
                    <SpinningCounter value={animatedReadiness} suffix="%" />
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#686868] dark:text-sb-muted tracking-wider mt-0.5">
                    {readinessDone ? "Ready" : "Evaluating"}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Breakdown with Synchronized Bar Widths */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#686868] dark:text-sb-muted">Profile Completion</span>
                  <span className="font-bold text-[#171717] dark:text-white font-mono"><SpinningCounter value={completionPercent} suffix="%" /></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0284c7] transition-all duration-700 ease-out"
                    style={{ width: `${row2InView || prefersReduced ? completionPercent : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#686868] dark:text-sb-muted">Technical Assessment</span>
                  <span className="font-bold text-[#171717] dark:text-white font-mono"><SpinningCounter value={92} suffix="%" /></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0d9488] transition-all duration-700 ease-out"
                    style={{ width: `${row2InView || prefersReduced ? 92 : 0}%`, transitionDelay: "150ms" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#686868] dark:text-sb-muted">Shortlist Recruiter Match</span>
                  <span className="font-bold text-[#171717] dark:text-white font-mono"><SpinningCounter value={96} suffix="%" /></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6366f1] transition-all duration-700 ease-out"
                    style={{ width: `${row2InView || prefersReduced ? 96 : 0}%`, transitionDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E3E3E3] dark:border-white/10 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle size={13} /> Day-0 Ready
            </span>
            <Link
              href="/student/profile"
              className="btn-bounce-sm font-semibold text-[#0284c7] hover:underline px-2 py-0.5 rounded-lg inline-flex items-center gap-1"
            >
              Audit Breakdown →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
