"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { recommend } from "@/lib/student/recommend";
import { APP_STATUSES, type Opportunity, type StudentTask } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import { OpportunityModal } from "./OpportunityParts";
import { ErrorNote, Spinner } from "./ui";
import StudentWelcomeBanner from "./StudentWelcomeBanner";
import StudentScheduleWidget from "./StudentScheduleWidget";
import StudentAnalyticsRows from "./StudentAnalyticsRows";
import StudentStreakStrip from "./StudentStreakStrip";
import RecommendedOpportunityCard from "./RecommendedOpportunityCard";
import UnifiedCodingProgress from "./UnifiedCodingProgress";
import RecentCodingFeed from "./RecentCodingFeed";
import CodingAccountsManager from "./CodingAccountsManager";
import EnrolledCoursesSection from "./dashboard/EnrolledCoursesSection";
import TodayLearningTasksSection from "./dashboard/TodayLearningTasksSection";
import CourseWorkspaceModal from "./gain-skills/CourseWorkspaceModal";
import CompactVideoPlayer, { type CompactLectureData } from "./gain-skills/CompactVideoPlayer";
import { SKILLS_CATALOG } from "@/lib/student/skills-catalog";
import type { EnrolledCourseSummary } from "@/lib/student/course-planner-engine";
import { api } from "@/lib/student/client";

const FILTER_OPTIONS = ["All", "Internship", "Full-time Job", "Remote"] as const;

export default function DashboardView() {
  const { data, completion, opps, oppsError, loadOpps, notify, refreshData } = useStudent();
  const [view, setView] = useState<Opportunity | null>(null);
  const [filterType, setFilterType] = useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);

  // Course Workspace & Compact Player state
  const [activeWorkspaceCourseId, setActiveWorkspaceCourseId] = useState<string | null>(null);
  const [activeLecture, setActiveLecture] = useState<CompactLectureData | null>(null);
  const [enrolledSummary, setEnrolledSummary] = useState<EnrolledCourseSummary[]>([]);
  const [learningTasks, setLearningTasks] = useState<StudentTask[]>(data.tasks || []);

  // Fetch enrolled courses summary & sync tasks
  const loadLearningData = async () => {
    const res = await api<{ enrolledCourses: EnrolledCourseSummary[]; tasks: StudentTask[] }>("/api/student/learning");
    if (res.ok && res.data) {
      if (res.data.enrolledCourses) setEnrolledSummary(res.data.enrolledCourses);
      if (res.data.tasks) setLearningTasks(res.data.tasks);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    const res = await api<{ tasks: StudentTask[]; enrolledCourses: EnrolledCourseSummary[] }>("/api/student/learning", {
      method: "POST",
      json: { action: "complete_learning_task", taskId },
    });
    if (res.ok && res.data) {
      if (res.data.tasks) setLearningTasks(res.data.tasks);
      if (res.data.enrolledCourses) setEnrolledSummary(res.data.enrolledCourses);
      notify("success", "Task completed! Tomorrow's lesson has been scheduled.");
      refreshData();
    } else {
      notify("error", res.error || "Could not complete task.");
    }
  };

  const handleRescheduleTask = async (taskId: string, newDate: string) => {
    const res = await api<{ tasks: StudentTask[] }>("/api/student/learning", {
      method: "POST",
      json: { action: "reschedule_task", taskId, newDate },
    });
    if (res.ok && res.data?.tasks) {
      setLearningTasks(res.data.tasks);
      notify("success", "Task rescheduled for tomorrow.");
    }
  };

  const handleWorkspaceToggleLesson = async (skillId: string, lessonId: string, completed: boolean) => {
    const res = await api<{ enrolledCourses: EnrolledCourseSummary[]; tasks: StudentTask[] }>("/api/student/learning", {
      method: "POST",
      json: { action: "toggle_lesson", skillId, lessonId, completed },
    });
    if (res.ok && res.data) {
      if (res.data.enrolledCourses) setEnrolledSummary(res.data.enrolledCourses);
      if (res.data.tasks) setLearningTasks(res.data.tasks);
      notify("success", completed ? "Lesson marked completed!" : "Lesson marked incomplete.");
      refreshData();
    }
  };

  const handleWorkspacePauseResume = async (skillId: string, action: "pause_course" | "resume_course") => {
    const res = await api<{ enrolledCourses: EnrolledCourseSummary[] }>("/api/student/learning", {
      method: "POST",
      json: { action, skillId },
    });
    if (res.ok && res.data?.enrolledCourses) {
      setEnrolledSummary(res.data.enrolledCourses);
      notify("success", action === "pause_course" ? "Course schedule paused." : "Course schedule resumed.");
    }
  };

  const activeWorkspaceSkill = useMemo(() => {
    if (!activeWorkspaceCourseId) return null;
    return SKILLS_CATALOG.find((s) => s.id === activeWorkspaceCourseId) || null;
  }, [activeWorkspaceCourseId]);

  const activeWorkspaceProgress = useMemo(() => {
    if (!activeWorkspaceCourseId || !data.learning) return undefined;
    return data.learning[activeWorkspaceCourseId];
  }, [activeWorkspaceCourseId, data.learning]);

  const first = data.user.name.split(/\s+/)[0];
  const rec = opps ? recommend(data, opps) : null;
  const mySkills = new Set(data.skills.map((s) => s.name.toLowerCase()));
  const nextStep = completion.missing[0];

  const appStatusCounts = APP_STATUSES.map((s) => ({
    status: s,
    count: data.applications.filter((a) => a.status === s).length,
  }));

  // Filtered opportunities according to selected pill
  const filteredOpps = useMemo(() => {
    if (!rec) return [];
    if (filterType === "All") return rec.items.slice(0, 3);
    if (filterType === "Remote") {
      const remotes = rec.items.filter((o) => o.mode === "Remote");
      return remotes.length ? remotes.slice(0, 3) : rec.items.slice(0, 3);
    }
    const typed = rec.items.filter((o) => o.type === filterType);
    return typed.length ? typed.slice(0, 3) : rec.items.slice(0, 3);
  }, [rec, filterType]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ============================================================== */}
      {/* 1. TOP ROW: Side-by-side Cinematic Hero Banner & Dark Calendar  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <StudentWelcomeBanner
            first={first}
            fullName={data.user.name}
            avatar={data.profile.avatar}
            nextStep={nextStep}
            college={data.profile.college}
            degree={data.profile.degree}
            branch={data.profile.branch}
          />
        </div>
        <div className="xl:col-span-4 flex flex-col">
          <StudentScheduleWidget
            data={data}
            opps={opps}
            onViewOpp={(opp) => setView(opp)}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MY LEARNING & TODAY'S AUTOMATED SMART LEARNING PLANNER      */}
      {/* ============================================================== */}
      <EnrolledCoursesSection
        courses={enrolledSummary}
        onOpenWorkspace={(courseId) => setActiveWorkspaceCourseId(courseId)}
      />

      <TodayLearningTasksSection
        tasks={learningTasks}
        onCompleteTask={handleCompleteTask}
        onRescheduleTask={handleRescheduleTask}
        onStartLecture={(lecture) => setActiveLecture(lecture)}
        onOpenWorkspace={(courseId) => setActiveWorkspaceCourseId(courseId)}
      />

      {/* ============================================================== */}
      {/* 3. UNIFIED CODING PROGRESS: Multi-Platform Ratings & Pillars   */}
      {/* ============================================================== */}
      <UnifiedCodingProgress
        data={data}
        onOpenAccountsManager={() => setAccountsModalOpen(true)}
      />

      {/* ============================================================== */}
      {/* 3. ANALYTICS ROWS: Focus Time, Study Rhythm, Unified Map, Index */}
      {/* ============================================================== */}
      <StudentAnalyticsRows
        data={data}
        completionPercent={completion.percent}
        onOpenAccountsManager={() => setAccountsModalOpen(true)}
      />

      {/* ============================================================== */}
      {/* 4. RECENT CODING ACTIVITY FEED: Commits, Submissions, Contests */}
      {/* ============================================================== */}
      <RecentCodingFeed
        data={data}
        onOpenAccountsManager={() => setAccountsModalOpen(true)}
      />

      {/* ============================================================== */}
      {/* 5. RECOMMENDED OPPORTUNITIES & APPLICATION PIPELINE            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Panel (8 cols): Recommended Opportunities with Filter Pills */}
        <section aria-labelledby="opps-heading" className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
                  <Briefcase size={14} />
                </span>
                <h2
                  id="opps-heading"
                  className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white"
                >
                  Recommended Opportunities
                </h2>
              </div>
              <p className="text-xs text-[#71717A] dark:text-sb-muted mt-0.5">
                {rec?.personalised
                  ? "Ranked according to your verified skills and preferred roles."
                  : "Add verified skills and preferences to personalize recommendations."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFilterType(opt)}
                    className={`btn-bounce-sm px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === opt
                        ? "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-sm dark:from-white dark:to-white dark:text-[#18181B]"
                        : "text-[#686868] hover:text-[#171717] dark:text-sb-muted dark:hover:text-white"
                    }`}
                  >
                    {opt === "Full-time Job" ? "Full-time" : opt}
                  </button>
                ))}
              </div>

              <Link
                href="/student/opportunities"
                className="btn-bounce-sm group hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] dark:text-sb-cyan hover:underline px-2 py-1 rounded-lg"
              >
                <span>View all</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {oppsError ? (
            <ErrorNote retry={loadOpps}>{oppsError}</ErrorNote>
          ) : !rec ? (
            <Spinner label="Loading opportunities" />
          ) : filteredOpps.length === 0 ? (
            <div className="rounded-3xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-8 text-center text-[#686868] dark:text-sb-muted">
              <p className="text-sm font-medium">No open opportunities found for this filter.</p>
              <button
                type="button"
                onClick={() => setFilterType("All")}
                className="btn btn-ghost btn-sm mt-3 inline-flex items-center gap-1.5"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredOpps.map((o) => (
                <RecommendedOpportunityCard
                  key={o.id}
                  opportunity={o}
                  mySkills={mySkills}
                  onView={(opp) => setView(opp)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Supporting Panel (4 cols): Pipeline Snapshot & Next Action */}
        <aside className="lg:col-span-4 space-y-5" aria-label="Dashboard insights">
          {/* Next Action / Profile Completion Prompt */}
          {nextStep ? (
            <div className="card-interactive rounded-3xl border border-orange-200/80 dark:border-white/10 bg-gradient-to-br from-orange-500/[0.06] to-white dark:bg-white/[0.03] p-5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6A00] dark:text-sb-cyan">
                <Sparkles size={14} /> Next Action
              </div>
              <h4 className="mt-2 text-sm font-bold text-[#171717] dark:text-white">
                {nextStep.label}
              </h4>
              <p className="mt-1 text-xs text-[#686868] dark:text-sb-muted leading-relaxed">
                Completing this step will increase your match score and rank you higher in campus recruiter searches.
              </p>
              <Link
                href={nextStep.href}
                className="btn-bounce mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-[0_4px_14px_-2px_rgba(255,106,0,0.35)] hover:shadow-[0_6px_20px_-2px_rgba(255,106,0,0.45)] dark:bg-white dark:from-transparent dark:to-transparent dark:shadow-none dark:text-[#18181B] py-2.5 text-xs font-bold transition-all"
              >
                Complete Now <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="card-interactive rounded-3xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-500/[0.04] p-5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Profile Verified
              </div>
              <h4 className="mt-2 text-sm font-bold text-[#171717] dark:text-white">
                100% Complete
              </h4>
              <p className="mt-1 text-xs text-[#686868] dark:text-sb-muted leading-relaxed">
                Your portfolio, verified skills, and resume are active and ready for campus recruiter drives.
              </p>
              <Link
                href="/student/profile"
                className="btn-bounce mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-white py-2.5 text-xs font-bold hover:bg-emerald-700 transition-all"
              >
                View Full Profile <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Application Pipeline Snapshot */}
          <div className="card-interactive rounded-3xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-[#E3E3E3] dark:border-white/10 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-sb-muted">
                Application Pipeline
              </h4>
              <Link
                href="/student/applications"
                className="btn-bounce-sm text-xs font-semibold text-[#FF6A00] dark:text-sb-cyan hover:underline px-2 py-0.5 rounded-lg"
              >
                View all →
              </Link>
            </div>

            {data.applications.length === 0 ? (
              <div className="text-xs text-[#686868] dark:text-sb-muted leading-relaxed py-2">
                <p>You haven&apos;t applied to any roles yet.</p>
                <p className="mt-1">
                  Once you apply, application statuses and interview invitations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {appStatusCounts
                  .filter((s) => s.count > 0)
                  .map(({ status, count }) => (
                    <div
                      key={status}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[#F7F7F7] dark:border-white/10 last:border-0"
                    >
                      <span className="text-[#171717] dark:text-white font-medium">
                        {status}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* 4. FULL-WIDTH BOTTOM STREAK & PLACEMENT PROGRESS STRIP         */}
      {/* ============================================================== */}
      <StudentStreakStrip currentStreakDays={5} />

      {/* Opportunity Details & Quick Action Modal */}
      <OpportunityModal o={view} onClose={() => setView(null)} />

      {/* Coding Accounts Integration Center Modal */}
      {accountsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-dash-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-coding-accounts-title"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#121417] border border-[#E3E3E3] dark:border-white/10 p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setAccountsModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-xl text-[#686868] hover:text-[#171717] dark:text-sb-muted dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2
                id="manage-coding-accounts-title"
                className="text-xl font-black text-[#171717] dark:text-white"
              >
                Manage Coding Platform Accounts
              </h2>
              <p className="text-xs text-[#686868] dark:text-sb-muted mt-1">
                Connect your GitHub, LeetCode, and CodeChef profiles to synchronize verified coding statistics and real-time activity across SkillBridge.
              </p>
            </div>

            <CodingAccountsManager
              accounts={data.codingAccounts || []}
              onAccountsUpdated={async () => {
                await refreshData();
              }}
              notify={notify}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. COURSE WORKSPACE MODAL & COMPACT VIDEO PLAYER OVERLAYS      */}
      {/* ============================================================== */}
      {activeWorkspaceSkill && (
        <CourseWorkspaceModal
          skill={activeWorkspaceSkill}
          progress={activeWorkspaceProgress}
          onClose={() => setActiveWorkspaceCourseId(null)}
          onToggleLesson={handleWorkspaceToggleLesson}
          onPauseResume={handleWorkspacePauseResume}
          onOpenCompactVideo={(lecture) => setActiveLecture(lecture)}
        />
      )}

      {activeLecture && (
        <CompactVideoPlayer
          lecture={activeLecture}
          onClose={() => setActiveLecture(null)}
          onToggleComplete={async () => {
            if (activeLecture.skillId && activeLecture.lessonId) {
              await handleWorkspaceToggleLesson(activeLecture.skillId, activeLecture.lessonId, true);
              setActiveLecture((prev) => (prev ? { ...prev, isCompleted: true } : null));
            }
          }}
        />
      )}
    </div>
  );
}
