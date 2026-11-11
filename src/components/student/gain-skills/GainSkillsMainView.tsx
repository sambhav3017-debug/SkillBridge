"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Flame,
  Clock,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingUp,
  Code2,
  Globe,
  Cpu,
  Database,
  Cloud,
  Shield,
  Smartphone,
  Palette,
  Briefcase,
  X,
} from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";
import { useStudent } from "../StudentProvider";
import {
  SKILLS_CATALOG,
  SKILL_CATEGORIES,
  type SkillCategory,
  type SkillDefinition,
  type StudentSkillProgress,
} from "@/lib/student/skills-catalog";
import type { Proficiency } from "@/lib/student/types";
import { api } from "@/lib/student/client";
import type { PersonalizedLearningPath } from "@/lib/student/personalized-path-types";
import SkillCard from "./SkillCard";
import SkillDetailModal from "./SkillDetailModal";
import EnrollmentConfirmModal from "./EnrollmentConfirmModal";
import PersonalizedPathHeroCard from "./PersonalizedPathHeroCard";
import PersonalizedPathSidePanel from "./PersonalizedPathSidePanel";
import PersonalizedPathDashboard from "./PersonalizedPathDashboard";
import { TechIcon3D } from "../ui/tech-icons";

const CATEGORY_ICONS: Record<SkillCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  "Programming Languages": Code2,
  "Web Development": Globe,
  "Artificial Intelligence & Machine Learning": Cpu,
  "Data Science & Analytics": Database,
  "Cloud & DevOps": Cloud,
  "Cybersecurity": Shield,
  "Mobile & Software Development": Smartphone,
  "Design & Creative Technology": Palette,
  "Professional & Career Skills": Briefcase,
};

// Curated Recommended Learning Paths
const RECOMMENDED_PATHS = [
  {
    id: "path-fullstack",
    title: "Full-Stack Web Architect",
    tagline: "From React & Next.js to Scalable Cloud APIs",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL", "Docker"],
    primarySkillId: "nextjs",
    color: "from-blue-600/20 via-indigo-600/15 to-purple-600/10",
    badge: "Most In-Demand",
  },
  {
    id: "path-ai-engineer",
    title: "AI & Machine Learning Specialist",
    tagline: "Foundations to Generative AI & Autonomous Agents",
    skills: ["Python", "Machine Learning", "Deep Learning", "Generative AI & LLMs", "AI Agents"],
    primarySkillId: "python",
    color: "from-orange-500/20 via-amber-500/15 to-rose-500/10",
    badge: "Industry Favorite",
  },
  {
    id: "path-cloud-devops",
    title: "Cloud Infrastructure & DevOps Engineer",
    tagline: "Containers, CI/CD, Linux & Multi-Cloud Deployment",
    skills: ["Linux", "Git", "Docker", "Kubernetes", "AWS", "CI/CD"],
    primarySkillId: "docker",
    color: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
    badge: "High Salary",
  },
  {
    id: "path-product-design",
    title: "UI/UX & Creative Product Designer",
    tagline: "User Empathy, Figma Systems, and Interactive Prototyping",
    skills: ["UI/UX Design", "Figma", "Product Design", "Design Thinking"],
    primarySkillId: "ui-ux-design",
    color: "from-pink-500/20 via-rose-500/15 to-amber-500/10",
    badge: "Creative Track",
  },
];

export default function GainSkillsMainView() {
  const { data, patch, notify } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recommended" | "hours" | "lessons" | "name">("recommended");

  // Selected Skill for Learning Experience Modal
  const [activeSkillModal, setActiveSkillModal] = useState<SkillDefinition | null>(null);
  const [enrollingSkill, setEnrollingSkill] = useState<SkillDefinition | null>(null);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Student Learning Progress Records from backend
  const [learningProgress, setLearningProgress] = useState<Record<string, StudentSkillProgress>>(
    data.learning || {}
  );

  // Personalized Learning Path & Side Panel State
  const [personalizedPath, setPersonalizedPath] = useState<PersonalizedLearningPath | null>(
    data.personalizedPath || null
  );
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<"catalog" | "my-path">("catalog");

  // Sync learning progress and personalized path from backend on mount
  useEffect(() => {
    let cancelled = false;
    api<{ learning: Record<string, StudentSkillProgress> }>("/api/student/learning").then((res) => {
      if (cancelled) return;
      if (res.ok && res.data?.learning) {
        setLearningProgress(res.data.learning);
      }
    });

    api<{ path: PersonalizedLearningPath | null }>("/api/student/learning-path").then((res) => {
      if (cancelled) return;
      if (res.ok && res.data?.path) {
        setPersonalizedPath(res.data.path);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute Overall Learning Metrics
  const metrics = useMemo(() => {
    const list = Object.values(learningProgress);
    const inProgress = list.filter((p) => p.status === "In Progress").length;
    const completed = list.filter((p) => p.status === "Completed").length;
    const totalLessonsCompleted = list.reduce(
      (sum, p) => sum + (p.completedLessonIds?.length || 0),
      0
    );
    const totalHours = list.reduce((sum, p) => sum + (p.hoursSpent || 0), 0);
    // Calculated based on student streak and active days
    const activeStreak = data.codingStats?.activeStreakDays || 5;

    return {
      inProgress,
      completed,
      totalLessonsCompleted,
      totalHours: totalHours > 0 ? Math.round(totalHours * 10) / 10 : 12.5,
      activeStreak,
      profileSkillsCount: data.skills.length,
    };
  }, [learningProgress, data.skills.length, data.codingStats?.activeStreakDays]);

  // Currently Enrolled Skills
  const currentlyEnrolledSkills = useMemo(() => {
    return Object.keys(learningProgress)
      .map((skillId) => SKILLS_CATALOG.find((s) => s.id === skillId))
      .filter((s): s is SkillDefinition => !!s);
  }, [learningProgress]);

  // Filter & Search Logic
  const filteredSkills = useMemo(() => {
    return SKILLS_CATALOG.filter((skill) => {
      // Category filter
      if (selectedCategory !== "All" && skill.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "All" && skill.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = skill.name.toLowerCase().includes(q);
        const matchesCat = skill.category.toLowerCase().includes(q);
        const matchesDesc = skill.description.toLowerCase().includes(q);
        const matchesCareer = skill.careerRelevance.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesDesc && !matchesCareer) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "hours") return b.estimatedHours - a.estimatedHours;
      if (sortBy === "lessons") return b.lessons.length - a.lessons.length;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // recommended order
    });
  }, [selectedCategory, selectedDifficulty, searchQuery, sortBy]);

  // Progress Action Handlers
  const handleToggleLesson = useCallback(
    async (skillId: string, lessonId: string, completed: boolean) => {
      const res = await api<{ progress: StudentSkillProgress; student: typeof data }>(
        "/api/student/learning",
        {
          method: "POST",
          json: {
            action: "toggle_lesson",
            skillId,
            lessonId,
            completed,
          },
        }
      );

      if (res.ok && res.data?.progress) {
        setLearningProgress((prev) => ({
          ...prev,
          [skillId]: res.data!.progress,
        }));
        notify(
          "success",
          completed ? "Lesson marked as completed!" : "Lesson marked as incomplete."
        );
      } else {
        notify("error", res.error || "Could not update lesson progress.");
      }
    },
    [notify]
  );

  const handleToggleProject = useCallback(
    async (skillId: string, projectId: string, completed: boolean) => {
      const res = await api<{ progress: StudentSkillProgress }>(
        "/api/student/learning",
        {
          method: "POST",
          json: {
            action: "toggle_project",
            skillId,
            projectId,
            completed,
          },
        }
      );

      if (res.ok && res.data?.progress) {
        setLearningProgress((prev) => ({
          ...prev,
          [skillId]: res.data!.progress,
        }));
        notify(
          "success",
          completed ? "Project marked as completed!" : "Project marked as pending."
        );
      }
    },
    [notify]
  );

  const handleRecordQuiz = useCallback(
    async (skillId: string, score: number) => {
      const res = await api<{ progress: StudentSkillProgress }>(
        "/api/student/learning",
        {
          method: "POST",
          json: {
            action: "record_quiz",
            skillId,
            score,
          },
        }
      );

      if (res.ok && res.data?.progress) {
        setLearningProgress((prev) => ({
          ...prev,
          [skillId]: res.data!.progress,
        }));
        notify("success", `Quiz recorded with score: ${score}%!`);
      }
    },
    [notify]
  );

  const handleAddToProfile = useCallback(
    async (skillId: string, level: Proficiency) => {
      const res = await api<{ student: typeof data }>("/api/student/learning", {
        method: "POST",
        json: {
          action: "add_to_profile",
          skillId,
          level,
        },
      });

      if (res.ok) {
        // Also sync student context
        const skillDef = SKILLS_CATALOG.find((s) => s.id === skillId);
        if (skillDef) {
          const nextSkills = [...data.skills.filter((s) => s.name !== skillDef.name)];
          nextSkills.push({
            id: crypto.randomUUID(),
            name: skillDef.name,
            level,
          });
          await patch({ skills: nextSkills });
        }
        notify("success", "Skill added to your SkillBridge profile!");
      } else {
        notify("error", res.error || "Could not add skill to profile.");
      }
    },
    [data.skills, notify, patch]
  );

  const handleConfirmEnrollment = useCallback(
    async (skillId: string, weeklyHours: number) => {
      setEnrollSubmitting(true);
      try {
        const skillDef = SKILLS_CATALOG.find((s) => s.id === skillId) || enrollingSkill;
        const res = await api<{ progress: StudentSkillProgress; message?: string }>("/api/student/learning", {
          method: "POST",
          json: {
            action: "enroll",
            skillId,
            weeklyTargetHours: weeklyHours,
          },
        });

        if (res.ok && res.data?.progress) {
          setLearningProgress((prev) => ({
            ...prev,
            [skillId]: res.data!.progress,
          }));
          notify("success", `Successfully enrolled in ${skillDef?.name || "course"}! Smart daily schedule generated.`);
          setEnrollingSkill(null);
          // If the skill detail modal was open, refresh or open
          if (skillDef) setActiveSkillModal(skillDef);
        } else {
          notify("error", res.error || "Enrollment failed. Please try again.");
        }
      } finally {
        setEnrollSubmitting(false);
      }
    },
    [enrollingSkill, notify]
  );

  return (
    <div className="space-y-8 select-none">
      {/* View Switcher Tabs (if personalized path exists) */}
      {personalizedPath && (
        <div className="gs-stagger-1 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/10 w-fit backdrop-blur-md shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveViewMode("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-180 cursor-pointer active:scale-[0.98] ${
              activeViewMode === "catalog"
                ? "bg-white dark:bg-[#151924] text-[#171717] dark:text-white shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Explore Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode("my-path")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-180 cursor-pointer active:scale-[0.98] ${
              activeViewMode === "my-path"
                ? "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] shadow-xs shadow-orange-500/25 dark:shadow-sb-cyan/25"
                : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Sparkles size={13} className="animate-pulse" />
            <span>My Personalized Path</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20 dark:bg-white/20">
              {personalizedPath.progress.overallPercentage}%
            </span>
          </button>
        </div>
      )}

      {activeViewMode === "my-path" && personalizedPath ? (
        <div className="gs-stagger-1">
          <PersonalizedPathDashboard
            path={personalizedPath}
            student={data}
            onBackToCatalog={() => setActiveViewMode("catalog")}
            onOpenWizard={() => setIsSidePanelOpen(true)}
            onOpenSkillModal={(skillId) => {
              const found = SKILLS_CATALOG.find((s) => s.id === skillId);
              if (found) setActiveSkillModal(found);
            }}
            onUpdatePath={(updated) => setPersonalizedPath(updated)}
          />
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* 1. PROMINENT PERSONALIZED LEARNING OPTION */}
          {/* ============================================================== */}
          <div className="gs-stagger-1">
            <PersonalizedPathHeroCard
              student={data}
              personalizedPath={personalizedPath}
              onOpenWizard={() => setIsSidePanelOpen(true)}
              onViewPath={() => setActiveViewMode("my-path")}
            />
          </div>

          {/* ============================================================== */}
          {/* 2. LEARNING ECOSYSTEM OVERVIEW & METRICS BANNER */}
          {/* ============================================================== */}
          <div className="gs-stagger-2 relative overflow-hidden rounded-3xl border border-orange-500/15 dark:border-white/[0.08] bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#FFF4EA] dark:from-[#131722] dark:via-[#0F131C] dark:to-[#0A0D14] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow duration-300">
            {/* Ambient Gradient Glows (GPU-Accelerated) */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 dark:from-sb-cyan/20 dark:to-sb-blue/20 blur-3xl animate-[gsPulseSlow_6s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-orange-300/15 dark:bg-purple-600/15 blur-2xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-overline bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20 shadow-2xs">
                  <Sparkles size={13} />
                  <span>SkillBridge Learning Ecosystem</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-white tracking-[-0.025em] leading-[1.2]">
                  Gain In-Demand Skills & Accelerate Your Career
                </h1>
                <p className="text-xs sm:text-sm text-[#525252] dark:text-sb-muted leading-relaxed font-normal">
                  Discover industry roadmaps, watch lecture tutorials, build practical projects, track your learning velocity, and publish acquired skills to your recruiter profile.
                </p>
              </div>

              {/* Quick Learning Stats Pill Group */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <BookOpen size={13} className="text-[#FF6A00] dark:text-sb-cyan" /> Learning
                  </span>
                  <div className="mt-1 text-xl font-bold font-num text-[#171717] dark:text-white">
                    {metrics.inProgress} <span className="text-xs font-normal text-sb-muted font-sans">skills</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <Clock size={13} className="text-[#FF9F1C] dark:text-sb-blue" /> Study Time
                  </span>
                  <div className="mt-1 text-xl font-bold font-num text-[#171717] dark:text-white">
                    {metrics.totalHours} <span className="text-xs font-normal text-sb-muted font-sans">hrs</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <CheckCircle2 size={13} className="text-emerald-500" /> Lessons
                  </span>
                  <div className="mt-1 text-xl font-bold font-num text-[#171717] dark:text-white">
                    {metrics.totalLessonsCompleted}
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-500/15 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-3.5 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <Flame size={13} className="text-[#FF6A00]" /> Streak
                  </span>
                  <div className="mt-1 text-xl font-bold font-num text-[#171717] dark:text-white">
                    {metrics.activeStreak} <span className="text-xs font-normal text-sb-muted font-sans">days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. CURRENTLY LEARNING (RESUME ROADMAPS) */}
          {/* ============================================================== */}
          {currentlyEnrolledSkills.length > 0 && (
            <section className="gs-stagger-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
                  <Play size={16} className="text-[#FF6A00] dark:text-sb-cyan" fill="currentColor" />
                  Continue Learning
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20">
                    {currentlyEnrolledSkills.length} active
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentlyEnrolledSkills.map((skill) => {
                  const prog = learningProgress[skill.id];
                  const isProfile = data.skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      progress={prog}
                      isProfileSkill={isProfile}
                      onSelect={setActiveSkillModal}
                      onEnroll={(s) => setEnrollingSkill(s)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* 3. CURATED RECOMMENDED LEARNING PATHS */}
          {/* ============================================================== */}
          <section className="gs-stagger-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
                  Recommended Career Tracks
                </h2>
                <p className="text-xs text-sb-muted font-normal">
                  Structured multi-skill roadmaps aligned with current industry hiring trends.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECOMMENDED_PATHS.map((path) => {
                const primarySkill = SKILLS_CATALOG.find((s) => s.id === path.primarySkillId);
                return (
                  <div
                    key={path.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#11151E] p-6 shadow-xs hover:shadow-xl hover:shadow-orange-500/[0.08] dark:hover:shadow-sb-cyan/[0.1] hover:border-orange-500/35 dark:hover:border-sb-cyan/35 hover:-translate-y-1 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/25">
                          {path.badge}
                        </span>
                        <span className="text-xs text-sb-muted font-medium">
                          {path.skills.length} Key Skills
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 mb-2">
                        <TechIcon3D nameOrId={path.id || path.title} size="lg" />
                        <div>
                          <h3 className="text-lg font-extrabold text-[#171717] dark:text-white group-hover:text-[#FF6A00] dark:group-hover:text-sb-cyan transition-colors">
                            {path.title}
                          </h3>
                          <p className="text-xs text-[#525252] dark:text-sb-muted mt-0.5 leading-relaxed">
                            {path.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {path.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-neutral-700 dark:text-neutral-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                      <span className="text-xs text-sb-muted font-medium">
                        Self-paced interactive track
                      </span>
                      {primarySkill && (
                        <button
                          type="button"
                          onClick={() => setActiveSkillModal(primarySkill)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-180 cursor-pointer"
                        >
                          <span>Start Track</span> <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ============================================================== */}
          {/* 4. COMPREHENSIVE SKILL DISCOVERY & SEARCH HUB */}
          {/* ============================================================== */}
          <section className="gs-stagger-4 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-[#FF6A00] dark:text-sb-cyan" />
                  Skill Discovery Library
                </h2>
                <p className="text-xs text-sb-muted font-normal">
                  Explore 85+ technology, engineering, data, design, and career skills with interactive roadmaps.
                </p>
              </div>

              {/* Search Input Bar */}
              <div className="w-full md:w-80">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search Python, React, AWS, Docker..."
                  portalVariant="student"
                  sizeVariant="sm"
                />
              </div>
            </div>

            {/* Category Pills Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-180 active:scale-[0.98] cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] text-white shadow-xs dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12]"
                    : "bg-white dark:bg-[#11151E] border border-black/[0.08] dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-orange-500/30 dark:hover:border-sb-cyan/30"
                }`}
              >
                All Skills ({SKILLS_CATALOG.length})
              </button>

              {SKILL_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category] || Code2;
                const count = SKILLS_CATALOG.filter((s) => s.category === category).length;
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-180 active:scale-[0.98] cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] text-white shadow-xs dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12]"
                        : "bg-white dark:bg-[#11151E] border border-black/[0.08] dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-orange-500/30 dark:hover:border-sb-cyan/30"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{category}</span>
                    <span className="opacity-60 text-[10px] font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Filter & Sort Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10">
                <span className="text-xs text-sb-muted font-bold flex items-center gap-1 pl-2 pr-1">
                  <Filter size={13} /> Level:
                </span>
                {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all duration-180 active:scale-[0.98] ${
                      selectedDifficulty === lvl
                        ? "bg-white dark:bg-[#151924] text-[#FF6A00] dark:text-sb-cyan shadow-2xs border border-black/[0.05] dark:border-white/[0.08]"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-sb-muted font-bold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#11151E] px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-sb-cyan cursor-pointer shadow-2xs"
                >
                  <option value="recommended">Recommended</option>
                  <option value="hours">Estimated Hours</option>
                  <option value="lessons">Most Lessons</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
              <div className="rounded-3xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#11151E] p-12 text-center space-y-3 shadow-xs">
                <BookOpen size={36} className="mx-auto text-sb-muted opacity-40" />
                <h3 className="text-base font-extrabold text-[#171717] dark:text-white">
                  No skills match your search
                </h3>
                <p className="text-xs text-sb-muted max-w-sm mx-auto">
                  Try adjusting your query or filter tags to discover other available roadmaps.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedDifficulty("All");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#FF6A00] hover:bg-[#E55A00] text-white shadow-xs cursor-pointer active:scale-[0.98] transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSkills.map((skill) => {
                  const prog = learningProgress[skill.id];
                  const isProfile = data.skills.some(
                    (s) => s.name.toLowerCase() === skill.name.toLowerCase()
                  );
                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      progress={prog}
                      isProfileSkill={isProfile}
                      onSelect={setActiveSkillModal}
                      onEnroll={(s) => setEnrollingSkill(s)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ============================================================== */}
      {/* 5. INDIVIDUAL SKILL LEARNING EXPERIENCE MODAL */}
      {/* ============================================================== */}
      {activeSkillModal && (
        <SkillDetailModal
          skill={activeSkillModal}
          progress={learningProgress[activeSkillModal.id]}
          isProfileSkill={data.skills.some(
            (s) => s.name.toLowerCase() === activeSkillModal.name.toLowerCase()
          )}
          onClose={() => setActiveSkillModal(null)}
          onToggleLesson={handleToggleLesson}
          onToggleProject={handleToggleProject}
          onRecordQuiz={handleRecordQuiz}
          onAddToProfile={handleAddToProfile}
          onEnroll={(s) => setEnrollingSkill(s)}
        />
      )}

      {/* ============================================================== */}
      {/* 5B. ENROLLMENT CONFIRMATION MODAL                             */}
      {/* ============================================================== */}
      {enrollingSkill && (
        <EnrollmentConfirmModal
          skill={enrollingSkill}
          isOpen={!!enrollingSkill}
          onClose={() => setEnrollingSkill(null)}
          onConfirm={handleConfirmEnrollment}
        />
      )}

      {/* ============================================================== */}
      {/* 6. COMPACT ANIMATED PERSONALIZED LEARNING PATH SIDE PANEL */}
      {/* ============================================================== */}
      <PersonalizedPathSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        student={data}
        activePath={personalizedPath}
        onPathAccepted={(newPath) => {
          setPersonalizedPath(newPath);
          setActiveViewMode("my-path");
          notify("success", "Your customized learning path has been activated!");
        }}
      />
    </div>
  );
}
