"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Code2,
  HelpCircle,
  FolderGit2,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import type { StudentTask } from "@/lib/student/types";
import { CompactLectureData } from "../gain-skills/CompactVideoPlayer";

interface TodayLearningTasksSectionProps {
  tasks: StudentTask[];
  onCompleteTask: (taskId: string) => Promise<void>;
  onRescheduleTask?: (taskId: string, newDate: string) => Promise<void>;
  onStartLecture?: (lecture: CompactLectureData) => void;
  onOpenWorkspace?: (courseId: string) => void;
}

export default function TodayLearningTasksSection({
  tasks,
  onCompleteTask,
  onRescheduleTask,
  onStartLecture,
  onOpenWorkspace,
}: TodayLearningTasksSectionProps) {
  const [filterType, setFilterType] = useState<"All" | "Watch Lecture" | "Practice Coding" | "Quiz/Project">("All");
  const [completingId, setCompletingId] = useState<string | null>(null);

  const todayIso = new Date().toISOString().split("T")[0];

  // Separate tasks into Today's, Pending Overdue, and Upcoming
  const filteredTasks = tasks.filter((t) => {
    if (filterType === "All") return true;
    if (filterType === "Watch Lecture") return t.type === "Watch Lecture";
    if (filterType === "Practice Coding") return t.type === "Practice Coding";
    if (filterType === "Quiz/Project") return t.type === "Solve Quiz" || t.type === "Build Mini Project";
    return true;
  });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTodayTasks = filteredTasks.filter((t) => t.completed);

  const handleCheck = async (task: StudentTask) => {
    if (task.completed) return;
    setCompletingId(task.id);
    try {
      await onCompleteTask(task.id);
    } finally {
      setCompletingId(null);
    }
  };

  const handleStartTaskAction = (task: StudentTask) => {
    if (task.type === "Watch Lecture" && task.videoUrl && onStartLecture) {
      onStartLecture({
        videoUrl: task.videoUrl,
        title: task.topic || task.title,
        instructor: "SkillBridge Indian Educator",
        courseOrSkillName: task.courseName || "Gain Skills Course",
        lessonOrPhaseTitle: task.topic || task.title,
        durationMinutes: task.estimatedMinutes || 45,
        stage: "Beginner",
        language: "Hindi",
        isIndianCreator: true,
        isPlaylist: true,
        summary: task.description || "Course lecture video",
        lessonId: task.lessonId,
        skillId: task.courseId,
        isCompleted: task.completed,
      });
    } else if (task.courseId && onOpenWorkspace) {
      onOpenWorkspace(task.courseId);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "Watch Lecture":
        return <Play size={13} fill="currentColor" className="text-[#FF6A00] dark:text-sb-cyan" />;
      case "Practice Coding":
        return <Code2 size={13} className="text-[#FF9F1C] dark:text-sb-blue" />;
      case "Solve Quiz":
        return <HelpCircle size={13} className="text-amber-500" />;
      case "Build Mini Project":
        return <FolderGit2 size={13} className="text-purple-500" />;
      default:
        return <Sparkles size={13} className="text-orange-500" />;
    }
  };

  return (
    <section aria-labelledby="today-tasks-heading" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
              <Calendar size={15} />
            </span>
            <h2
              id="today-tasks-heading"
              className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white"
            >
              Today&apos;s Learning Tasks & Automated Planner
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20">
              {pendingTasks.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#71717A] dark:text-sb-muted mt-0.5">
            Auto-assigned from your active course syllabus. Completing a task unlocks tomorrow&apos;s lesson automatically.
          </p>
        </div>

        {/* Task Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10 text-xs">
          {(["All", "Watch Lecture", "Practice Coding", "Quiz/Project"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`btn-bounce-sm px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === tab
                  ? "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-2xs dark:from-white dark:to-white dark:text-[#18181B]"
                  : "text-sb-muted hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              {tab === "Practice Coding" ? "Coding" : tab === "Watch Lecture" ? "Lectures" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-3xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-[var(--card-glass-bg)] p-8 text-center text-sb-muted space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500/80" />
          <h3 className="text-sm font-bold text-[#171717] dark:text-white">
            All Caught Up for Today!
          </h3>
          <p className="text-xs text-neutral-500 dark:text-sb-muted max-w-sm mx-auto">
            You have completed all planned tasks. Continue into your course workspace or explore new skills to accelerate your roadmap.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map((task) => {
            const isWorking = completingId === task.id;
            return (
              <div
                key={task.id}
                className="group p-4 rounded-2xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-white/10 hover:border-orange-500/40 dark:hover:border-sb-cyan/40 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleCheck(task)}
                    disabled={isWorking}
                    className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    aria-label={`Mark task completed: ${task.title}`}
                  >
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 group-hover:border-[#FF6A00] dark:group-hover:border-sb-cyan flex items-center justify-center">
                      {isWorking && <div className="h-2 w-2 rounded-full bg-[#FF6A00] animate-ping" />}
                    </div>
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/5 text-sb-muted">
                        Day {task.dayNumber || 1}
                      </span>
                      {task.courseName && (
                        <span className="text-[10px] font-bold text-[#FF6A00] dark:text-sb-cyan bg-orange-500/10 dark:bg-sb-cyan/15 px-2 py-0.2 rounded-md">
                          {task.courseName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sb-muted">
                        {getTaskIcon(task.type)}
                        {task.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#171717] dark:text-white leading-tight">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-neutral-500 dark:text-sb-muted line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-sb-muted flex items-center gap-1">
                    <Clock size={12} /> {task.estimatedMinutes || 45}m
                  </span>

                  {task.type === "Watch Lecture" ? (
                    <button
                      type="button"
                      onClick={() => handleStartTaskAction(task)}
                      className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-2xs dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12]"
                    >
                      <Play size={11} fill="currentColor" /> Watch Lecture
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartTaskAction(task)}
                      className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs hover:bg-[#FF6A00] dark:hover:bg-sb-cyan dark:hover:text-[#090C12] transition-colors"
                    >
                      <Code2 size={12} /> Start Practice
                    </button>
                  )}

                  {onRescheduleTask && (
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        onRescheduleTask(task.id, tomorrow.toISOString().split("T")[0]);
                      }}
                      title="Reschedule for tomorrow"
                      className="grid h-7 w-7 place-items-center rounded-lg text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors"
                      aria-label="Reschedule task"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Completed Tasks Summary Accordion / Section */}
          {completedTodayTasks.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-sb-muted uppercase tracking-wider block mb-2">
                Completed Tasks ({completedTodayTasks.length})
              </span>
              <div className="space-y-2 opacity-75">
                {completedTodayTasks.map((cTask) => (
                  <div
                    key={cTask.id}
                    className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-xs line-through font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                        {cTask.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      Completed ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
