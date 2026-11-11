"use client";

import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import Link from "next/link";
import { ScrollSection } from "./ScrollSection";
import { Search, Code, Wrench, Users2, Rocket, ArrowRight, CheckCircle2 } from "lucide-react";

interface StageData {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  duration: string;
  accentHex: string;
  accentRgba: string;
  badgeText: string;
  badgeBg: string;
  borderActive: string;
  iconBg: string;
  iconActiveBg: string;
  icon: React.ReactNode;
}

const STAGES: StageData[] = [
  {
    id: "discover",
    num: "01",
    title: "Discover",
    subtitle: "Map Role Competencies",
    description:
      "Benchmark your current skill graph against live industry role matrices and university curriculum tracks to identify high-leverage growth areas.",
    deliverables: [
      "Personalized competency diagnostic & skill graph",
      "Curated academic + industry learning roadmap",
    ],
    duration: "Week 1",
    accentHex: "#007BA7",
    accentRgba: "rgba(0, 123, 167, 0.16)",
    badgeText: "text-[#007BA7]",
    badgeBg: "bg-[#007BA7]/10 border-[#007BA7]/25",
    borderActive: "border-[#007BA7] ring-1 ring-[#007BA7]/30",
    iconBg: "bg-[#007BA7]/10 text-[#007BA7] border-[#007BA7]/20",
    iconActiveBg: "bg-[#007BA7] text-[#FFFFFF] border-[#007BA7] shadow-[0_8px_20px_-4px_rgba(0,123,167,0.45)]",
    icon: <Search className="w-5 h-5" />,
  },
  {
    id: "practice",
    num: "02",
    title: "Practice",
    subtitle: "Sandboxed Technical Labs",
    description:
      "Master foundational patterns through interactive cloud sandboxes, automated test suites, and low-stakes architectural drills.",
    deliverables: [
      "Automated unit & integration test completions",
      "Verified lab checkpoints & micro-credentials",
    ],
    duration: "Weeks 2–3",
    accentHex: "#743BFF",
    accentRgba: "rgba(116, 59, 255, 0.16)",
    badgeText: "text-[#743BFF]",
    badgeBg: "bg-[#743BFF]/10 border-[#743BFF]/25",
    borderActive: "border-[#743BFF] ring-1 ring-[#743BFF]/30",
    iconBg: "bg-[#743BFF]/10 text-[#743BFF] border-[#743BFF]/20",
    iconActiveBg: "bg-[#743BFF] text-[#FFFFFF] border-[#743BFF] shadow-[0_8px_20px_-4px_rgba(116,59,255,0.45)]",
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: "build",
    num: "03",
    title: "Build",
    subtitle: "Scoped Industry Briefs",
    description:
      "Tackle real-world engineering, data, or research problem statements sponsored by partner enterprises with production-grade constraints.",
    deliverables: [
      "Production-ready repository & deployment pipeline",
      "Architecture decision records (ADRs) & benchmarks",
    ],
    duration: "Weeks 4–6",
    accentHex: "#48204F",
    accentRgba: "rgba(72, 32, 79, 0.16)",
    badgeText: "text-[#48204F] dark:text-[#E2A4EA]",
    badgeBg: "bg-[#48204F]/10 border-[#48204F]/25",
    borderActive: "border-[#48204F] ring-1 ring-[#48204F]/30",
    iconBg: "bg-[#48204F]/10 text-[#48204F] border-[#48204F]/20",
    iconActiveBg: "bg-[#48204F] text-[#FFFFFF] border-[#48204F] shadow-[0_8px_20px_-4px_rgba(72,32,79,0.45)]",
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: "collaborate",
    num: "04",
    title: "Collaborate",
    subtitle: "Mentor & Faculty Review",
    description:
      "Participate in structured code reviews, design critiques, and sprint retrospectives led by industry practitioners and academic advisors.",
    deliverables: [
      "Signed mentor code-review & rubric evaluation",
      "Faculty academic credit & capstone validation",
    ],
    duration: "Weeks 7–8",
    accentHex: "#FF2D95",
    accentRgba: "rgba(255, 45, 149, 0.16)",
    badgeText: "text-[#FF2D95]",
    badgeBg: "bg-[#FF2D95]/10 border-[#FF2D95]/25",
    borderActive: "border-[#FF2D95] ring-1 ring-[#FF2D95]/30",
    iconBg: "bg-[#FF2D95]/10 text-[#FF2D95] border-[#FF2D95]/20",
    iconActiveBg: "bg-[#FF2D95] text-[#FFFFFF] border-[#FF2D95] shadow-[0_8px_20px_-4px_rgba(255,45,149,0.45)]",
    icon: <Users2 className="w-5 h-5" />,
  },
  {
    id: "launch",
    num: "05",
    title: "Launch",
    subtitle: "Direct Career & R&D Placement",
    description:
      "Publish your verified artifact portfolio directly to hiring managers, research fellowships, and venture incubation pipelines.",
    deliverables: [
      "Cryptographically verified portfolio & transcript",
      "Fast-track interview invitations from sponsor orgs",
    ],
    duration: "Outcome",
    accentHex: "#007BA7",
    accentRgba: "rgba(0, 123, 167, 0.16)",
    badgeText: "text-[#007BA7] dark:text-[#19B8E6]",
    badgeBg: "bg-[#007BA7]/10 border-[#007BA7]/25",
    borderActive: "border-[#007BA7] ring-1 ring-[#FF2D95]/30",
    iconBg: "bg-[#007BA7]/10 text-[#007BA7] border-[#007BA7]/20",
    iconActiveBg: "bg-gradient-to-r from-[#FF2D95] to-[#007BA7] text-[#FFFFFF] border-transparent shadow-[0_8px_20px_-4px_rgba(255,45,149,0.45)]",
    icon: <Rocket className="w-5 h-5" />,
  },
];

const StageCard = memo(function StageCard({
  stage,
  isActive,
  onSelect,
  onHover,
}: {
  stage: StageData;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const py = ((clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      el.style.setProperty("--px", `${px.toFixed(1)}%`);
      el.style.setProperty("--py", `${py.toFixed(1)}%`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--px", "50%");
    el.style.setProperty("--py", "50%");
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-pressed={isActive}
      style={
        {
          "--px": "50%",
          "--py": "50%",
          transform: isActive ? "translate3d(0, -6px, 0) scale(1.02)" : "translate3d(0, 0, 0) scale(1)",
          transition: isActive
            ? "transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 360ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms ease, background-color 260ms ease"
            : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms ease, background-color 260ms ease",
        } as React.CSSProperties
      }
      className={`group relative w-full text-left rounded-2xl p-5 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007BA7] active:scale-[0.985] border ${
        isActive
          ? `bg-white dark:bg-[#0D121D]/90 ${stage.borderActive} shadow-[0_20px_44px_-14px_rgba(0,123,167,0.18),0_8px_18px_-8px_rgba(116,59,255,0.16)]`
          : "border-slate-200/80 bg-white/90 hover:bg-white hover:border-slate-300 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:shadow-none"
      }`}
    >
      {/* Top-edge highlight sheen */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
        style={{
          background: `linear-gradient(90deg, transparent, ${stage.accentHex}, transparent)`,
        }}
      />

      {/* Pointer-following radial glow */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"
        }`}
        style={{
          background: `radial-gradient(240px circle at var(--px, 50%) var(--py, 50%), ${stage.accentRgba}, transparent 72%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-300 ${
                isActive ? `${stage.iconActiveBg} scale-105` : `${stage.iconBg} group-hover:scale-105`
              }`}
            >
              {stage.icon}
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors duration-300 ${
                isActive
                  ? `${stage.badgeBg} ${stage.badgeText}`
                  : "bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
              }`}
            >
              {stage.num}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F5F7FA] mb-1">
            {stage.title}
          </h3>
          <p
            className={`text-xs font-semibold mb-2.5 transition-colors duration-300 ${
              isActive ? stage.badgeText : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {stage.subtitle}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {stage.description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-[#222222]/[0.08] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {stage.duration}
          </span>
          <span
            className={`text-[11px] font-bold inline-flex items-center gap-1 transition-colors duration-300 ${
              isActive ? stage.badgeText : "text-slate-600 dark:text-slate-300 group-hover:text-[#0F172A] dark:text-[#F5F7FA]"
            }`}
          >
            {isActive ? "Selected" : "Details"}
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
});

export default function SectionProgression() {
  const [activeStage, setActiveStage] = useState<string>(STAGES[2].id); // Default to "03 Build"
  const activeData = STAGES.find((s) => s.id === activeStage) || STAGES[2];

  return (
    <ScrollSection
      id="progression"
      ariaLabel="From Progress to Possibility"
      className="py-24 md:py-32 px-6 border-b border-slate-200/60 dark:border-white/10"

    >
      {({ inView: isVisible }) => (
        <>
          {/* Colorful Ambient Diffused Light Cone coordinated with active stage */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] rounded-full blur-[140px] opacity-20 dark:opacity-35 transition-all duration-700"
            style={{ background: `radial-gradient(circle, ${activeData.accentHex} 0%, transparent 70%)` }}
            aria-hidden="true"
          />

          <div className="mx-auto max-w-6xl relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2
                className={`scroll-reveal scroll-delay-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-[#CDCBCA] leading-[1.12] ${
                  isVisible ? "is-in-view" : ""
                }`}
              >
                From Progress to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#FF2D95]">
                  Possibility
                </span>
              </h2>

              <p
                className={`scroll-reveal scroll-delay-2 mt-4 text-base sm:text-lg text-slate-600 dark:text-[#8E8C8B] leading-relaxed ${
                  isVisible ? "is-in-view" : ""
                }`}
              >
                Every participant moves through a transparent, milestone-driven lifecycle—turning raw curiosity into verified career and research outcomes.
              </p>
            </div>

            {/* 5-Stage Horizontal Conduit */}
            <div
              className={`scroll-reveal scroll-delay-3 relative ${
                isVisible ? "is-in-view" : ""
              }`}
            >
              {/* Connecting Conduit Line (Desktop) */}
              <div
                className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-[#007BA7]/40 via-[#743BFF]/40 via-[#FF2D95]/40 to-[#10B981]/40 pointer-events-none"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {STAGES.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    isActive={activeStage === stage.id}
                    onSelect={() => setActiveStage(stage.id)}
                    onHover={() => setActiveStage(stage.id)}
                  />
                ))}
              </div>
            </div>

            {/* Active Stage Milestone Deep-Dive Card */}
            <div
              className={`mt-8 rounded-2xl border border-slate-200/80 dark:border-[rgba(205,203,202,0.12)] bg-white dark:bg-[#0D0D0D] p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(34,34,34,0.08)] transition-[opacity,transform] duration-500 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border transition-colors duration-300 ${activeData.badgeBg} ${activeData.badgeText}`}
                    >
                      Stage {activeData.num} • {activeData.duration}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {activeData.subtitle}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                    {activeData.title}: {activeData.subtitle}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeData.description}
                  </p>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeData.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 transition-colors duration-300 ${activeData.badgeText}`}
                        />
                        <span className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F5F7FA] leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
                  <Link
                    href="/students"
                    className="btn btn-primary group px-5 py-2.5 text-sm font-medium whitespace-nowrap"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 text-current" />
                  </Link>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 text-center lg:text-right">
                    Self-paced or cohort-guided
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ScrollSection>
  );
}
