"use client";

import { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  PauseCircle,
  PlayCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Code2,
  HelpCircle,
  FolderGit2,
} from "lucide-react";
import type { SkillDefinition, StudentSkillProgress } from "@/lib/student/skills-catalog";
import { TechIcon3D } from "../ui/tech-icons";
import CompactVideoPlayer, { type CompactLectureData } from "./CompactVideoPlayer";

interface CourseWorkspaceModalProps {
  skill: SkillDefinition;
  progress?: StudentSkillProgress;
  onClose: () => void;
  onToggleLesson: (skillId: string, lessonId: string, completed: boolean) => Promise<void>;
  onPauseResume?: (skillId: string, action: "pause_course" | "resume_course") => Promise<void>;
  onOpenCompactVideo?: (lecture: CompactLectureData) => void;
}

export default function CourseWorkspaceModal({
  skill,
  progress,
  onClose,
  onToggleLesson,
  onPauseResume,
  onOpenCompactVideo,
}: CourseWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "projects" | "quizzes">("syllabus");
  const [activeLecture, setActiveLecture] = useState<CompactLectureData | null>(null);

  const completedLessonIds = progress?.completedLessonIds || [];
  const completedCount = completedLessonIds.length;
  const totalLessons = skill.lessons.length;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = progress?.status === "Completed" || (totalLessons > 0 && completedCount >= totalLessons);
  const isPaused = progress?.status === "Paused";

  const handleStartLesson = (lesson: (typeof skill.lessons)[0]) => {
    const isIndian = [
      "CodeWithHarry",
      "Striver",
      "take U forward",
      "Apna College",
      "Shradha Khapra",
      "Chai aur Code",
      "Hitesh Choudhary",
      "Love Babbar",
      "Jenny's Lectures CS/IT",
      "Gate Smashers",
      "CampusX",
      "Krish Naik",
      "5 Minutes Engineering",
      "Gaurav Sen",
      "Concept && Coding",
    ].some((c) => (lesson.instructor || "").toLowerCase().includes(c.toLowerCase()));

    const lectureData: CompactLectureData = {
      videoUrl: lesson.videoUrl || "",
      youtubeUrl: lesson.youtubeUrl,
      title: lesson.videoTitle || lesson.title,
      instructor: lesson.instructor || "SkillBridge Educator",
      channelName: lesson.channelName,
      courseOrSkillName: skill.name,
      lessonOrPhaseTitle: `${lesson.stage} • ${lesson.title}`,
      durationMinutes: lesson.durationMinutes,
      stage: lesson.stage,
      language: lesson.language || "Hindi",
      isIndianCreator: isIndian,
      isPlaylist: lesson.isPlaylist ?? true,
      playlistTitle: lesson.playlistTitle,
      summary: lesson.summary,
      lessonId: lesson.id,
      skillId: skill.id,
      isCompleted: completedLessonIds.includes(lesson.id),
    };

    if (onOpenCompactVideo) {
      onOpenCompactVideo(lectureData);
    } else {
      setActiveLecture(lectureData);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF9F5] dark:bg-[#12161F] border border-orange-500/20 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Workspace Top Header Bar */}
        <div className="relative z-10 px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#151B26]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <TechIcon3D nameOrId={skill.id || skill.name} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted">
                  Course Workspace
                </span>
                <span className="h-1 w-1 rounded-full bg-sb-muted/60" />
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : isPaused
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border-orange-500/20 dark:border-sb-cyan/20"
                  }`}
                >
                  {isCompleted ? "Completed" : isPaused ? "Paused" : "In Progress"}
                </span>
              </div>
              <h2 id="workspace-title" className="text-lg sm:text-xl font-black text-[#171717] dark:text-white leading-tight">
                {skill.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onPauseResume && !isCompleted && (
              <button
                type="button"
                onClick={() => onPauseResume(skill.id, isPaused ? "resume_course" : "pause_course")}
                className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-[#525252] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white transition-all shadow-2xs"
              >
                {isPaused ? (
                  <>
                    <PlayCircle size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
                    Resume Course
                  </>
                ) : (
                  <>
                    <PauseCircle size={14} className="text-amber-500" />
                    Pause Schedule
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors"
              aria-label="Close workspace"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Course Progress Strip */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-orange-500/[0.04] via-amber-500/[0.03] to-transparent dark:from-sb-cyan/[0.04] dark:to-transparent border-b border-black/[0.05] dark:border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#171717] dark:text-white">
              Overall Progress: <span className="text-[#FF6A00] dark:text-sb-cyan font-mono">{percent}%</span>
            </span>
            <span className="text-sb-muted">
              Lessons: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{completedCount}/{totalLessons}</span>
            </span>
            <span className="text-sb-muted hidden sm:inline">
              Est. Time: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{skill.estimatedHours} hrs</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View navigation tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-black/[0.04] dark:bg-white/5 rounded-xl border border-black/[0.06] dark:border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("syllabus")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "syllabus"
                    ? "bg-white dark:bg-white/15 text-[#FF6A00] dark:text-white shadow-2xs font-bold"
                    : "text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                Syllabus & Lectures
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "projects"
                    ? "bg-white dark:bg-white/15 text-[#FF6A00] dark:text-white shadow-2xs font-bold"
                    : "text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                Mini Projects ({skill.projects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quizzes")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "quizzes"
                    ? "bg-white dark:bg-white/15 text-[#FF6A00] dark:text-white shadow-2xs font-bold"
                    : "text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                Quizzes ({skill.quiz.length})
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "syllabus" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-sb-muted mb-1">
                <span>Interactive Learning Sequence & Indian Educator Lectures</span>
                <span>Click lecture to open Compact Player</span>
              </div>

              {skill.lessons.map((lesson, idx) => {
                const done = completedLessonIds.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className={`group p-4 rounded-2xl border transition-all ${
                      done
                        ? "bg-white/60 dark:bg-[#151B26]/60 border-emerald-500/20 opacity-85"
                        : "bg-white dark:bg-[#151B26] border-black/[0.07] dark:border-white/10 hover:border-orange-500/30 dark:hover:border-sb-cyan/30 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleLesson(skill.id, lesson.id, !done)}
                          className="mt-0.5 shrink-0 transition-transform active:scale-90"
                          aria-label={done ? "Mark lesson incomplete" : "Mark lesson complete"}
                        >
                          {done ? (
                            <CheckCircle2 size={19} className="text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 hover:border-[#FF6A00] dark:hover:border-sb-cyan" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/5 text-sb-muted">
                              Day {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted">
                              {lesson.stage}
                            </span>
                            {lesson.instructor && (
                              <span className="text-[10px] font-semibold text-[#FF6A00] dark:text-sb-cyan bg-orange-500/10 dark:bg-sb-cyan/10 px-2 py-0.2 rounded-full">
                                {lesson.instructor}
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-sm font-bold ${
                              done
                                ? "line-through text-neutral-500 dark:text-neutral-400"
                                : "text-[#171717] dark:text-white"
                            }`}
                          >
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-sb-muted line-clamp-2 mt-0.5">
                            {lesson.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-[11px] font-mono text-sb-muted flex items-center gap-1">
                          <Clock size={12} /> {lesson.durationMinutes}m
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartLesson(lesson)}
                          className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-2xs hover:shadow-orange-500/20 dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] transition-all"
                        >
                          <Play size={12} fill="currentColor" /> Watch Lecture
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-3">
              <p className="text-xs text-sb-muted mb-2">
                Hands-on practical tasks designed to apply your knowledge in production-grade code.
              </p>
              {skill.projects.map((proj, pIdx) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#151B26] border border-black/[0.07] dark:border-white/10 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] dark:text-sb-cyan flex items-center gap-1">
                      <FolderGit2 size={13} /> Project #{pIdx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-sb-muted">{proj.difficulty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171717] dark:text-white">{proj.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-sb-muted">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.deliverables.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.03] dark:bg-white/5 border border-black/[0.05] dark:border-white/5 text-neutral-600 dark:text-neutral-400"
                      >
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="space-y-3">
              <p className="text-xs text-sb-muted mb-2">
                Checkpoint quizzes verifying core principles and problem-solving readiness.
              </p>
              {skill.quiz.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#151B26] border border-black/[0.07] dark:border-white/10 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <HelpCircle size={13} /> Checkpoint #{qIdx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-sb-muted">{q.options.length} options</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171717] dark:text-white">{q.question}</h4>
                  <p className="text-xs text-neutral-600 dark:text-sb-muted">{q.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#151B26]/80 flex items-center justify-between">
          <div className="text-xs text-sb-muted">
            {isCompleted ? "🎉 All lessons completed! Skill can be added to your profile." : "Keep up daily momentum to unlock profile certifications."}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-bounce-sm px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>

      {/* Render Compact Video Player overlay if activated within workspace */}
      {activeLecture && (
        <CompactVideoPlayer
          lecture={activeLecture}
          onClose={() => setActiveLecture(null)}
          onToggleComplete={async () => {
            if (activeLecture.lessonId) {
              await onToggleLesson(skill.id, activeLecture.lessonId, true);
              setActiveLecture((prev) => (prev ? { ...prev, isCompleted: true } : null));
            }
          }}
        />
      )}
    </div>
  );
}
