"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Clock,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Video,
  Code2,
  ChevronRight,
  ExternalLink,
  Play,
  Sliders,
  Check,
  Briefcase,
} from "lucide-react";
import type { PersonalizedLearningPath, LearningPhase } from "@/lib/student/personalized-path-types";
import type { StudentData } from "@/lib/student/types";
import PersonalizedLearningAssistant from "./PersonalizedLearningAssistant";
import CompactVideoPlayer, { CompactLectureData } from "./CompactVideoPlayer";
import { TechIcon3D } from "../ui/tech-icons";

interface Props {
  path: PersonalizedLearningPath;
  student: StudentData;
  onBackToCatalog: () => void;
  onOpenWizard: () => void;
  onOpenSkillModal: (skillId: string) => void;
  onUpdatePath: (updatedPath: PersonalizedLearningPath) => void;
}

export default function PersonalizedPathDashboard({
  path,
  student,
  onBackToCatalog,
  onOpenWizard,
  onOpenSkillModal,
  onUpdatePath,
}: Props) {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isUpdatingHours, setIsUpdatingHours] = useState(false);
  const [newWeeklyHours, setNewWeeklyHours] = useState(path.weeklyHoursTarget);
  const [activeLecture, setActiveLecture] = useState<CompactLectureData | null>(null);
  const [activeLectureIndex, setActiveLectureIndex] = useState<number>(0);

  const studentName = student.user?.name || path.studentName || "Scholar";
  const activePhase: LearningPhase = path.phases[activePhaseIndex] || path.phases[0];

  // Action handlers
  const handleToggleSkipSkill = async (skillId: string, currentStatus: string) => {
    const action = currentStatus === "skipped" ? "accept_skill" : "skip_skill";
    try {
      const res = await fetch("/api/student/learning-path", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, skillId }),
      });
      const data = await res.json();
      if (data?.data?.path) {
        onUpdatePath(data.data.path);
      }
    } catch (e) {
      console.error("Failed to toggle skill skip status:", e);
    }
  };

  const handleToggleProject = async (projectId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch("/api/student/learning-path", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_project",
          projectId,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();
      if (data?.data?.path) {
        onUpdatePath(data.data.path);
      }
    } catch (e) {
      console.error("Failed to toggle project status:", e);
    }
  };

  const handleSaveWeeklyHours = async () => {
    try {
      const res = await fetch("/api/student/learning-path", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_weekly_hours",
          weeklyHours: newWeeklyHours,
        }),
      });
      const data = await res.json();
      if (data?.data?.path) {
        onUpdatePath(data.data.path);
        setIsUpdatingHours(false);
      }
    } catch (e) {
      console.error("Failed to update weekly hours:", e);
    }
  };

  const targetDateFormatted = new Date(path.progress.targetCompletionDate).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className="space-y-8 select-none">
      {/* ============================================================== */}
      {/* 1. TOP NAVIGATION & PERSONALIZED GREETING BANNER */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs font-bold text-sb-muted hover:text-[#FF6A00] dark:hover:text-sb-cyan transition cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to All Skills Catalog</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUpdatingHours(!isUpdatingHours)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition cursor-pointer"
          >
            <Sliders size={13} />
            <span>Pacing ({path.weeklyHoursTarget}h/wk)</span>
          </button>

          <button
            type="button"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-orange-500/25 dark:border-sb-cyan/25 bg-orange-50/50 dark:bg-sb-cyan/10 text-xs font-bold text-[#FF6A00] dark:text-sb-cyan hover:bg-orange-500/15 transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Regenerate Path</span>
          </button>
        </div>
      </div>

      {/* Inline Pacing Slider Drawer */}
      {isUpdatingHours && (
        <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/90 dark:bg-[#12151E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
              Adjust Weekly Learning Hours
            </h4>
            <p className="text-[11px] text-sb-muted">
              Dynamically recalculates phase targets and estimated graduation dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={newWeeklyHours}
              onChange={(e) => setNewWeeklyHours(Number(e.target.value))}
              className="w-32 accent-[#FF6A00] dark:accent-sb-cyan cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white min-w-16">
              {newWeeklyHours} hrs/wk
            </span>
            <button
              type="button"
              onClick={handleSaveWeeklyHours}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#FF6A00] dark:bg-sb-cyan dark:text-[#0C0F14] hover:opacity-95 transition cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Main Roadmap Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 dark:border-white/[0.08] bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#FFF4EA] dark:from-[#131722] dark:via-[#0F131C] dark:to-[#0A0D14] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow duration-300">
        {/* Glows (GPU-Accelerated) */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 dark:from-sb-cyan/20 dark:to-sb-blue/20 blur-3xl animate-[gsPulseSlow_6s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20 shadow-2xs">
              <Sparkles size={12} className="animate-pulse" />
              <span>Personalized Career Journey</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white tracking-tight">
              Welcome back, {studentName}!
            </h1>

            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Target Track:{" "}
              <span className="text-[#FF6A00] dark:text-sb-cyan font-extrabold">{path.targetRole}</span>
            </p>

            <p className="text-xs sm:text-sm text-sb-muted leading-relaxed">
              3–6 Month Objective:{" "}
              <strong className="text-neutral-800 dark:text-neutral-200">
                &ldquo;{path.targetGoal3to6m}&rdquo;
              </strong>
            </p>

            <p className="text-xs text-sb-muted/90 italic pt-1">
              {path.academicContextSummary}
            </p>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                <Target size={13} className="text-[#FF6A00] dark:text-sb-cyan" /> Progress
              </span>
              <div className="mt-1 text-xl font-extrabold text-[#171717] dark:text-white">
                {path.progress.overallPercentage}%
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                <Clock size={13} className="text-amber-500" /> Weekly Target
              </span>
              <div className="mt-1 text-xl font-extrabold text-[#171717] dark:text-white">
                {path.weeklyHoursTarget} <span className="text-xs font-normal text-sb-muted">hrs</span>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                <CheckCircle2 size={13} className="text-emerald-500" /> Skills Ready
              </span>
              <div className="mt-1 text-xl font-extrabold text-[#171717] dark:text-white">
                {path.progress.completedSkills} / {path.progress.totalSkills}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                <Calendar size={13} className="text-blue-500" /> Target Date
              </span>
              <div className="mt-1 text-xs font-extrabold text-[#171717] dark:text-white leading-tight">
                {targetDateFormatted}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. NEXT ACTIONABLE STEP HERO CARD */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-orange-500/30 dark:border-sb-cyan/35 bg-gradient-to-r from-orange-500/12 via-amber-500/8 to-transparent dark:from-sb-cyan/15 dark:via-sb-blue/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-sm transition-all duration-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF6A00] dark:text-sb-cyan">
            <Play size={12} fill="currentColor" />
            <span>Next Recommended Step</span>
            <span>•</span>
            <span className="normal-case">{path.nextRecommendedAction.phaseTitle}</span>
          </div>
          <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
            {path.nextRecommendedAction.title} ({path.nextRecommendedAction.skillName})
          </h3>
          <p className="text-xs text-sb-muted max-w-xl">
            {path.nextRecommendedAction.reason} (~{path.nextRecommendedAction.estimatedMinutes} mins)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (path.nextRecommendedAction.skillId) {
              onOpenSkillModal(path.nextRecommendedAction.skillId);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-md hover:shadow-orange-500/25 dark:hover:shadow-sb-cyan/25 active:scale-[0.98] transition-all duration-180 cursor-pointer shrink-0"
        >
          <span>Start Now</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. SKILL GAP ASSESSMENT ACCORDION */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
            <Layers size={17} className="text-[#FF6A00] dark:text-sb-cyan" />
            Skill Gap Assessment
            <span className="text-xs font-normal text-sb-muted">
              (Evaluated against verified student profile)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {path.skillGaps.map((gap) => {
            const isMastered = gap.currentStatus === "Mastered";
            const isInProgress = gap.currentStatus === "In Progress";
            const isPrereq = gap.currentStatus === "Prerequisite";

            return (
              <div
                key={gap.skillName}
                className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                      {gap.skillName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isMastered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : isInProgress
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : isPrereq
                          ? "bg-orange-500/10 text-[#FF6A00] dark:text-sb-cyan"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {gap.currentStatus}
                      {gap.currentLevel ? ` (${gap.currentLevel})` : ""}
                    </span>
                  </div>

                  <p className="text-[11px] text-sb-muted leading-relaxed line-clamp-3">
                    {gap.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-sb-muted font-mono">{gap.category}</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Target: {gap.targetLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 5-PHASE INTERACTIVE ROADMAP VIEW */}
      {/* ============================================================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Briefcase size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
              5-Phase Progressive Learning Roadmap
            </h2>
            <p className="text-xs text-sb-muted">
              Step-by-step phases advancing from foundational prerequisites to production capstones.
            </p>
          </div>
        </div>

        {/* Phase Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {path.phases.map((phase, idx) => {
            const isSelected = activePhaseIndex === idx;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setActivePhaseIndex(idx)}
                className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all duration-180 flex items-center gap-2.5 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? "border-orange-500/40 dark:border-sb-cyan/40 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/10 dark:from-sb-cyan/20 dark:to-sb-blue/20 text-[#FF6A00] dark:text-sb-cyan shadow-xs"
                    : "border-black/[0.06] dark:border-white/10 bg-white dark:bg-[#11151E] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-orange-500/30 dark:hover:border-sb-cyan/30"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${
                    isSelected
                      ? "bg-[#FF6A00] dark:bg-sb-cyan text-white dark:text-[#090C12] shadow-2xs"
                      : "bg-black/[0.06] dark:bg-white/10 text-sb-muted"
                  }`}
                >
                  {phase.phaseNumber}
                </span>
                <span>{phase.title.replace(/^Phase \d+ — /, "")}</span>
              </button>
            );
          })}
        </div>

        {/* Active Phase Details Container */}
        <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#11151F] backdrop-blur-xl p-6 sm:p-8 space-y-7 shadow-xs">
          {/* Phase Header */}
          <div className="space-y-2 border-b border-black/[0.06] dark:border-white/10 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF6A00] dark:text-sb-cyan">
                  {activePhase.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {activePhase.subtitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300">
                  <Clock size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                  ~{activePhase.estimatedHours} hrs ({activePhase.estimatedWeeks} wks)
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-sb-muted leading-relaxed">
              {activePhase.description}
            </p>
          </div>

          {/* Section A: Recommended Skills */}
          {activePhase.skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1.5">
                <Code2 size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
                Recommended Skills ({activePhase.skills.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePhase.skills.map((skill) => {
                  const isSkipped = skill.status === "skipped";

                  return (
                    <div
                      key={skill.skillId}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                        isSkipped
                          ? "border-black/[0.04] dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01] opacity-60"
                          : "border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <TechIcon3D nameOrId={skill.skillId || skill.name} size="sm" />
                            <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                              {skill.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
                            {skill.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-sb-muted leading-relaxed">
                          {skill.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-black/[0.05] dark:border-white/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSkipSkill(skill.skillId, skill.status)}
                          className="text-[11px] font-semibold text-sb-muted hover:text-black dark:hover:text-white transition cursor-pointer"
                        >
                          {isSkipped ? "Restore Skill" : "Skip"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenSkillModal(skill.skillId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] dark:from-sb-cyan dark:to-sb-blue dark:text-[#0C0F14] hover:opacity-95 transition cursor-pointer"
                        >
                          <span>Open Learning Modal</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section B: Recommended Video Lectures */}
          {activePhase.videos.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1.5">
                  <Video size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
                  Recommended Video Lectures ({activePhase.videos.length})
                </h4>
                <span className="text-[11px] font-semibold text-sb-muted">
                  Compact Interactive Player Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePhase.videos.map((vid, idx) => {
                  const isIndian =
                    vid.isIndianCreator ??
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
                    ].some((c) =>
                      vid.instructorOrChannel.toLowerCase().includes(c.toLowerCase())
                    );

                  return (
                    <div
                      key={vid.id}
                      className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] flex flex-col justify-between gap-3 hover:border-orange-500/30 dark:hover:border-sb-cyan/30 transition-all duration-200"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-sb-blue flex items-center gap-1">
                            <Play size={10} fill="currentColor" /> {vid.instructorOrChannel}
                          </span>
                          {isIndian && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              <span>🇮🇳</span> Indian Educator
                            </span>
                          )}
                          {vid.language && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/[0.04] dark:bg-white/5 text-neutral-600 dark:text-neutral-400">
                              {vid.language}
                            </span>
                          )}
                          <span className="text-[10px] text-sb-muted font-medium ml-auto">
                            {vid.durationMinutes} mins
                          </span>
                        </div>

                        <h5 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-snug">
                          {vid.title}
                        </h5>
                        <p className="text-[11px] text-sb-muted line-clamp-2 leading-relaxed">
                          {vid.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/5">
                        <span className="text-[10px] text-sb-muted font-semibold">
                          Phase {activePhase.phaseNumber} Lecture
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveLectureIndex(idx);
                            setActiveLecture({
                              videoUrl: vid.videoUrl,
                              youtubeUrl: vid.youtubeUrl,
                              title: vid.title,
                              instructor: vid.instructorOrChannel,
                              courseOrSkillName: path.targetRole,
                              lessonOrPhaseTitle: `Phase ${activePhase.phaseNumber} • Lecture ${idx + 1}`,
                              durationMinutes: vid.durationMinutes,
                              language: vid.language || "Hindi",
                              isIndianCreator: isIndian,
                              isPlaylist: vid.isPlaylist ?? true,
                              playlistTitle: vid.playlistTitle,
                              summary: vid.summary,
                            });
                          }}
                          className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
                        >
                          <Play size={11} fill="currentColor" />
                          <span>View Lecture</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section C: Verified Courses & Certifications */}
          {activePhase.coursesAndCerts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                Verified Courses & Recognized Certifications ({activePhase.coursesAndCerts.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePhase.coursesAndCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {cert.pricing}
                        </span>
                        <span className="text-[10px] font-semibold text-sb-muted">
                          {cert.credentialType}
                        </span>
                      </div>

                      <h5 className="font-extrabold text-xs text-neutral-900 dark:text-white">
                        {cert.title}
                      </h5>

                      <p className="text-[11px] text-sb-muted font-medium">
                        Provider: {cert.provider}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {cert.skillsCovered.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[10px] bg-black/[0.03] dark:bg-white/[0.05] text-sb-muted"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Explicit Disclaimer Required by Prompt */}
                      <p className="text-[10px] text-sb-muted/80 italic pt-1">
                        ⚠️ {cert.disclaimer}
                      </p>
                    </div>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-black/[0.08] dark:border-white/10 hover:border-[#FF6A00] dark:hover:border-sb-cyan text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
                    >
                      <span>View Course & Curriculum</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section D: Practical Projects */}
          {activePhase.projects.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1.5">
                <Code2 size={14} className="text-emerald-500" />
                Practical Projects & Deliverables ({activePhase.projects.length})
              </h4>

              <div className="space-y-3">
                {activePhase.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                          {proj.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {proj.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-sb-muted leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                          Expected Deliverables:
                        </span>
                        <ul className="text-[11px] text-sb-muted list-disc list-inside space-y-0.5">
                          {proj.deliverables.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.recommendedTech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10px] bg-black/[0.04] dark:bg-white/[0.06] font-mono text-neutral-700 dark:text-neutral-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleProject(proj.id, proj.completed)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                        proj.completed
                          ? "bg-emerald-500 text-white"
                          : "border border-black/[0.08] dark:border-white/10 hover:border-emerald-500 text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      <Check size={14} />
                      <span>{proj.completed ? "Completed" : "Mark as Complete"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. CONTEXTUAL LEARNING ASSISTANT EMBED */}
      {/* ============================================================== */}
      <section className="pt-2">
        <PersonalizedLearningAssistant
          path={path}
          onOpenSkillModal={onOpenSkillModal}
        />
      </section>

      {/* Compact Interactive Video Player Floating Modal */}
      {activeLecture && (
        <CompactVideoPlayer
          lecture={activeLecture}
          onClose={() => setActiveLecture(null)}
          hasPrevious={activeLectureIndex > 0}
          hasNext={activeLectureIndex < activePhase.videos.length - 1}
          onPrevious={() => {
            if (activeLectureIndex > 0) {
              const prevIdx = activeLectureIndex - 1;
              const prevVid = activePhase.videos[prevIdx];
              setActiveLectureIndex(prevIdx);
              setActiveLecture({
                videoUrl: prevVid.videoUrl,
                youtubeUrl: prevVid.youtubeUrl,
                title: prevVid.title,
                instructor: prevVid.instructorOrChannel,
                courseOrSkillName: path.targetRole,
                lessonOrPhaseTitle: `Phase ${activePhase.phaseNumber} • Lecture ${prevIdx + 1}`,
                durationMinutes: prevVid.durationMinutes,
                language: prevVid.language || "Hindi",
                isIndianCreator: prevVid.isIndianCreator ?? true,
                isPlaylist: prevVid.isPlaylist ?? true,
                playlistTitle: prevVid.playlistTitle,
                summary: prevVid.summary,
              });
            }
          }}
          onNext={() => {
            if (activeLectureIndex < activePhase.videos.length - 1) {
              const nextIdx = activeLectureIndex + 1;
              const nextVid = activePhase.videos[nextIdx];
              setActiveLectureIndex(nextIdx);
              setActiveLecture({
                videoUrl: nextVid.videoUrl,
                youtubeUrl: nextVid.youtubeUrl,
                title: nextVid.title,
                instructor: nextVid.instructorOrChannel,
                courseOrSkillName: path.targetRole,
                lessonOrPhaseTitle: `Phase ${activePhase.phaseNumber} • Lecture ${nextIdx + 1}`,
                durationMinutes: nextVid.durationMinutes,
                language: nextVid.language || "Hindi",
                isIndianCreator: nextVid.isIndianCreator ?? true,
                isPlaylist: nextVid.isPlaylist ?? true,
                playlistTitle: nextVid.playlistTitle,
                summary: nextVid.summary,
              });
            }
          }}
        />
      )}
    </div>
  );
}
