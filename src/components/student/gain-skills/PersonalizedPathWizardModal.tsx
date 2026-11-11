"use client";

import { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  Cpu,
  Globe,
  Cloud,
  Database,
  Smartphone,
  Shield,
  GraduationCap,
  Award,
} from "lucide-react";
import { CAREER_TRACKS } from "@/lib/student/recommendation-engine";
import type { CareerTrackId, PathGenerationInput, PersonalizedLearningPath } from "@/lib/student/personalized-path-types";
import type { StudentData } from "@/lib/student/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData;
  onPathGenerated: (path: PersonalizedLearningPath) => void;
}

const TRACK_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cpu,
  Globe,
  Cloud,
  Database,
  Smartphone,
  Shield,
};

const GOAL_PRESETS = [
  "Build production-grade projects & secure an engineering internship",
  "Transition into deep tech / AI systems engineering",
  "Master full-stack SaaS architecture with modern microservices",
  "Prepare for industry certifications & system design interviews",
];

const WEEKLY_HOURS_OPTIONS = [
  { hours: 5, label: "5 hrs / week", desc: "Steady & casual", pace: "Paced" },
  { hours: 10, label: "10 hrs / week", desc: "Balanced standard", pace: "Recommended" },
  { hours: 15, label: "15 hrs / week", desc: "Accelerated growth", pace: "Fast Track" },
  { hours: 20, label: "20 hrs / week", desc: "Deep immersion", pace: "Intensive" },
];

export default function PersonalizedPathWizardModal({
  isOpen,
  onClose,
  student,
  onPathGenerated,
}: Props) {
  // Wizard steps: 1 = Career Track, 2 = 3-6 Month Goal & Level, 3 = Weekly Commitment
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Pre-fill initial track if matched with student preferences or headline
  const defaultTrackId = useMemo<CareerTrackId>(() => {
    const roles = student.profile?.preferences?.roles || [];
    const headline = (student.profile?.headline || "").toLowerCase();
    if (roles.some((r) => /ai|machine learning/i.test(r)) || /ai/i.test(headline)) {
      return "ai-ml-specialist";
    }
    if (roles.some((r) => /cloud|devops/i.test(r))) {
      return "cloud-devops-engineer";
    }
    return "fullstack-architect";
  }, [student.profile?.preferences?.roles, student.profile?.headline]);

  const [selectedTrack, setSelectedTrack] = useState<CareerTrackId>(defaultTrackId);
  const [selectedGoal, setSelectedGoal] = useState<string>(GOAL_PRESETS[0]);
  const [customGoal, setCustomGoal] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);

  // Generating loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratingStep(1);

    // Generation stage visual feedback
    const timer1 = setTimeout(() => setGeneratingStep(2), 350);
    const timer2 = setTimeout(() => setGeneratingStep(3), 700);
    const timer3 = setTimeout(() => setGeneratingStep(4), 1050);

    const inputPayload: PathGenerationInput = {
      targetTrackId: selectedTrack,
      targetGoal3to6m: customGoal.trim() || selectedGoal,
      weeklyHours,
      selfAssessedLevel: selectedLevel,
    };

    try {
      const res = await fetch("/api/student/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          input: inputPayload,
        }),
      });

      const json = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (json?.data?.path) {
        onPathGenerated(json.data.path);
        onClose();
      }
    } catch (e) {
      console.error("Failed to generate personalized path:", e);
    } finally {
      setIsGenerating(false);
      setGeneratingStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#12151D] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Student Profile Context */}
        <div className="relative p-6 border-b border-black/[0.06] dark:border-white/10 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 dark:from-[#151922] dark:via-[#12151D] dark:to-[#171B26]">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
                <Sparkles size={12} />
                <span>Personalized Path Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] dark:text-white">
                {isGenerating ? "Crafting Your Custom Path..." : "Build Your Personalized Learning Path"}
              </h2>
            </div>
            {!isGenerating && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-sb-muted hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Known Profile Acknowledgment (Never Ask What Is Already Known) */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-sb-muted">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Detected from profile:
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/10 font-medium">
              <GraduationCap size={12} className="text-[#FF6A00] dark:text-sb-cyan" />
              {student.profile?.degree || "B.Tech"} • {student.profile?.branch || "Computer Science"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/10 font-medium">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {student.skills?.length || 0} Existing Skills
            </span>
            {student.certifications?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/10 font-medium">
                <Award size={12} className="text-amber-500" />
                {student.certifications[0].title}
              </span>
            )}
          </div>

          {/* Stepper Dots */}
          {!isGenerating && (
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  currentStep >= 1 ? "bg-[#FF6A00] dark:bg-sb-cyan" : "bg-black/10 dark:bg-white/10"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  currentStep >= 2 ? "bg-[#FF6A00] dark:bg-sb-cyan" : "bg-black/10 dark:bg-white/10"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  currentStep >= 3 ? "bg-[#FF6A00] dark:bg-sb-cyan" : "bg-black/10 dark:bg-white/10"
                }`}
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-orange-500/20 dark:border-sb-cyan/20 border-t-[#FF6A00] dark:border-t-sb-cyan animate-spin" />
                <Sparkles
                  size={20}
                  className="absolute inset-0 m-auto text-[#FF6A00] dark:text-sb-cyan animate-pulse"
                />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {generatingStep === 1 && "Analyzing academic background & verified profile skills..."}
                  {generatingStep === 2 && "Evaluating skill gaps against industry track requirements..."}
                  {generatingStep === 3 && "Curating playable video lectures & legitimate certificates..."}
                  {generatingStep >= 4 && "Finalizing 5-phase progressive milestone timeline..."}
                </h3>
                <p className="text-xs text-sb-muted">
                  SkillBridge is structuring a customized learning journey tailored to your background.
                </p>
              </div>

              <div className="w-64 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6A00] to-amber-500 dark:from-sb-cyan dark:to-sb-blue transition-all duration-300"
                  style={{ width: `${Math.min(100, generatingStep * 25)}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: CAREER TRACK */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#171717] dark:text-white">
                      1. Select Your Target Career Direction
                    </h3>
                    <p className="text-xs text-sb-muted">
                      We will map your existing skills against the competencies demanded by companies hiring for this role.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAREER_TRACKS.map((track) => {
                      const IconComponent = TRACK_ICON_MAP[track.iconName] || Globe;
                      const isSelected = selectedTrack === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => setSelectedTrack(track.id)}
                          className={`relative p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? "border-[#FF6A00] dark:border-sb-cyan bg-orange-50/30 dark:bg-sb-cyan/10 ring-2 ring-orange-500/20 dark:ring-sb-cyan/20"
                              : "border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className="p-2 rounded-xl text-white shadow-xs"
                                style={{ backgroundColor: track.accentColor }}
                              >
                                <IconComponent size={18} />
                              </span>
                              {isSelected && (
                                <CheckCircle2 size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-[#171717] dark:text-white">
                                {track.title}
                              </h4>
                              <p className="text-[11px] text-sb-muted line-clamp-2 mt-0.5">
                                {track.tagline}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-black/[0.05] dark:border-white/10 flex items-center justify-between text-[11px]">
                            <span className="text-sb-muted font-medium">Avg Industry Salary</span>
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                              {track.averageIndustrySalary}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: 3-6 MONTH GOAL & LEVEL */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#171717] dark:text-white">
                      2. What is your primary objective for the next 3–6 months?
                    </h3>
                    <p className="text-xs text-sb-muted">
                      Setting a specific target helps the recommendation engine prioritize hands-on projects vs certifications.
                    </p>
                  </div>

                  {/* Goal Presets */}
                  <div className="space-y-2">
                    {GOAL_PRESETS.map((preset) => (
                      <div
                        key={preset}
                        onClick={() => {
                          setSelectedGoal(preset);
                          setCustomGoal("");
                        }}
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                          selectedGoal === preset && !customGoal
                            ? "border-[#FF6A00] dark:border-sb-cyan bg-orange-50/30 dark:bg-sb-cyan/10 text-neutral-900 dark:text-white font-semibold"
                            : "border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Target size={14} className="text-[#FF6A00] dark:text-sb-cyan shrink-0" />
                          {preset}
                        </span>
                        {selectedGoal === preset && !customGoal && (
                          <CheckCircle2 size={16} className="text-[#FF6A00] dark:text-sb-cyan shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Custom Objective Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Or write your own custom milestone:
                    </label>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g., Build an autonomous coding agent SaaS and publish on GitHub"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs text-neutral-900 dark:text-white placeholder:text-sb-muted focus:outline-none focus:ring-2 focus:ring-[#FF6A00] dark:focus:ring-sb-cyan"
                    />
                  </div>

                  {/* Self-Assessed Comfort Level */}
                  <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      How would you describe your overall development comfort in this domain?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            selectedLevel === lvl
                              ? "border-[#FF6A00] dark:border-sb-cyan bg-orange-50/40 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan"
                              : "border-black/[0.08] dark:border-white/10 text-sb-muted hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: WEEKLY TIME COMMITMENT */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#171717] dark:text-white">
                      3. How much time can you dedicate each week?
                    </h3>
                    <p className="text-xs text-sb-muted">
                      We calculate phase durations and estimated completion dates dynamically based on your available study hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {WEEKLY_HOURS_OPTIONS.map((opt) => {
                      const isSelected = weeklyHours === opt.hours;
                      return (
                        <div
                          key={opt.hours}
                          onClick={() => setWeeklyHours(opt.hours)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#FF6A00] dark:border-sb-cyan bg-orange-50/30 dark:bg-sb-cyan/10 ring-2 ring-orange-500/20 dark:ring-sb-cyan/20"
                              : "border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#171717] dark:text-white">
                              <Clock size={15} className="text-[#FF6A00] dark:text-sb-cyan" />
                              {opt.label}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-sb-muted">
                              {opt.pace}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-sb-muted">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl border border-orange-500/20 dark:border-sb-cyan/20 bg-orange-50/40 dark:bg-sb-cyan/5 text-xs space-y-1.5">
                    <div className="font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#FF6A00] dark:text-sb-cyan" />
                      Ready to build your roadmap
                    </div>
                    <p className="text-sb-muted leading-relaxed">
                      At {weeklyHours} hours per week, your 5-phase path will span approximately{" "}
                      <strong className="text-neutral-900 dark:text-white">
                        {Math.ceil(180 / weeklyHours)} weeks
                      </strong>
                      , complete with verified videos, hands-on projects, and recognized certificates.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isGenerating && (
          <div className="p-4 sm:p-6 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#10131A]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-sb-muted hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-sb-muted hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s + 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-md hover:shadow-orange-500/25 dark:hover:shadow-sb-cyan/25 active:scale-[0.98] transition-all duration-180 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-lg hover:shadow-orange-500/30 dark:hover:shadow-sb-cyan/30 active:scale-[0.98] transition-all duration-180 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Generate My Path</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
