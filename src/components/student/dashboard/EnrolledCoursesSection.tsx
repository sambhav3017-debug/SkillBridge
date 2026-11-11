"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  ArrowRight,
  Pause,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { EnrolledCourseSummary } from "@/lib/student/course-planner-engine";
import { TechIcon3D } from "../ui/tech-icons";

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourseSummary[];
  onOpenWorkspace: (courseId: string) => void;
}

export default function EnrolledCoursesSection({
  courses,
  onOpenWorkspace,
}: EnrolledCoursesSectionProps) {
  const [filter, setFilter] = useState<"All" | "In Progress" | "Completed" | "Paused">("All");

  const filtered = courses.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  if (courses.length === 0) {
    return (
      <section aria-labelledby="enrolled-courses-heading" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
              <GraduationCap size={15} />
            </span>
            <h2
              id="enrolled-courses-heading"
              className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white"
            >
              My Learning / Enrolled Courses
            </h2>
          </div>
          <Link
            href="/student/skills"
            className="btn-bounce-sm inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] dark:text-sb-cyan hover:underline"
          >
            Explore Catalog <ArrowRight size={13} />
          </Link>
        </div>

        <div className="rounded-3xl border border-dashed border-orange-500/30 dark:border-white/10 bg-gradient-to-br from-orange-500/[0.03] to-white dark:bg-white/[0.02] p-8 text-center space-y-3">
          <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-white">
              No Courses Enrolled Yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-sb-muted max-w-md mx-auto mt-1">
              Enroll in a course from Gain Skills to unlock an automated daily schedule, curated Indian educator lectures, and smart task assignments.
            </p>
          </div>
          <Link
            href="/student/skills"
            className="btn-bounce inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-sm dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12]"
          >
            Explore Gain Skills <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="enrolled-courses-heading" className="space-y-4">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
              <GraduationCap size={15} />
            </span>
            <h2
              id="enrolled-courses-heading"
              className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white"
            >
              My Learning / Enrolled Courses
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20">
              {courses.length} Active
            </span>
          </div>
          <p className="text-xs text-[#71717A] dark:text-sb-muted mt-0.5">
            Real-time syllabus tracker, daily assignments, and direct lecture workspace access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10 text-xs">
            {(["All", "In Progress", "Completed", "Paused"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`btn-bounce-sm px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-2xs dark:from-white dark:to-white dark:text-[#18181B]"
                    : "text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            href="/student/skills"
            className="btn-bounce-sm hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] dark:text-sb-cyan hover:underline px-2 py-1"
          >
            <span>All Courses</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course) => {
          const isDone = course.status === "Completed" || course.percent >= 100;
          const isPaused = course.status === "Paused";

          return (
            <div
              key={course.skillId}
              className="card-interactive group relative flex flex-col justify-between rounded-3xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-xs hover:border-orange-500/40 dark:hover:border-sb-cyan/40 transition-all duration-200"
            >
              <div>
                {/* Course Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TechIcon3D nameOrId={course.skillId || course.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted truncate">
                          {course.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-sb-muted/40" />
                        <span className="text-[10px] font-semibold text-sb-muted">
                          {course.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#171717] dark:text-white group-hover:text-[#FF6A00] dark:group-hover:text-sb-cyan transition-colors truncate">
                        {course.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : isPaused
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border-orange-500/20 dark:border-sb-cyan/20"
                    }`}
                  >
                    {isDone ? "Completed" : isPaused ? "Paused" : "In Progress"}
                  </span>
                </div>

                {/* Progress Bar & Counter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#171717] dark:text-white flex items-center gap-1">
                      {isDone ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> 100% Complete
                        </span>
                      ) : (
                        <span className="text-[#FF6A00] dark:text-sb-cyan flex items-center gap-1">
                          <Play size={11} fill="currentColor" /> {course.percent}% Completed
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-sb-muted">
                      {course.completedLessonsCount}/{course.totalLessonsCount} lessons
                    </span>
                  </div>

                  <div className="h-2 w-full bg-black/[0.05] dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? "bg-emerald-500 shadow-2xs shadow-emerald-500/50"
                          : "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] dark:from-sb-cyan dark:to-sb-blue shadow-2xs shadow-orange-500/30"
                      }`}
                      style={{ width: `${course.percent}%` }}
                    />
                  </div>
                </div>

                {/* Next Topic / Pending Tasks Pill */}
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.05] mb-4 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-sb-muted flex items-center gap-1">
                      <Sparkles size={11} className="text-[#FF6A00] dark:text-sb-cyan" />
                      Next Up
                    </span>
                    {course.pendingTasksCount > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
                        {course.pendingTasksCount} tasks pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#171717] dark:text-white line-clamp-1">
                    {course.nextTaskTitle || "Next lesson in roadmap"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-sb-muted flex items-center gap-1 font-medium">
                  <Clock size={12} /> {course.estimatedRemainingHours}h remaining
                </span>

                <button
                  type="button"
                  onClick={() => onOpenWorkspace(course.skillId)}
                  className="btn-bounce-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-[#FF6A00] dark:hover:bg-sb-cyan dark:hover:text-[#090C12] transition-colors shadow-2xs"
                >
                  Continue Learning <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
