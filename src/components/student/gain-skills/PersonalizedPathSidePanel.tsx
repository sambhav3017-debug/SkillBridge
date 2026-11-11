"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  X,
  Sparkles,
  Search,
  Check,
  CheckCircle2,
  GraduationCap,
  Award,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Video,
  FileCode2,
  BookOpen,
  Sliders,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { SKILLS_CATALOG } from "@/lib/student/skills-catalog";
import SearchInput from "@/components/ui/SearchInput";
import type {
  PersonalizedLearningPath,
  PathGenerationInput,
} from "@/lib/student/personalized-path-types";
import type { StudentData } from "@/lib/student/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData;
  activePath: PersonalizedLearningPath | null;
  onPathAccepted: (newPath: PersonalizedLearningPath) => void;
}

const RESOURCE_TYPES = [
  { id: "video", label: "Video lectures", icon: Video },
  { id: "courses", label: "Structured online courses", icon: BookOpen },
  { id: "docs", label: "Official documentation", icon: ExternalLink },
  { id: "exercises", label: "Hands-on practical exercises", icon: FileCode2 },
  { id: "projects", label: "Real-world projects", icon: Layers },
  { id: "quizzes", label: "Quizzes and assessments", icon: HelpCircle },
  { id: "certs", label: "Certification-oriented learning", icon: Award },
];

const VIDEO_PREFERENCES = [
  "Short videos (<15 mins)",
  "Detailed lectures (30–60 mins)",
  "Complete video courses",
  "Beginner-friendly tutorials",
  "Practical coding tutorials",
];

const TARGET_TIMELINES = [
  { id: 1, label: "1 Month", sub: "Intensive" },
  { id: 3, label: "3 Months", sub: "Recommended" },
  { id: 6, label: "6 Months", sub: "Comprehensive" },
];

const LEARNING_PACES = ["Accelerated", "Steady", "Relaxed"] as const;

export default function PersonalizedPathSidePanel({
  isOpen,
  onClose,
  student,
  activePath,
  onPathAccepted,
}: Props) {
  // Pre-seed profile skills into initial state
  const initialProfileSkills = useMemo(() => {
    return (student.skills || []).map((s) => s.name).slice(0, 4);
  }, [student.skills]);

  // Form State
  const [searchSkillQuery, setSearchSkillQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialProfileSkills);
  const [selectedLevel, setSelectedLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [selectedResources, setSelectedResources] = useState<string[]>([
    "video",
    "exercises",
    "projects",
    "certs",
  ]);
  const [selectedVideoPrefs, setSelectedVideoPrefs] = useState<string[]>([
    "Practical coding tutorials",
    "Detailed lectures (30–60 mins)",
  ]);
  const [weeklyHours, setWeeklyHours] = useState<number>(activePath?.weeklyHoursTarget || 12);
  const [targetDurationMonths, setTargetDurationMonths] = useState<number>(3);
  const [learningPace, setLearningPace] = useState<"Accelerated" | "Steady" | "Relaxed">("Steady");
  const [personalGoal, setPersonalGoal] = useState<string>(
    activePath?.targetGoal3to6m ||
      "I want to master in-demand production technologies to prepare for top engineering roles."
  );

  // Generation & Review State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPreview, setGeneratedPreview] = useState<PersonalizedLearningPath | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll body to top when switching between customization form and preview
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [generatedPreview]);

  // Close handler declared before effects
  const handleClose = useCallback(() => {
    onClose();
    setGeneratedPreview(null);
    setGenerationError(null);
  }, [onClose]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isGenerating) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isGenerating, handleClose]);

  // Filter skills for picker
  const filteredCatalogSkills = useMemo(() => {
    const q = searchSkillQuery.toLowerCase().trim();
    if (!q) {
      return SKILLS_CATALOG.slice(0, 18);
    }
    return SKILLS_CATALOG.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [searchSkillQuery]);

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleToggleResource = (id: string) => {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleToggleVideoPref = (pref: string) => {
    setSelectedVideoPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Generate Path API Call
  const handleGeneratePath = async () => {
    if (selectedSkills.length === 0) {
      setGenerationError("Please select at least one skill or course topic you wish to learn.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep(1);

    const timer1 = setTimeout(() => setGenerationStep(2), 350);
    const timer2 = setTimeout(() => setGenerationStep(3), 700);

    const payload: PathGenerationInput = {
      selectedSkills,
      selfAssessedLevel: selectedLevel,
      preferredResourceTypes: selectedResources,
      videoPreferences: selectedVideoPrefs,
      weeklyHours,
      targetDurationMonths,
      learningPace,
      targetGoal3to6m: personalGoal.trim() || undefined,
    };

    try {
      const res = await fetch("/api/student/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          input: payload,
        }),
      });

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (data?.data?.path) {
        setGeneratedPreview(data.data.path);
      } else {
        setGenerationError(data?.error || "Failed to generate customized path. Please try again.");
      }
    } catch (err) {
      console.error("Path generation failed:", err);
      setGenerationError("A network error occurred while generating your path. Please retry.");
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // Final Accept & Persist Path
  const handleAcceptPath = async () => {
    if (!generatedPreview) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/student/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          input: {
            selectedSkills,
            selfAssessedLevel: selectedLevel,
            preferredResourceTypes: selectedResources,
            videoPreferences: selectedVideoPrefs,
            weeklyHours,
            targetDurationMonths,
            learningPace,
            targetGoal3to6m: personalGoal.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (data?.data?.path) {
        onPathAccepted(data.data.path);
        handleClose();
      } else {
        setGenerationError(data?.error || "Could not save your path. Please try again.");
      }
    } catch (err) {
      console.error("Save path error:", err);
      setGenerationError("Failed to persist path. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Build Your Personalized Learning Path"
    >
      {/* Subtle Backdrop - Closes on click without closing when clicking inside panel */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-[2px] transition-opacity duration-240 ease-out cursor-pointer"
      />

      {/* Compact Side Panel Container (400-480px width) with Hardware Enter Animation */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="animate-gs-sidepanel-enter relative z-10 w-full sm:w-[460px] md:w-[480px] max-w-full h-full max-h-screen bg-white/95 dark:bg-[#0E121B]/95 backdrop-blur-2xl border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="flex-none p-5 sm:p-6 border-b border-black/[0.06] dark:border-white/10 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 dark:from-[#141824] dark:via-[#0E121B] dark:to-[#121622] relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/25 dark:border-sb-cyan/25 shadow-2xs">
                <Sparkles size={12} className="animate-pulse" />
                <span>Contextual Path Customizer</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#171717] dark:text-white tracking-tight">
                Build Your Personalized Learning Path
              </h2>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isGenerating}
              className="p-2 rounded-xl text-sb-muted hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Close side panel"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-2 text-xs text-[#525252] dark:text-sb-muted leading-relaxed font-normal">
            Choose what you want to learn, select your level, and let SkillBridge create a learning journey tailored to your goals.
          </p>

          {/* Smart Profile Context Badges */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 font-semibold shadow-2xs">
              <GraduationCap size={12} className="text-[#FF6A00] dark:text-sb-cyan" />
              {student.profile?.degree || "B.Tech"} ({student.profile?.branch || "CS"})
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 font-semibold shadow-2xs">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {student.skills?.length || 0} Profile Skills
            </span>
            {student.certifications?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-white/[0.05] border border-orange-500/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 font-semibold shadow-2xs">
                <Award size={12} className="text-amber-500" />
                {student.certifications[0].title.slice(0, 16)}...
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* GENERATED PATH PREVIEW STATE */}
          {generatedPreview ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Roadmap Ready For Review
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {generatedPreview.targetRole}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedPreview(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-white/90 dark:bg-white/10 hover:bg-black/5 transition border border-black/10 dark:border-white/10 cursor-pointer"
                >
                  Edit Preferences
                </button>
              </div>

              {/* Target & Timeline Metric Pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
                  <span className="text-[11px] font-semibold text-sb-muted flex items-center gap-1">
                    <Clock size={12} className="text-[#FF6A00] dark:text-sb-cyan" /> Weekly Pacing
                  </span>
                  <div className="mt-1 text-base font-extrabold text-neutral-900 dark:text-white">
                    {generatedPreview.weeklyHoursTarget} hrs/week
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
                  <span className="text-[11px] font-semibold text-sb-muted flex items-center gap-1">
                    <Calendar size={12} className="text-blue-500" /> Target Timeline
                  </span>
                  <div className="mt-1 text-base font-extrabold text-neutral-900 dark:text-white">
                    ~{Math.ceil(180 / generatedPreview.weeklyHoursTarget)} weeks
                  </div>
                </div>
              </div>

              {/* 5-Phases Preview */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1.5">
                  <Layers size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                  5-Phase Progressive Plan
                </h4>

                <div className="space-y-2">
                  {generatedPreview.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="p-3 rounded-xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan font-extrabold flex items-center justify-center text-[10px]">
                          {phase.phaseNumber}
                        </span>
                        <div>
                          <div className="font-extrabold text-neutral-900 dark:text-white">
                            {phase.title.replace(/^Phase \d+ — /, "")}
                          </div>
                          <div className="text-[11px] text-sb-muted line-clamp-1">
                            {phase.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-sb-muted shrink-0">
                        {phase.skills.length} skills
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Immediate Action */}
              <div className="p-4 rounded-2xl border border-orange-500/25 dark:border-sb-cyan/25 bg-orange-500/5 dark:bg-sb-cyan/10 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6A00] dark:text-sb-cyan">
                  Phase 1 Next Step
                </span>
                <div className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  {generatedPreview.nextRecommendedAction.title}
                </div>
                <p className="text-[11px] text-sb-muted">
                  {generatedPreview.nextRecommendedAction.reason}
                </p>
              </div>

              {activePath && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                  Note: Accepting will replace your current path with this customized plan.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* CUSTOMIZATION FORM */}

              {/* A. WHAT DO YOU WANT TO LEARN? */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#171717] dark:text-white flex items-center gap-1.5">
                    <span>A. What do you want to learn?</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-sb-muted">
                    {selectedSkills.length} selected
                  </span>
                </div>

                {/* Skill Search Bar */}
                <div>
                  <SearchInput
                    value={searchSkillQuery}
                    onChange={setSearchSkillQuery}
                    placeholder="Search Python, React, AWS, Docker, AI..."
                    portalVariant="student"
                    sizeVariant="sm"
                  />
                </div>

                {/* Selected Skills Chips */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-orange-50/50 dark:bg-white/[0.03] border border-orange-500/15 dark:border-white/10">
                    {selectedSkills.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#FF6A00] dark:bg-sb-cyan text-white dark:text-[#090C12] shadow-2xs"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSkill(name)}
                          className="hover:opacity-75 transition cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Catalog Skills Grid Pills */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {filteredCatalogSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.name);
                    const isFromProfile = student.skills?.some(
                      (s) => s.name.toLowerCase() === skill.name.toLowerCase()
                    );
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleToggleSkill(skill.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-orange-500/15 dark:bg-sb-cyan/20 text-[#FF6A00] dark:text-sb-cyan border-orange-500/35 dark:border-sb-cyan/40 font-extrabold shadow-2xs"
                            : "bg-white dark:bg-white/[0.03] border-black/[0.08] dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-orange-500/30 dark:hover:border-sb-cyan/30"
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : null}
                        <span>{skill.name}</span>
                        {isFromProfile && (
                          <span className="text-[9px] px-1 rounded bg-black/5 dark:bg-white/10 text-sb-muted font-normal">
                            Profile
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. SELECT YOUR LEARNING LEVEL */}
              <div className="space-y-2.5 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <label className="text-xs font-extrabold text-[#171717] dark:text-white">
                  B. Select your learning level
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        level: "Beginner",
                        label: "Beginner",
                        desc: "Start from fundamentals",
                      },
                      {
                        level: "Intermediate",
                        label: "Intermediate",
                        desc: "Build on knowledge",
                      },
                      {
                        level: "Advanced",
                        label: "Advanced",
                        desc: "Production deep dive",
                      },
                    ] as const
                  ).map((item) => {
                    const active = selectedLevel === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setSelectedLevel(item.level)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-180 cursor-pointer active:scale-98 ${
                          active
                            ? "border-orange-500/40 dark:border-sb-cyan/40 bg-gradient-to-br from-orange-500/15 to-amber-500/10 dark:from-sb-cyan/20 dark:to-sb-blue/20 shadow-xs"
                            : "border-black/[0.07] dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-extrabold ${
                              active
                                ? "text-[#FF6A00] dark:text-sb-cyan"
                                : "text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {item.label}
                          </span>
                          {active && (
                            <span className="h-4 w-4 rounded-full bg-[#FF6A00] dark:bg-sb-cyan text-white dark:text-[#090C12] flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-sb-muted leading-tight font-normal">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* C. PREFERRED LEARNING RESOURCES */}
              <div className="space-y-2.5 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#171717] dark:text-white">
                    C. What learning resources do you prefer?
                  </label>
                  <span className="text-[10px] text-sb-muted">Multi-select</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOURCE_TYPES.map((res) => {
                    const Icon = res.icon;
                    const active = selectedResources.includes(res.id);
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleToggleResource(res.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-150 cursor-pointer active:scale-98 ${
                          active
                            ? "border-orange-500/35 dark:border-sb-cyan/35 bg-orange-500/10 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan font-bold shadow-2xs"
                            : "border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-black/20 dark:hover:border-white/20"
                        }`}
                      >
                        <Icon size={14} className={active ? "text-[#FF6A00] dark:text-sb-cyan" : "text-sb-muted"} />
                        <span className="text-xs flex-1 truncate">{res.label}</span>
                        {active && <Check size={12} strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* D. VIDEO RECOMMENDATIONS PREFERENCE */}
              <div className="space-y-2.5 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#171717] dark:text-white flex items-center gap-1.5">
                    <Video size={13} className="text-blue-500" />
                    <span>D. Video learning style preference</span>
                  </label>
                  <span className="text-[10px] text-sb-muted">Multi-select</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {VIDEO_PREFERENCES.map((pref) => {
                    const active = selectedVideoPrefs.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => handleToggleVideoPref(pref)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer active:scale-95 ${
                          active
                            ? "bg-blue-500/15 dark:bg-sb-blue/20 text-blue-600 dark:text-sb-blue border-blue-500/35 font-bold shadow-2xs"
                            : "bg-white dark:bg-white/[0.02] border-black/[0.06] dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/20 dark:hover:border-white/20"
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* E. LEARNING DURATION & WEEKLY TIME */}
              <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <label className="text-xs font-extrabold text-[#171717] dark:text-white flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                  <span>E. Duration, Availability & Pace</span>
                </label>

                {/* Weekly Hours Slider */}
                <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-sb-muted">Weekly Commitment:</span>
                    <span className="font-extrabold font-mono text-[#FF6A00] dark:text-sb-cyan text-sm">
                      {weeklyHours} hrs/week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-[#FF6A00] dark:accent-sb-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-sb-muted font-mono">
                    <span>5 hrs (Casual)</span>
                    <span>15 hrs (Balanced)</span>
                    <span>40 hrs (Full-time)</span>
                  </div>
                </div>

                {/* Target Duration Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {TARGET_TIMELINES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetDurationMonths(t.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        targetDurationMonths === t.id
                          ? "border-[#FF6A00] dark:border-sb-cyan bg-orange-500/10 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan font-bold"
                          : "border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.02] text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <div className="text-xs font-extrabold">{t.label}</div>
                      <div className="text-[10px] opacity-75">{t.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Learning Pace Switcher */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-sb-muted">Preferred Pace:</span>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10">
                    {LEARNING_PACES.map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => setLearningPace(pace)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          learningPace === pace
                            ? "bg-white dark:bg-[#151924] text-[#FF6A00] dark:text-sb-cyan shadow-2xs border border-black/[0.05] dark:border-white/[0.08]"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* F. PERSONAL LEARNING GOAL */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <label className="text-xs font-extrabold text-[#171717] dark:text-white">
                  F. Personal learning goal (Optional)
                </label>
                <textarea
                  value={personalGoal}
                  onChange={(e) => setPersonalGoal(e.target.value)}
                  rows={2}
                  placeholder="e.g., I want to learn Python and Machine Learning to prepare for an AI internship."
                  className="w-full p-3 rounded-xl text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#11151E] text-neutral-900 dark:text-white placeholder:text-sb-muted focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-sb-cyan/20 focus:border-orange-500 dark:focus:border-sb-cyan transition-all resize-none"
                />
              </div>

              {/* Error Message Display */}
              {generationError && (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Fixed Action Footer */}
        <div className="flex-none p-4 sm:p-5 border-t border-black/[0.08] dark:border-white/10 bg-white/95 dark:bg-[#0E121B]/95 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg">
          {generatedPreview ? (
            <>
              <button
                type="button"
                onClick={() => setGeneratedPreview(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-sb-muted hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleAcceptPath}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Saving Path...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Accept & Start Learning Path</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-sb-muted hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGeneratePath}
                disabled={isGenerating || selectedSkills.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7800] to-[#E55A00] dark:from-sb-cyan dark:via-cyan-400 dark:to-sb-blue dark:text-[#090C12] hover:shadow-lg hover:shadow-orange-500/25 dark:hover:shadow-sb-cyan/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-180 cursor-pointer shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>
                      {generationStep === 1
                        ? "Analyzing skills..."
                        : generationStep === 2
                        ? "Curating videos..."
                        : "Building timeline..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate My Learning Path</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
