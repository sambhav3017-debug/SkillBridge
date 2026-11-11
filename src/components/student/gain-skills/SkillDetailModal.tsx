"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  BookOpen,
  Video,
  FileCode2,
  HelpCircle,
  CheckCircle2,
  Play,
  Clock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Award,
  Check,
  RotateCcw,
} from "lucide-react";
import type { SkillDefinition, StudentSkillProgress, Lesson } from "@/lib/student/skills-types";
import type { Proficiency } from "@/lib/student/types";
import { TechIcon3D } from "../ui/tech-icons";
import CompactVideoPlayer, { CompactLectureData } from "./CompactVideoPlayer";

interface SkillDetailModalProps {
  skill: SkillDefinition;
  progress?: StudentSkillProgress;
  isProfileSkill?: boolean;
  onClose: () => void;
  onToggleLesson: (skillId: string, lessonId: string, completed: boolean) => Promise<void>;
  onToggleProject: (skillId: string, projectId: string, completed: boolean) => Promise<void>;
  onRecordQuiz: (skillId: string, score: number) => Promise<void>;
  onAddToProfile: (skillId: string, level: Proficiency) => Promise<void>;
  onEnroll?: (skill: SkillDefinition) => void;
}

export default function SkillDetailModal({
  skill,
  progress,
  isProfileSkill = false,
  onClose,
  onToggleLesson,
  onToggleProject,
  onRecordQuiz,
  onAddToProfile,
  onEnroll,
}: SkillDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "roadmap" | "videos" | "docs" | "projects" | "quiz"
  >("roadmap");

  const [activeLessonId, setActiveLessonId] = useState<string>(
    skill.lessons[0]?.id || ""
  );
  const [compactLecture, setCompactLecture] = useState<CompactLectureData | null>(null);

  // Profile Add Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  const [selectedProficiency, setSelectedProficiency] = useState<Proficiency>(
    skill.difficulty
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const completedLessonIds = progress?.completedLessonIds || [];
  const completedProjectIds = progress?.completedProjectIds || [];
  const totalLessons = skill.lessons.length;
  const percent =
    totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

  // Active Lesson for Video Player
  const currentLesson: Lesson = useMemo(() => {
    return skill.lessons.find((l) => l.id === activeLessonId) || skill.lessons[0];
  }, [skill.lessons, activeLessonId]);

  const currentLessonIndex = useMemo(() => {
    return skill.lessons.findIndex((l) => l.id === currentLesson?.id);
  }, [skill.lessons, currentLesson]);

  const openCompactPlayerForLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    const isIndian =
      lesson.isIndianCreator ??
      [
        "CodeWithHarry",
        "Apna College",
        "Chai aur Code",
        "takeUforward (Striver)",
        "takeUforward",
        "Love Babbar",
        "Jenny's Lectures CS/IT",
        "Gate Smashers",
        "CampusX",
        "Krish Naik",
        "5 Minutes Engineering",
        "Gaurav Sen",
        "Concept && Coding",
      ].some((c) => (lesson.instructor || "").toLowerCase().includes(c.toLowerCase()));

    setCompactLecture({
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
    });
  };

  // Group lessons by stage
  const groupedLessons = useMemo(() => {
    return {
      Beginner: skill.lessons.filter((l) => l.stage === "Beginner"),
      Intermediate: skill.lessons.filter((l) => l.stage === "Intermediate"),
      Advanced: skill.lessons.filter((l) => l.stage === "Advanced"),
    };
  }, [skill.lessons]);

  async function handleAddSkill() {
    setProfileSaving(true);
    try {
      await onAddToProfile(skill.id, selectedProficiency);
      setProfileSuccess(true);
      setTimeout(() => {
        setShowProfileModal(false);
        setProfileSuccess(false);
      }, 1500);
    } finally {
      setProfileSaving(false);
    }
  }

  function handleAnswerSelect(questionId: string, optionIndex: number) {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleQuizSubmit() {
    let score = 0;
    const total = skill.quiz.length;
    if (total === 0) return;

    skill.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const finalPercent = Math.round((score / total) * 100);
    setQuizSubmitted(true);
    await onRecordQuiz(skill.id, finalPercent);
  }

  function handleResetQuiz() {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-black/[0.08] dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0E1117] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex-none p-5 sm:p-6 border-b border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#141820]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <TechIcon3D nameOrId={skill.id || skill.name} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sb-muted">
                    {skill.category}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-sb-muted" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20">
                    {skill.difficulty} Level
                  </span>
                  <span className="text-xs font-medium text-sb-muted flex items-center gap-1">
                    <Clock size={12} /> {skill.estimatedHours} Hours
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] dark:text-white">
                  {skill.name} Learning Roadmap
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!progress && onEnroll && (
                <button
                  type="button"
                  onClick={() => onEnroll(skill)}
                  className="btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-sm hover:shadow-orange-500/25 dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] active:scale-[0.98] transition-all duration-180 cursor-pointer"
                >
                  <BookOpen size={14} />
                  Enroll in Course
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-[#FF6A00] dark:from-sb-cyan/15 dark:to-sb-blue/15 dark:border-sb-cyan/30 dark:text-sb-cyan hover:bg-[#FF6A00] hover:text-white dark:hover:bg-sb-cyan dark:hover:text-[#090C12] active:scale-[0.98] transition-all duration-180 cursor-pointer shadow-2xs"
              >
                <Award size={14} />
                {isProfileSkill ? "Update Profile Level" : "Add to Profile"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-[0.95] transition-all duration-150 cursor-pointer"
                aria-label="Close learning modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Description & Prerequisites */}
          <p className="mt-3 text-xs sm:text-sm text-[#525252] dark:text-sb-muted leading-relaxed max-w-3xl">
            {skill.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#171717] dark:text-white">Prerequisites:</span>
            {skill.prerequisites.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-[#686868] dark:text-sb-muted text-[11px]"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Overall Progress Strip */}
          <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="h-2 flex-1 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] dark:from-sb-cyan dark:to-sb-blue transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#FF6A00] dark:text-sb-cyan whitespace-nowrap">
                {percent}% Completed
              </span>
            </div>

            <div className="text-xs text-sb-muted font-medium">
              <span>{completedLessonIds.length} of {totalLessons} lessons</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex-none px-6 border-b border-black/[0.08] dark:border-white/10 bg-white/50 dark:bg-[#11141A] flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
          {[
            { id: "roadmap", label: "Roadmap Timeline", icon: BookOpen },
            { id: "videos", label: "Video Lectures", icon: Video },
            { id: "docs", label: "Official Docs & Reading", icon: ExternalLink },
            { id: "projects", label: "Mini-Projects", icon: FileCode2 },
            { id: "quiz", label: "Knowledge Checkpoint", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-180 whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] text-white shadow-xs dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12]"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((stage) => {
                const stageLessons = groupedLessons[stage] || [];
                if (stageLessons.length === 0) return null;

                const stageCompletedCount = stageLessons.filter((l) =>
                  completedLessonIds.includes(l.id)
                ).length;
                const stageTotal = stageLessons.length;
                const isStageComplete = stageCompletedCount === stageTotal;

                return (
                  <div
                    key={stage}
                    className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06] dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isStageComplete
                              ? "bg-emerald-500"
                              : stage === "Beginner"
                              ? "bg-[#FF6A00]"
                              : stage === "Intermediate"
                              ? "bg-amber-500"
                              : "bg-purple-500"
                          }`}
                        />
                        <h3 className="font-bold text-base text-[#171717] dark:text-white">
                          {stage} Stage
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-sb-muted">
                        {stageCompletedCount} / {stageTotal} Completed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {stageLessons.map((l, index) => {
                        const isDone = completedLessonIds.includes(l.id);
                        return (
                          <div
                            key={l.id}
                            className={`group flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                              isDone
                                ? "bg-emerald-500/[0.04] border-emerald-500/20 text-[#171717] dark:text-white"
                                : "bg-black/[0.015] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/5 hover:border-orange-500/30 dark:hover:border-sb-cyan/30"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => onToggleLesson(skill.id, l.id, !isDone)}
                                className={`btn-bounce-sm grid h-6 w-6 place-items-center rounded-lg border transition-all shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-black/20 dark:border-white/20 hover:border-[#FF6A00] dark:hover:border-sb-cyan text-transparent"
                                }`}
                                aria-label={`Toggle lesson ${l.title}`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-sb-muted font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <h4
                                    className={`text-sm font-semibold truncate ${
                                      isDone
                                        ? "text-emerald-700 dark:text-emerald-300"
                                        : "text-[#171717] dark:text-white"
                                    }`}
                                  >
                                    {l.title}
                                  </h4>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {l.instructor && (
                                    <span className="text-[10px] font-semibold text-blue-600 dark:text-sb-blue flex items-center gap-1">
                                      <Play size={9} fill="currentColor" /> {l.instructor}
                                    </span>
                                  )}
                                  {(l.isIndianCreator ?? [
                                    "CodeWithHarry", "Apna College", "Chai aur Code", "takeUforward", "Love Babbar",
                                    "Jenny's Lectures", "Gate Smashers", "CampusX", "Krish Naik", "5 Minutes Engineering", "Gaurav Sen"
                                  ].some(c => (l.instructor || "").toLowerCase().includes(c.toLowerCase()))) && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                      <span>🇮🇳</span> Indian Educator
                                    </span>
                                  )}
                                  {l.language && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-black/[0.04] dark:bg-white/5 text-neutral-600 dark:text-neutral-400">
                                      {l.language}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-sb-muted line-clamp-1 mt-0.5">
                                  {l.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium text-sb-muted hidden sm:inline-flex items-center gap-1">
                                <Clock size={11} /> {l.durationMinutes}m
                              </span>
                              {l.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => openCompactPlayerForLesson(l)}
                                  className="btn-bounce-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#E55A00] text-white dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                                >
                                  <Play size={11} fill="currentColor" /> View Lecture
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: VIDEOS */}
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
              {/* Left Column: Responsive Video Player */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/[0.08] dark:border-white/10">
                  {currentLesson?.videoUrl ? (
                    <iframe
                      src={currentLesson.videoUrl}
                      title={currentLesson.videoTitle || currentLesson.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white/80">
                      <Video size={40} className="mb-2 text-[#FF6A00]" />
                      <p className="font-bold text-sm">Lecture Video Available Soon</p>
                      <p className="text-xs text-white/60 mt-1 max-w-sm">
                        Refer to official documentation and mini-projects while lecture updates stream.
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Info Strip */}
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted">
                      Lesson {currentLessonIndex + 1} of {totalLessons} • {currentLesson?.stage}
                    </span>
                    <h3 className="text-base font-bold text-[#171717] dark:text-white">
                      {currentLesson?.title}
                    </h3>
                    <p className="text-xs text-sb-muted mt-0.5">
                      Instructor: <span className="font-semibold text-[#171717] dark:text-white">{currentLesson?.instructor || "freeCodeCamp.org"}</span> • {currentLesson?.durationMinutes} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCompactPlayerForLesson(currentLesson)}
                      className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-orange-500/30 text-[#FF6A00] dark:border-sb-cyan/30 dark:text-sb-cyan hover:bg-orange-500/10 dark:hover:bg-sb-cyan/10 transition cursor-pointer"
                    >
                      <Play size={13} fill="currentColor" /> Compact Player
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleLesson(
                          skill.id,
                          currentLesson.id,
                          !completedLessonIds.includes(currentLesson.id)
                        )
                      }
                    className={`btn-bounce-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      completedLessonIds.includes(currentLesson.id)
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-sm hover:brightness-105"
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    {completedLessonIds.includes(currentLesson.id)
                      ? "Completed ✓"
                      : "Mark as Completed"}
                  </button>
                </div>
              </div>

                {/* Previous / Next Lesson Navigation */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={currentLessonIndex <= 0}
                    onClick={() => setActiveLessonId(skill.lessons[currentLessonIndex - 1]?.id)}
                    className="btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] text-sb-muted hover:text-[#171717] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Previous Lesson
                  </button>
                  <button
                    type="button"
                    disabled={currentLessonIndex >= totalLessons - 1}
                    onClick={() => setActiveLessonId(skill.lessons[currentLessonIndex + 1]?.id)}
                    className="btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] text-sb-muted hover:text-[#171717] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Next Lesson <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Right Column: Playlist Queue */}
              <div className="lg:col-span-4 rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-4 flex flex-col max-h-[500px]">
                <h4 className="font-bold text-sm text-[#171717] dark:text-white mb-3 flex items-center justify-between">
                  <span>Lesson Playlist</span>
                  <span className="text-xs text-sb-muted font-normal">
                    {completedLessonIds.length}/{totalLessons} Done
                  </span>
                </h4>

                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {skill.lessons.map((lesson, idx) => {
                    const isSelected = lesson.id === activeLessonId;
                    const isDone = completedLessonIds.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500/10 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan font-bold border border-orange-500/20 dark:border-sb-cyan/30"
                            : "hover:bg-black/[0.03] dark:hover:bg-white/5 text-[#525252] dark:text-sb-muted font-medium border border-transparent"
                        }`}
                      >
                        <span className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : isSelected ? (
                            <Play size={12} fill="currentColor" />
                          ) : (
                            <span className="text-[10px] font-mono opacity-60">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          )}
                        </span>
                        <span className="truncate flex-1">{lesson.title}</span>
                        <span className="text-[10px] opacity-60 shrink-0">
                          {lesson.durationMinutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL DOCS & READING */}
          {activeTab === "docs" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
                    <BookOpen size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-[#171717] dark:text-white">
                      Official Documentation & Standard References
                    </h3>
                    <p className="text-xs text-sb-muted">
                      Industry vetted documentation sources for {skill.name}.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-[#171717] dark:text-white">
                      {skill.name} Official Documentation Portal
                    </h4>
                    <p className="text-xs text-sb-muted mt-0.5">
                      Standard library reference, architecture manuals, and API specifications.
                    </p>
                  </div>
                  <a
                    href={skill.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white shadow-xs hover:brightness-105 shrink-0"
                  >
                    <ExternalLink size={13} /> Open Official Docs
                  </a>
                </div>
              </div>

              {/* Career Roles Section */}
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-xs">
                <h4 className="font-bold text-sm text-[#171717] dark:text-white mb-2">
                  Target Career Roles & Applications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skill.careerRelevance.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MINI-PROJECTS */}
          {activeTab === "projects" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="mb-2">
                <h3 className="font-bold text-lg text-[#171717] dark:text-white">
                  Practical Hands-on Projects
                </h3>
                <p className="text-xs text-sb-muted">
                  Consolidate theoretical knowledge by building concrete, portfolio-ready applications.
                </p>
              </div>

              {skill.projects.map((project) => {
                const isDone = completedProjectIds.includes(project.id);
                return (
                  <div
                    key={project.id}
                    className={`rounded-2xl border p-5 transition-all shadow-xs ${
                      isDone
                        ? "bg-emerald-500/[0.04] border-emerald-500/25"
                        : "bg-white dark:bg-white/[0.02] border-black/[0.08] dark:border-white/10 hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              project.difficulty === "Beginner"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : project.difficulty === "Intermediate"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            }`}
                          >
                            {project.difficulty}
                          </span>
                          <h4 className="text-base font-bold text-[#171717] dark:text-white">
                            {project.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[#525252] dark:text-sb-muted leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleProject(skill.id, project.id, !isDone)}
                        className={`btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-black/[0.04] dark:bg-white/10 hover:bg-[#FF6A00] hover:text-white text-[#171717] dark:text-white"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {isDone ? "Project Completed ✓" : "Mark Project Done"}
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-xs text-sb-muted">Key Deliverables:</span>
                        <ul className="list-disc list-inside text-xs text-[#525252] dark:text-sb-muted space-y-0.5">
                          {project.deliverables.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-1.5 self-end">
                        <span className="text-[11px] text-sb-muted">Stack:</span>
                        {project.recommendedTech.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/5 text-[11px] font-semibold text-[#171717] dark:text-white"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: QUIZ */}
          {activeTab === "quiz" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#171717] dark:text-white">
                    Knowledge Assessment Checkpoint
                  </h3>
                  <p className="text-xs text-sb-muted">
                    Test your understanding of core concepts in {skill.name}.
                  </p>
                </div>
                {progress?.quizScore !== undefined && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20">
                    Previous Score: {progress.quizScore}%
                  </span>
                )}
              </div>

              {skill.quiz.map((q, qIndex) => {
                const userSelected = selectedAnswers[q.id];
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-[#FF6A00] dark:text-sb-cyan">
                        Q{qIndex + 1}.
                      </span>
                      <h4 className="font-bold text-sm text-[#171717] dark:text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="space-y-2 mt-2">
                      {q.options.map((option, optIdx) => {
                        const isThisSelected = userSelected === optIdx;
                        let optionStyle =
                          "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/10 hover:border-orange-500/40 text-[#171717] dark:text-white";

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                          } else if (isThisSelected && !isCorrect) {
                            optionStyle = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300";
                          } else {
                            optionStyle = "opacity-40 border-transparent";
                          }
                        } else if (isThisSelected) {
                          optionStyle = "bg-orange-500/10 border-[#FF6A00] text-[#FF6A00] dark:bg-sb-cyan/15 dark:border-sb-cyan dark:text-sb-cyan font-bold";
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-2.5 p-3 rounded-xl bg-orange-500/[0.05] dark:bg-white/[0.02] border border-orange-500/20 text-xs text-[#525252] dark:text-sb-muted">
                        <span className="font-bold text-[#FF6A00] dark:text-sb-cyan">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4">
                {quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="btn-bounce-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-black/[0.08] dark:border-white/10 text-sb-muted hover:text-[#171717] dark:hover:text-white cursor-pointer"
                  >
                    <RotateCcw size={13} /> Retake Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Object.keys(selectedAnswers).length < skill.quiz.length}
                    onClick={handleQuizSubmit}
                    className="btn-bounce-sm inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-sm hover:brightness-105 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Submit Quiz & Record Score
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Skill Level Addition Modal */}
        {showProfileModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150">
            <div className="w-full max-w-md rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#181D24] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-[#171717] dark:text-white flex items-center gap-2">
                  <Award size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
                  Add to SkillBridge Profile
                </h4>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-sb-muted hover:text-[#171717] dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[#525252] dark:text-sb-muted">
                Select your current self-assessed proficiency level for{" "}
                <span className="font-bold text-[#171717] dark:text-white">{skill.name}</span> to display on your verified recruiter resume.
              </p>

              <div className="space-y-2">
                {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedProficiency(lvl)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedProficiency === lvl
                        ? "bg-orange-500/10 border-[#FF6A00] text-[#FF6A00] dark:bg-sb-cyan/15 dark:border-sb-cyan dark:text-sb-cyan"
                        : "border-black/[0.06] dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/5 text-[#171717] dark:text-white"
                    }`}
                  >
                    <span>{lvl}</span>
                    {selectedProficiency === lvl && <Check size={14} />}
                  </button>
                ))}
              </div>

              {profileSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} /> Successfully synced to your student profile!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sb-muted hover:text-[#171717] dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={profileSaving || profileSuccess}
                  onClick={handleAddSkill}
                  className="btn-bounce-sm px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer"
                >
                  {profileSaving ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Interactive Video Player Modal */}
      {compactLecture && (
        <CompactVideoPlayer
          lecture={compactLecture}
          onClose={() => setCompactLecture(null)}
          hasPrevious={currentLessonIndex > 0}
          hasNext={currentLessonIndex < skill.lessons.length - 1}
          onPrevious={() => {
            if (currentLessonIndex > 0) {
              openCompactPlayerForLesson(skill.lessons[currentLessonIndex - 1]);
            }
          }}
          onNext={() => {
            if (currentLessonIndex < skill.lessons.length - 1) {
              openCompactPlayerForLesson(skill.lessons[currentLessonIndex + 1]);
            }
          }}
          onToggleComplete={() => {
            if (compactLecture.lessonId) {
              onToggleLesson(
                skill.id,
                compactLecture.lessonId,
                !completedLessonIds.includes(compactLecture.lessonId)
              );
              setCompactLecture((prev) =>
                prev ? { ...prev, isCompleted: !prev.isCompleted } : null
              );
            }
          }}
        />
      )}
    </div>
  );
}
