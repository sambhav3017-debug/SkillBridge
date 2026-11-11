"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { SkillDefinition } from "@/lib/student/skills-types";

interface Props {
  skill: SkillDefinition;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (skillId: string, weeklyHours: number) => Promise<void>;
}

export default function EnrollmentConfirmModal({
  skill,
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const firstLesson = skill.lessons?.[0];
  const isIndian =
    firstLesson?.isIndianCreator ??
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
    ].some((c) => (firstLesson?.instructor || "").toLowerCase().includes(c.toLowerCase()));

  const handleEnroll = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(skill.id, weeklyHours);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enrollment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#12151D] shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close enrollment modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20 flex items-center gap-1">
            <Sparkles size={11} /> Course Enrollment
          </span>
          <span className="text-xs text-sb-muted font-medium">•</span>
          <span className="text-xs text-sb-muted font-medium">{skill.category}</span>
        </div>

        {/* Course Title */}
        <h3
          id="enrollment-title"
          className="text-xl sm:text-2xl font-black text-[#171717] dark:text-white"
        >
          Enroll in {skill.name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-sb-muted leading-relaxed">
          {skill.description}
        </p>

        {/* Course Highlights Matrix */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/5">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
              <Layers size={10} /> Difficulty
            </span>
            <p className="text-xs font-extrabold text-[#171717] dark:text-white">
              {skill.difficulty}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} /> Duration
            </span>
            <p className="text-xs font-extrabold text-[#171717] dark:text-white">
              ~{skill.estimatedHours} Hours
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
              <BookOpen size={10} /> Curriculum
            </span>
            <p className="text-xs font-extrabold text-[#171717] dark:text-white">
              {skill.lessons.length} Lessons
            </p>
          </div>
        </div>

        {/* Primary Educator & Learning Roadmap Preview */}
        {firstLesson && (
          <div className="mt-4 p-3 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-orange-500/[0.03] dark:bg-sb-cyan/[0.04] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan shrink-0">
                <Play size={14} fill="currentColor" />
              </span>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-sb-muted">
                  Featured Educational Content
                </span>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold text-[#171717] dark:text-white">
                    {firstLesson.instructor || "SkillBridge Faculty"}
                  </h4>
                  {isIndian && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      🇮🇳 Indian Educator
                    </span>
                  )}
                  {firstLesson.language && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                      {firstLesson.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-sb-muted shrink-0">
              {firstLesson.durationMinutes}m intro
            </span>
          </div>
        )}

        {/* Smart Daily Learning Planner Integration Notice */}
        <div className="mt-4 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#171717] dark:text-white">
            <Calendar size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
            <span>Smart Daily Learning Planner</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-sb-muted leading-relaxed">
            Upon enrollment, SkillBridge will automatically break this course into sequential daily learning units, schedule Day 1 tasks on your Student Dashboard, and automatically assign next-day topics as you complete lessons.
          </p>

          {/* Weekly Commitment Selector */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Weekly Target Availability:
            </span>
            <div className="flex items-center gap-1">
              {[5, 8, 12, 15].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setWeeklyHours(hrs)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    weeklyHours === hrs
                      ? "bg-[#FF6A00] text-white dark:bg-sb-cyan dark:text-[#090C12]"
                      : "bg-black/[0.04] dark:bg-white/5 text-sb-muted hover:text-black dark:hover:text-white"
                  }`}
                >
                  {hrs}h/wk
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-sb-muted hover:text-[#171717] dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleEnroll}
            disabled={isSubmitting}
            className="btn-bounce-sm inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Enrolling & Scheduling...</span>
            ) : (
              <>
                <span>Confirm Enrollment</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
