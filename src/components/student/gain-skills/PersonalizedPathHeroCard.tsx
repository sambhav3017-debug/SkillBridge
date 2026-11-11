"use client";

import { Sparkles, ArrowRight, Compass, CheckCircle2, Award, Briefcase, GraduationCap } from "lucide-react";
import type { PersonalizedLearningPath } from "@/lib/student/personalized-path-types";
import type { StudentData } from "@/lib/student/types";

interface Props {
  student: StudentData;
  personalizedPath: PersonalizedLearningPath | null;
  onOpenWizard: () => void;
  onViewPath: () => void;
}

export default function PersonalizedPathHeroCard({
  student,
  personalizedPath,
  onOpenWizard,
  onViewPath,
}: Props) {
  const degree = student.profile?.degree || "B.Tech";
  const branch = student.profile?.branch || "Computer Science";
  const year = student.profile?.year ? `${student.profile.year}` : "4th Year";
  const skillsCount = student.skills?.length || 0;
  const certsCount = student.certifications?.length || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 dark:border-white/[0.08] bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FFF1E8] dark:from-[#131722] dark:via-[#0F131C] dark:to-[#0A0D14] p-6 sm:p-8 lg:p-9 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Dynamic Specular Ambient Glows (GPU-Accelerated) */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400/20 via-amber-400/15 to-transparent dark:from-sb-cyan/20 dark:via-sb-blue/15 blur-3xl animate-[gsPulseSlow_6s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-1/4 -bottom-20 h-64 w-64 rounded-full bg-orange-300/15 dark:bg-purple-600/10 blur-3xl" />
      {/* Top Inner Specular Highlight Rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/10 text-[#FF6A00] dark:from-sb-cyan/15 dark:to-sb-blue/15 dark:text-sb-cyan border border-orange-500/25 dark:border-sb-cyan/25 shadow-2xs">
            <Sparkles size={13} className="text-[#FF6A00] dark:text-sb-cyan animate-pulse" />
            <span>AI-Driven Career Guidance</span>
            {personalizedPath && (
              <span className="flex items-center gap-1.5 pl-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border-l border-orange-500/20 dark:border-sb-cyan/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active Path Ready
              </span>
            )}
          </div>

          {/* Prominent Headline Required by Spec */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] dark:text-white tracking-tight leading-tight">
            Your Career. Your Skills.{" "}
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-300 dark:to-sb-blue bg-clip-text text-transparent">
              Your Personalized Learning Path.
            </span>
          </h2>

          {/* Supporting Message Required by Spec */}
          <p className="text-xs sm:text-sm md:text-base text-[#525252] dark:text-sb-muted leading-relaxed font-normal">
            Let SkillBridge understand your goals and create a learning journey tailored to your ambitions, current skills, and career interests.
          </p>

          {/* Student Profile Context Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 shadow-2xs backdrop-blur-md">
              <GraduationCap size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
              {degree} {branch ? `• ${branch}` : ""} ({year})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 shadow-2xs backdrop-blur-md">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              {skillsCount} Profile Skills
            </span>
            {certsCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 shadow-2xs backdrop-blur-md">
                <Award size={13} className="text-amber-500" />
                {certsCount} {certsCount === 1 ? "Certification" : "Certifications"}
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {personalizedPath ? (
              <>
                <button
                  type="button"
                  onClick={onViewPath}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-lg hover:shadow-orange-500/25 dark:hover:shadow-sb-cyan/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Compass size={16} />
                  <span>View My Learning Path</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={onOpenWizard}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-[#525252] dark:text-sb-muted bg-white/90 dark:bg-white/[0.05] hover:bg-orange-500/10 dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/10 hover:border-orange-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  Regenerate Path
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenWizard}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-sb-cyan/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Build My Personalized Path</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Visual Roadmap Simulation Graphic */}
        <div className="w-full lg:w-96 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-[#11151F]/90 p-5 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
              {personalizedPath ? personalizedPath.targetRole : "Recommended Track Roadmap"}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
              5 Phases
            </span>
          </div>

          {/* 5 Phased Visual Steps */}
          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500/40 before:via-amber-500/30 before:to-emerald-500/40 dark:before:from-sb-cyan/40 dark:before:to-emerald-400/40">
            <div className="relative flex items-center justify-between text-xs">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#11141C] bg-[#FF6A00] dark:bg-sb-cyan shadow-xs" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">1. Foundation</span>
              <span className="text-[10px] text-sb-muted font-mono">Prerequisites</span>
            </div>
            <div className="relative flex items-center justify-between text-xs">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#11141C] bg-amber-500 dark:bg-sb-blue shadow-xs" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">2. Core Skills</span>
              <span className="text-[10px] text-sb-muted font-mono">Domain Mastery</span>
            </div>
            <div className="relative flex items-center justify-between text-xs">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#11141C] bg-orange-400 dark:bg-purple-400 shadow-xs" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">3. Apply Knowledge</span>
              <span className="text-[10px] text-sb-muted font-mono">Real Projects</span>
            </div>
            <div className="relative flex items-center justify-between text-xs">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#11141C] bg-indigo-500 dark:bg-indigo-400 shadow-xs" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">4. Validate Skills</span>
              <span className="text-[10px] text-sb-muted font-mono">Certs & Quizzes</span>
            </div>
            <div className="relative flex items-center justify-between text-xs">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#11141C] bg-emerald-500 shadow-xs" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">5. Career Ready</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Portfolio</span>
            </div>
          </div>

          {personalizedPath ? (
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sb-muted font-medium">Path Completion</span>
                <span className="font-extrabold text-[#FF6A00] dark:text-sb-cyan">
                  {personalizedPath.progress.overallPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-amber-500 dark:from-sb-cyan dark:to-sb-blue transition-all duration-500"
                  style={{ width: `${personalizedPath.progress.overallPercentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between text-[11px] text-sb-muted">
              <span>Tailored to your background</span>
              <span className="font-medium text-[#FF6A00] dark:text-sb-cyan">30-second setup</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
