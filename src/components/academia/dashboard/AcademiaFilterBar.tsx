"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { DepartmentRecord } from "@/lib/academia/types";
import type { AcademiaFilterState } from "./types";

interface FilterBarProps {
  filters: AcademiaFilterState;
  onChange: (next: AcademiaFilterState) => void;
  onReset: () => void;
  departments: DepartmentRecord[];
  gradYears: string[];
  totalStudents: number;
  filteredCount: number;
}

export default function AcademiaFilterBar({
  filters,
  onChange,
  onReset,
  departments,
  gradYears,
  totalStudents,
  filteredCount,
}: FilterBarProps) {
  const isFiltered =
    filters.department !== "All" ||
    filters.gradYear !== "All" ||
    filters.placementStatus !== "All" ||
    filters.timeHorizon !== "all";

  const activeFilterCount =
    (filters.department !== "All" ? 1 : 0) +
    (filters.gradYear !== "All" ? 1 : 0) +
    (filters.placementStatus !== "All" ? 1 : 0) +
    (filters.timeHorizon !== "all" ? 1 : 0);

  return (
    <div className="glass rounded-2xl p-4 transition-all duration-300 border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Summary scope badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#007BA7]/30 bg-[#007BA7]/10 dark:border-sb-cyan/30 dark:bg-sb-blue/15 px-3 py-1.5 font-semibold text-[#007BA7] dark:text-sb-cyan shadow-xs">
            <SlidersHorizontal size={13} /> Coordinated Analytics Filter
          </span>
          <span className="text-sb-muted light:text-[#686868]">
            Analyzing{" "}
            <strong className="text-[var(--color-text)]">
              {filteredCount}
            </strong>{" "}
            of {totalStudents} student records
            {filters.department !== "All" && (
              <> in <strong className="text-[#007BA7] dark:text-sb-cyan">{filters.department}</strong></>
            )}
            {filters.gradYear !== "All" && (
              <> · <strong className="text-[#4F46E5] dark:text-sb-pink">Class of {filters.gradYear}</strong></>
            )}
          </span>
        </div>

        {/* Right: Interactive select controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Academic Department"
              value={filters.department}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="h-9 rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition-all hover:border-[#007BA7]/40 focus:border-[#007BA7] focus:ring-2 focus:ring-[#007BA7]/20 shadow-xs"
            >
              <option value="All">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Cohort Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Graduation Cohort"
              value={filters.gradYear}
              onChange={(e) => onChange({ ...filters, gradYear: e.target.value })}
              className="h-9 rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition-all hover:border-[#007BA7]/40 focus:border-[#007BA7] focus:ring-2 focus:ring-[#007BA7]/20 shadow-xs"
            >
              <option value="All">All Cohorts</option>
              {gradYears.map((y) => (
                <option key={y} value={y}>
                  Class of {y}
                </option>
              ))}
            </select>
          </div>

          {/* Placement Status Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Placement Status"
              value={filters.placementStatus}
              onChange={(e) => onChange({ ...filters, placementStatus: e.target.value })}
              className="h-9 rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition-all hover:border-[#007BA7]/40 focus:border-[#007BA7] focus:ring-2 focus:ring-[#007BA7]/20 shadow-xs"
            >
              <option value="All">All Placement Statuses</option>
              <option value="Eligible">Placement Eligible</option>
              <option value="In Process">In Process (Interviewing)</option>
              <option value="Placed">Placed Full-Time</option>
              <option value="Internship Secured">Internship Secured</option>
              <option value="Not Eligible">Not Eligible / Opted Out</option>
            </select>
          </div>

          {/* Time Horizon Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Time Horizon"
              value={filters.timeHorizon}
              onChange={(e) => onChange({ ...filters, timeHorizon: e.target.value })}
              className="h-9 rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition-all hover:border-[#007BA7]/40 focus:border-[#007BA7] focus:ring-2 focus:ring-[#007BA7]/20 shadow-xs"
            >
              <option value="all">All Time</option>
              <option value="academic-year">Current Academic Year</option>
              <option value="90d">Last 90 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all duration-200 hover:bg-rose-500/20 hover:shadow-sm active:scale-95"
              title="Reset all active analytics filters"
            >
              <RotateCcw size={12} />
              Reset Filters
              <span className="grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
