"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FolderGit2,
  UserPlus,
  Users,
} from "lucide-react";
import type { AcademicOpportunity, DepartmentRecord, FacultyRecord } from "@/lib/academia/types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface FacultyActivityProps {
  faculty: FacultyRecord[];
  departments: DepartmentRecord[];
  academicOpportunities: AcademicOpportunity[];
  totalStudents: number;
}

export default function FacultyActivitySection({
  faculty,
  departments,
  academicOpportunities,
  totalStudents,
}: FacultyActivityProps) {

  const activeFaculty = useMemo(
    () => faculty.filter((f) => f.accountStatus === "Active"),
    [faculty],
  );

  const totalPublications = useMemo(
    () => faculty.reduce((acc, f) => acc + (f.publicationsCount || 0), 0),
    [faculty],
  );

  const totalSupervised = useMemo(
    () =>
      faculty.reduce((acc, f) => acc + (f.SupervisedProjectsCount || 0), 0) +
      academicOpportunities.length,
    [faculty, academicOpportunities],
  );

  const mentoringAvailableCount = useMemo(
    () => faculty.filter((f) => f.mentoringAvailable).length,
    [faculty],
  );

  // Faculty allocation per department
  const deptFacultyStats = useMemo(() => {
    return departments.map((d) => {
      const deptFaculty = faculty.filter((f) => f.department === d.name);
      const pubs = deptFaculty.reduce((acc, f) => acc + (f.publicationsCount || 0), 0);
      const supervised = deptFaculty.reduce((acc, f) => acc + (f.SupervisedProjectsCount || 0), 0);
      const opps = academicOpportunities.filter((o) => o.department === d.name);
      return {
        dept: d,
        facultyCount: deptFaculty.length,
        activeCount: deptFaculty.filter((f) => f.accountStatus === "Active").length,
        publications: pubs,
        projects: supervised + opps.length,
      };
    });
  }, [departments, faculty, academicOpportunities]);

  const studentFacultyRatio =
    faculty.length > 0 ? `${Math.round(totalStudents / faculty.length)}:1` : "N/A";

  return (
    <section aria-labelledby="faculty-analytics-title" className="glass relative flex flex-col justify-between p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#007BA7]/30 bg-[#007BA7]/10 text-[#007BA7] dark:border-sb-cyan/35 dark:bg-sb-blue/15 dark:text-sb-cyan shadow-xs">
            <Users size={17} />
          </span>
          <div>
            <h2 id="faculty-analytics-title" className="text-base font-bold tracking-tight text-[var(--color-text)]">
              Faculty Activity &amp; Research Supervision
            </h2>
            <p className="text-xs text-sb-muted light:text-[#686868]">
              Academic mentorship, research publications, and capstone project allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/academia/faculty"
            className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#007BA7] dark:text-sb-cyan hover:border-[#007BA7]/40 dark:hover:border-sb-cyan/40 shadow-xs transition-all"
            title="Manage institutional faculty roster"
          >
            Faculty Directory <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/academia/projects"
            className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-[#007BA7]/90 dark:hover:bg-sb-cyan/90 transition-all"
            title="Publish or manage research projects"
          >
            <FolderGit2 size={13} /> Research Projects
          </Link>
        </div>
      </div>

      {/* 4 Metric Highlights */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5">
          <span className="text-[11px] font-semibold text-sb-muted">Active Faculty</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--color-text)]">
              <SpinningCounter value={faculty.length} />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium inline-flex items-center gap-0.5">
              <SpinningCounter value={activeFaculty.length} /> active
            </span>
          </div>
          <span className="mt-0.5 block text-[10px] text-sb-muted">
            Ratio {studentFacultyRatio}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5">
          <span className="text-[11px] font-semibold text-sb-muted">Supervised Projects</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-sb-cyan">
              <SpinningCounter value={totalSupervised} />
            </span>
            <span className="text-[10px] text-sb-muted">capstones</span>
          </div>
          <span className="mt-0.5 block text-[10px] text-sb-muted">
            {academicOpportunities.length} active opportunities
          </span>
        </div>

        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5">
          <span className="text-[11px] font-semibold text-sb-muted">Research Papers</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-sb-pink">
              <SpinningCounter value={totalPublications} />
            </span>
            <span className="text-[10px] text-sb-muted">indexed</span>
          </div>
          <span className="mt-0.5 block text-[10px] text-sb-muted">
            Faculty research output
          </span>
        </div>

        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5">
          <span className="text-[11px] font-semibold text-sb-muted">Mentorship Availability</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400">
              <SpinningCounter value={mentoringAvailableCount} />
            </span>
            <span className="text-[10px] text-sb-muted">available</span>
          </div>
          <span className="mt-0.5 block text-[10px] text-sb-muted">
            1-on-1 student career guidance
          </span>
        </div>
      </div>

      {/* Department Breakdown or Actionable Empty State */}
      <div className="mt-5">
        {faculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--glass-border)] p-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sb-cyan/35 bg-sb-blue/15 text-sb-cyan">
              <UserPlus size={22} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[var(--color-text)]">
              No Faculty Members Registered Yet
            </h3>
            <p className="mt-1 max-w-md text-xs text-sb-muted">
              Add department professors, project supervisors, and researchers to track research publications, assign student capstones, and power NIRF metrics.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/academia/faculty" className="btn btn-primary btn-sm">
                <UserPlus size={14} /> Add Faculty Member
              </Link>
              <Link href="/academia/departments" className="btn btn-glass btn-sm">
                Department Coordinators
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-sb-muted">
              Departmental Faculty Allocation &amp; Supervision Output
            </span>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {deptFacultyStats.map((item) => (
                <div
                  key={item.dept.id}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5 text-xs transition-colors hover:border-sb-cyan/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text)]">{item.dept.name}</span>
                    <span className="rounded-full border border-sb-cyan/30 bg-sb-blue/20 px-2 py-0.5 text-[10px] font-medium text-sb-cyan">
                      {item.facultyCount} Faculty
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-sb-muted">
                    <span>Publications: <strong className="text-[var(--color-text)]">{item.publications}</strong></span>
                    <span>Projects: <strong className="text-sb-pink">{item.projects}</strong></span>
                    <Link
                      href="/academia/faculty"
                      className="font-medium text-sb-cyan hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--glass-border)] pt-3 text-xs text-sb-muted">
        <span>Covers research mentorship across all active departments</span>
        <Link href="/academia/projects" className="font-semibold text-sb-cyan hover:underline">
          Publish Student Research Proposal →
        </Link>
      </div>
    </section>
  );
}
