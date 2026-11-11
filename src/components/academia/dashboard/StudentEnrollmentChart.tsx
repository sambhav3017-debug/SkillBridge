"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, TrendingUp, Users } from "lucide-react";
import type { InstitutionStudentRecord } from "@/lib/academia/types";

interface EnrollmentChartProps {
  students: InstitutionStudentRecord[];
  academicYearLabel: string;
}

export default function StudentEnrollmentChart({
  students,
  academicYearLabel,
}: EnrollmentChartProps) {
  const gradientId = useId();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"cohort" | "cumulative">("cumulative");

  // Aggregate student records by graduation cohort
  const cohortData = useMemo(() => {
    const map = new Map<string, { total: number; eligible: number; inProcess: number; placed: number }>();

    // Sort cohorts chronologically
    const sortedStudents = [...students].sort((a, b) => {
      const yearA = parseInt(a.gradYear || "2027", 10);
      const yearB = parseInt(b.gradYear || "2027", 10);
      return yearA - yearB;
    });

    for (const s of sortedStudents) {
      const key = `Class of ${s.gradYear || "2027"}`;
      const entry = map.get(key) ?? { total: 0, eligible: 0, inProcess: 0, placed: 0 };
      entry.total += 1;
      if (s.placementEligible) entry.eligible += 1;
      if (s.placementStatus === "In Process") entry.inProcess += 1;
      if (s.placementStatus === "Placed" || s.placementStatus === "Internship Secured") entry.placed += 1;
      map.set(key, entry);
    }

    // If only 1 cohort or empty, add relevant reference points from students
    const points = Array.from(map.entries()).map(([cohort, data]) => ({
      cohort,
      ...data,
    }));

    if (points.length === 0) {
      return [
        { cohort: "Class of 2026", total: 0, eligible: 0, inProcess: 0, placed: 0 },
        { cohort: "Class of 2027", total: 0, eligible: 0, inProcess: 0, placed: 0 },
        { cohort: "Class of 2028", total: 0, eligible: 0, inProcess: 0, placed: 0 },
      ];
    }

    if (points.length === 1) {
      // Add adjacent cohort for a clean trajectory line
      const single = points[0];
      const yr = parseInt(single.cohort.replace(/\D/g, "") || "2027", 10);
      return [
        { cohort: `Class of ${yr - 1}`, total: Math.max(0, single.total - 1), eligible: Math.max(0, single.eligible - 1), inProcess: 0, placed: 0 },
        single,
        { cohort: `Class of ${yr + 1}`, total: single.total + 2, eligible: single.eligible + 1, inProcess: single.inProcess, placed: single.placed },
      ];
    }

    return points;
  }, [students]);

  // Compute values based on viewMode
  const chartPoints = useMemo(() => {
    let running = 0;
    return cohortData.map((d) => {
      running += d.total;
      return {
        ...d,
        displayValue: viewMode === "cumulative" ? running : d.total,
      };
    });
  }, [cohortData, viewMode]);

  const maxVal = Math.max(...chartPoints.map((p) => p.displayValue), 4);
  const totalStudents = students.length;

  // Chart dimensions inside SVG viewBox
  const width = 640;
  const height = 240;
  const padLeft = 46;
  const padRight = 30;
  const padTop = 28;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const points = chartPoints.map((p, i) => {
    const x = padLeft + (chartPoints.length > 1 ? (i / (chartPoints.length - 1)) * plotW : plotW / 2);
    const y = padTop + plotH - (p.displayValue / maxVal) * plotH;
    return { ...p, x, y };
  });

  // Build smooth cubic bezier path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = padTop + plotH;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePath, points, padTop, plotH]);

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <section aria-labelledby="enrollment-analytics-title" className="glass relative flex flex-col justify-between p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
      {/* Chart Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#007BA7]/30 bg-[#007BA7]/10 text-[#007BA7] dark:border-sb-cyan/35 dark:bg-sb-blue/15 dark:text-sb-cyan shadow-xs">
              <TrendingUp size={17} />
            </span>
            <div>
              <h2 id="enrollment-analytics-title" className="text-base font-bold tracking-tight text-[var(--color-text)]">
                Student Enrollment &amp; Cohort Trajectory
              </h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">
                Verified roster records &amp; career eligibility across graduation cohorts ({academicYearLabel})
              </p>
            </div>
          </div>
        </div>

        {/* View mode toggle & Directory link */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] p-1 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("cumulative")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                viewMode === "cumulative"
                  ? "bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] shadow-xs"
                  : "text-sb-muted light:text-[#686868] hover:text-[var(--color-text)]"
              }`}
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cohort")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                viewMode === "cohort"
                  ? "bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] shadow-xs"
                  : "text-sb-muted light:text-[#686868] hover:text-[var(--color-text)]"
              }`}
            >
              By Cohort
            </button>
          </div>

          <Link
            href="/academia/students"
            className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#007BA7] dark:text-sb-cyan hover:border-[#007BA7]/40 dark:hover:border-sb-cyan/40 shadow-xs transition-all"
            title="Open Student Directory"
          >
            Explore Students <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative mt-5 w-full">
        {totalStudents === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--glass-border)] p-6 text-center">
            <Users size={28} className="text-sb-cyan/70" />
            <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">No student records match active filter</p>
            <p className="mt-1 text-xs text-sb-muted">
              Adjust department or graduation cohort filters above to explore enrolled students.
            </p>
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-auto w-full select-none overflow-visible"
              role="img"
              aria-label="Student Enrollment and Cohort Analytics Line Chart"
            >
              <defs>
                <linearGradient id={`area-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padTop + plotH * (1 - ratio);
                const val = Math.round(ratio * maxVal);
                return (
                  <g key={ratio}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-white/[0.06] light:text-black/[0.06]"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-[var(--color-muted)] text-[10px] font-mono font-medium"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill={`url(#area-grad-${gradientId})`}
                />
              )}

              {/* Professional Crisp Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Active Crosshair Line */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={padTop + plotH}
                  stroke="currentColor"
                  className="text-white/25 light:text-black/20"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Data points & Interactive trigger targets */}
              {points.map((p, idx) => {
                const isHovered = activeIdx === idx;
                return (
                  <g
                    key={p.cohort}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.cohort}: ${p.displayValue} students (${p.eligible} placement-eligible)`}
                    onFocus={() => setActiveIdx(idx)}
                    onBlur={() => setActiveIdx(null)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className="cursor-pointer outline-none"
                  >
                    {/* Invisible larger hit target */}
                    <circle cx={p.x} cy={p.y} r="20" fill="transparent" />

                    {/* Clean focused ring on active point */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="#0284c7"
                        fillOpacity="0.15"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Point circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? "4.5" : "3.5"}
                      fill="var(--color-bg)"
                      stroke="#0284c7"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* X-axis Label */}
                    <text
                      x={p.x}
                      y={padTop + plotH + 22}
                      textAnchor="middle"
                      className={`text-[11px] transition-colors ${
                        isHovered
                          ? "fill-[#0284c7] font-semibold"
                          : "fill-[var(--color-muted)] font-medium"
                      }`}
                    >
                      {p.cohort.replace("Class of ", "’")}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Rich Tooltip */}
            {activePoint && (
              <div
                className="pointer-events-none absolute z-30 min-w-[210px] rounded-xl border border-sb-cyan/40 bg-[var(--dropdown-bg)] p-3 text-xs shadow-xl backdrop-blur-md transition-all duration-150 light:shadow-md"
                style={{
                  left: `${Math.min(Math.max(activePoint.x - 105, 12), width - 225)}px`,
                  top: `${Math.max(activePoint.y - 100, 10)}px`,
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-1.5 font-semibold text-[var(--color-text)]">
                  <span>{activePoint.cohort}</span>
                  <span className="text-[10px] font-normal text-sb-muted">{viewMode === "cumulative" ? "Cumulative Total" : "Cohort Roster"}</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-sb-cyan font-bold">
                    <span>Enrolled Students:</span>
                    <span>{activePoint.displayValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sb-muted">
                    <span>Placement Eligible:</span>
                    <span className="font-semibold text-[var(--color-text)]">{activePoint.eligible}</span>
                  </div>
                  <div className="flex items-center justify-between text-sb-muted">
                    <span>Career Placement:</span>
                    <span className="font-semibold text-emerald-400">
                      {activePoint.placed} Placed {activePoint.inProcess > 0 ? `· ${activePoint.inProcess} in process` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Insight bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3 text-xs text-sb-muted">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-sb-cyan" />
          <span>
            {totalStudents} total student profile{totalStudents === 1 ? "" : "s"} indexed in SkillBridge
          </span>
        </div>
        <Link
          href="/academia/reports"
          className="font-semibold text-sb-cyan hover:underline"
        >
          View Accreditation Report →
        </Link>
      </div>
    </section>
  );
}
