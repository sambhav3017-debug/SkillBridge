"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2 } from "lucide-react";
import type { DepartmentRecord, InstitutionProfile, InstitutionStudentRecord } from "@/lib/academia/types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface CoursesProgramsChartProps {
  institution: InstitutionProfile;
  departments: DepartmentRecord[];
  students: InstitutionStudentRecord[];
}

export default function CoursesProgramsChart({
  institution,
  departments,
  students,
}: CoursesProgramsChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Aggregate student distribution per degree program
  const programData = useMemo(() => {
    // Collect all programs offered by institution or departmental records
    const allPrograms = new Set<string>();
    for (const p of institution.programsOffered || []) allPrograms.add(p);
    for (const d of departments) {
      for (const p of d.programs || []) allPrograms.add(p);
    }
    for (const s of students) {
      if (s.program) allPrograms.add(s.program);
    }

    if (allPrograms.size === 0) {
      allPrograms.add("B.Tech / B.E.");
      allPrograms.add("M.Tech");
      allPrograms.add("MCA");
    }

    const map = new Map<
      string,
      {
        program: string;
        studentCount: number;
        eligibleCount: number;
        departments: Set<string>;
      }
    >();

    for (const prog of allPrograms) {
      map.set(prog, {
        program: prog,
        studentCount: 0,
        eligibleCount: 0,
        departments: new Set(),
      });
    }

    for (const d of departments) {
      for (const p of d.programs || []) {
        const item = map.get(p);
        if (item) item.departments.add(d.name);
      }
    }

    for (const s of students) {
      const prog = s.program || "B.Tech / B.E.";
      const item = map.get(prog) ?? {
        program: prog,
        studentCount: 0,
        eligibleCount: 0,
        departments: new Set([s.department]),
      };
      item.studentCount += 1;
      if (s.placementEligible) item.eligibleCount += 1;
      if (s.department) item.departments.add(s.department);
      map.set(prog, item);
    }

    return Array.from(map.values())
      .map((entry) => ({
        program: entry.program,
        studentCount: entry.studentCount,
        eligibleCount: entry.eligibleCount,
        deptList: Array.from(entry.departments),
      }))
      .sort((a, b) => b.studentCount - a.studentCount);
  }, [institution.programsOffered, departments, students]);

  const totalStudents = students.length;
  const maxStudents = Math.max(...programData.map((p) => p.studentCount), 1);

  return (
    <section aria-labelledby="courses-programs-title" className="glass relative flex flex-col justify-between p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#4F46E5] dark:border-indigo-400/35 dark:bg-indigo-950/30 dark:text-indigo-400 shadow-xs">
            <BookOpen size={17} />
          </span>
          <div>
            <h2 id="courses-programs-title" className="text-base font-bold tracking-tight text-[var(--color-text)]">
              Academic Programs &amp; Course Enrollment
            </h2>
            <p className="text-xs text-sb-muted light:text-[#686868]">
              Degree programs, specialization tracks, and active roster capacity
            </p>
          </div>
        </div>

        <Link
          href="/academia/departments"
          className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:border-[#4F46E5]/40 dark:hover:border-indigo-400/40 shadow-xs transition-all"
          title="Manage departments and degree programs"
        >
          Manage Programs <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Program Distribution Interactive Bars */}
      <div className="mt-5 space-y-4">
        {programData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E3E3E3] dark:border-[var(--glass-border)] p-6 text-center text-xs text-sb-muted light:text-[#686868]">
            No degree programs configured yet. Define programs in Department Settings.
          </div>
        ) : (
          programData.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const pct = totalStudents > 0 ? Math.round((item.studentCount / totalStudents) * 100) : 0;
            const barWidth = Math.max(item.studentCount > 0 ? 8 : 0, (item.studentCount / maxStudents) * 100);

            return (
              <div
                key={item.program}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? "border-[#4F46E5]/50 bg-[#4F46E5]/[0.06] dark:border-indigo-400/50 dark:bg-indigo-950/20 shadow-sm"
                    : "border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/80 dark:bg-[var(--field-bg)]"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--color-text)]">{item.program}</span>
                    <span className="rounded-full border border-[#4F46E5]/25 bg-[#4F46E5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400">
                      {item.deptList.length} Dept{item.deptList.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="text-[var(--color-text)]">
                      <SpinningCounter value={item.studentCount} />
                    </strong>{" "}
                    <span className="text-sb-muted light:text-[#686868] inline-flex items-center gap-1">
                      student{item.studentCount === 1 ? "" : "s"} (<SpinningCounter value={pct} suffix="%" />)
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      idx === 0
                        ? "bg-[#0284c7]"
                        : idx === 1
                        ? "bg-[#4f46e5]"
                        : "bg-[#0d9488]"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Sub info */}
                {isHovered && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-[#E3E3E3] dark:border-[var(--glass-border)] pt-2 text-[11px] text-sb-muted light:text-[#686868]">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-[#007BA7] dark:text-sb-cyan" />
                      <span>{item.deptList.slice(0, 2).join(", ")}</span>
                    </div>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <SpinningCounter value={item.eligibleCount} /> placement-ready (
                      <SpinningCounter value={item.studentCount > 0 ? Math.round((item.eligibleCount / item.studentCount) * 100) : 0} suffix="%" />)
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 flex items-center justify-between border-t border-[#E3E3E3] dark:border-[var(--glass-border)] pt-3 text-xs text-sb-muted light:text-[#686868]">
        <span className="inline-flex items-center gap-1">
          <SpinningCounter value={departments.length} /> Academic Departments configured
        </span>
        <Link href="/academia/students" className="font-semibold text-[#007BA7] dark:text-sb-cyan hover:underline">
          View Class Rosters →
        </Link>
      </div>
    </section>
  );
}
