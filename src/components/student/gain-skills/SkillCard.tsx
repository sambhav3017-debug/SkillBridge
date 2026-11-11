"use client";

import { useMemo, useRef, useCallback } from "react";
import { Clock, BookOpen, CheckCircle2, ArrowRight, Play, Award } from "lucide-react";
import type { SkillDefinition, StudentSkillProgress } from "@/lib/student/skills-types";
import { TechIcon3D } from "../ui/tech-icons";

interface SkillCardProps {
  skill: SkillDefinition;
  progress?: StudentSkillProgress;
  isProfileSkill?: boolean;
  onSelect: (skill: SkillDefinition) => void;
  onEnroll?: (skill: SkillDefinition) => void;
}

export default function SkillCard({
  skill,
  progress,
  isProfileSkill = false,
  onSelect,
  onEnroll,
}: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const completedLessons = progress?.completedLessonIds.length ?? 0;
  const totalLessons = skill.lessons.length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isEnrolled = !!progress;
  const isCompleted = progress?.status === "Completed" || (percent === 100 && totalLessons > 0);

  const difficultyColor = useMemo(() => {
    switch (skill.difficulty) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      case "Intermediate":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      case "Advanced":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25";
      default:
        return "bg-orange-500/10 text-[#FF6A00] border-orange-500/25";
    }
  }, [skill.difficulty]);

  // Ultra-efficient pointer-responsive ambient light without re-renders
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
      }
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(skill)}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col justify-between rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#11151E] p-5 shadow-xs hover:shadow-xl hover:shadow-orange-500/[0.09] dark:hover:shadow-sb-cyan/[0.12] hover:border-orange-500/40 dark:hover:border-sb-cyan/40 hover:-translate-y-1.5 active:scale-[0.985] transition-all duration-200 cursor-pointer select-none overflow-hidden"
    >
      {/* Pointer-Follow Ambient Spotlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: "var(--gs-glow-ambient)",
        }}
      />

      {/* Top Specular Rim Lighting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

      <div className="relative z-10">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <TechIcon3D nameOrId={skill.id || skill.name} size="md" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-sb-muted truncate">
                {skill.category}
              </span>
              <h3 className="text-base font-extrabold text-[#171717] dark:text-white group-hover:text-[#FF6A00] dark:group-hover:text-sb-cyan transition-colors leading-tight truncate">
                {skill.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${difficultyColor}`}
            >
              {skill.difficulty}
            </span>
            {isProfileSkill && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#FF6A00] dark:text-sb-cyan bg-orange-500/10 dark:bg-sb-cyan/15 border border-orange-500/20 dark:border-sb-cyan/30 px-1.5 py-0.2 rounded-md shadow-2xs">
                <Award size={10} /> In Profile
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#525252] dark:text-sb-muted line-clamp-2 leading-relaxed mb-4 font-normal">
          {skill.description}
        </p>

        {/* Skill Metrics */}
        <div className="flex items-center gap-3.5 text-[11px] font-medium text-sb-muted mb-4">
          <span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
            <Clock size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{skill.estimatedHours}h</span> estimated
          </span>
          <span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
            <BookOpen size={13} className="text-[#FF9F1C] dark:text-sb-blue" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{totalLessons}</span> lessons
          </span>
        </div>
      </div>

      {/* Footer / Progress Bar / CTA */}
      <div className="relative z-10 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
        {isEnrolled ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-xs text-[#171717] dark:text-white flex items-center gap-1">
                {isCompleted ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                ) : (
                  <span className="text-[#FF6A00] dark:text-sb-cyan flex items-center gap-1 font-bold">
                    <Play size={11} fill="currentColor" /> {percent}% Completed
                  </span>
                )}
              </span>
              <span className="text-[11px] text-sb-muted font-mono font-medium">
                {completedLessons}/{totalLessons}
              </span>
            </div>
            {/* Progress Track with Smooth Hardware Animation */}
            <div className="h-2 w-full bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isCompleted
                    ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                    : "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] dark:from-sb-cyan dark:to-sb-blue shadow-xs shadow-orange-500/30"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-bold text-sb-muted group-hover:text-[#FF6A00] dark:group-hover:text-sb-cyan transition-colors">
            {onEnroll ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll(skill);
                }}
                className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-2xs hover:shadow-orange-500/25 dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] transition-all"
              >
                Enroll in Course
              </button>
            ) : (
              <span className="flex items-center gap-1">
                Explore Roadmap
              </span>
            )}
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-orange-500/10 dark:group-hover:bg-sb-cyan/15 transition-colors">
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
