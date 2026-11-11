"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { ScrollSection } from "./ScrollSection";
import {
  Compass,
  Terminal,
  Layers,
  GitPullRequest,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Cpu,
  GitBranch,
  Star,
  Award,
} from "lucide-react";

interface StageData {
  id: string;
  num: string;
  stepIndex: number;
  title: string;
  tagline: string;
  duration: string;
  phaseLabel: string;
  summary: string;
  deliverables: [string, string];
  icon: typeof Compass;
  targetHref: string;
  visual: {
    badge: string;
    headline: string;
    metricLabel: string;
    metricValue: string;
    tags: string[];
    detailSnippet: string;
  };
}

const STAGES: StageData[] = [
  {
    id: "discover",
    num: "01",
    stepIndex: 0,
    title: "Discover",
    tagline: "Map Role Competencies",
    duration: "Week 1",
    phaseLabel: "Diagnostic & Gap Analysis",
    summary:
      "Benchmark your skill graph against live industry matrices and university curricula to pinpoint high-leverage growth targets.",
    deliverables: [
      "Personalized competency graph with live industry alignment",
      "Tailored academic + practical project learning trajectory",
    ],
    icon: Compass,
    targetHref: "/student/skills",
    visual: {
      badge: "SKILL GRAPH DIAGNOSTIC",
      headline: "Distributed Systems & Cloud Architecture",
      metricLabel: "Role Readiness Alignment",
      metricValue: "94.2%",
      tags: ["TypeScript", "Distributed Systems", "Cloud Runtimes", "Docker"],
      detailSnippet: "Benchmark validated across 120+ enterprise hiring criteria",
    },
  },
  {
    id: "practice",
    num: "02",
    stepIndex: 1,
    title: "Practice",
    tagline: "Sandboxed Tech Labs",
    duration: "Weeks 2–3",
    phaseLabel: "Hands-on Mastery",
    summary:
      "Internalize engineering patterns in isolated cloud environments powered by automated test harnesses and instant feedback.",
    deliverables: [
      "Automated unit, integration & regression test completions",
      "Verified hands-on checkpoint credentials on your record",
    ],
    icon: Terminal,
    targetHref: "/student/opportunities",
    visual: {
      badge: "EPHEMERAL CLOUD HARNESS",
      headline: "Automated Test Matrix & CI Runtime",
      metricLabel: "Test Suite Health",
      metricValue: "18/18 Passing",
      tags: ["Async Pipelines", "Concurrency", "API Contracts", "Latency < 40ms"],
      detailSnippet: "Automated regression checks running with zero local configuration",
    },
  },
  {
    id: "build",
    num: "03",
    stepIndex: 2,
    title: "Build",
    tagline: "Scoped Industry Briefs",
    duration: "Weeks 4–6",
    phaseLabel: "Production Engineering",
    summary:
      "Tackle real problem statements sponsored by enterprise partners under authentic production constraints and architectural standards.",
    deliverables: [
      "Production-ready repository with complete CI/CD automation",
      "Architectural Decision Records (ADRs) & benchmark analysis",
    ],
    icon: Layers,
    targetHref: "/student/projects",
    visual: {
      badge: "ENTERPRISE CAPSTONE",
      headline: "Microservices Telemetry & Ingestion Mesh",
      metricLabel: "Repository Health",
      metricValue: "Grade A+ (98%)",
      tags: ["main branch", "CI Automated", "Staging Deployed", "Docker Compose"],
      detailSnippet: "Live multi-tier environment verified against production specs",
    },
  },
  {
    id: "collaborate",
    num: "04",
    stepIndex: 3,
    title: "Collaborate",
    tagline: "Mentor & Faculty Review",
    duration: "Weeks 7–8",
    phaseLabel: "Peer & Expert Alignment",
    summary:
      "Refine your deliverables through structured code critiques, sprint retrospectives, and academic rubrics led by verified engineers.",
    deliverables: [
      "Signed industry mentor evaluation & rubric certification",
      "Accredited faculty review with university capstone validation",
    ],
    icon: GitPullRequest,
    targetHref: "/student",
    visual: {
      badge: "STAFF ARCHITECT ENDORSEMENT",
      headline: "Verified Pull Request & Code Critique",
      metricLabel: "Rubric Score",
      metricValue: "4.9 / 5.0",
      tags: ["Clean Code", "Design Patterns", "Security Audit", "Faculty Credit"],
      detailSnippet: "Endorsed by Senior Staff Engineers from partner tech enterprises",
    },
  },
  {
    id: "launch",
    num: "05",
    stepIndex: 4,
    title: "Launch",
    tagline: "Direct Career Placement",
    duration: "Outcome",
    phaseLabel: "Outcome & Handoff",
    summary:
      "Showcase cryptographically signed artifact portfolios directly to hiring directors, research labs, and priority recruiting pipelines.",
    deliverables: [
      "Cryptographically verified transcript & portfolio certificate",
      "Fast-track interview invitations from enterprise partners",
    ],
    icon: Rocket,
    targetHref: "/student/applications",
    visual: {
      badge: "FAST-TRACK PIPELINE",
      headline: "Verified Candidate Portfolio & Talent Handoff",
      metricLabel: "Placement Status",
      metricValue: "Interview Ready",
      tags: ["Direct Fast-Track", "Verified Credentials", "Tier-1 Pipeline", "Placed"],
      detailSnippet: "Direct profile indexing with enterprise recruiting teams",
    },
  },
];

// Interactive Stage Button-Card
const StageButtonCard = memo(function StageButtonCard({
  stage,
  isActive,
  isCompleted,
  onSelect,
}: {
  stage: StageData;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  const Icon = stage.icon;

  return (
    <button
      type="button"
      role="tab"
      id={`progression-stage-${stage.id}`}
      aria-selected={isActive}
      aria-controls={`progression-panel-${stage.id}`}
      onClick={onSelect}
      className={`group relative flex flex-col justify-between w-full min-w-[170px] sm:min-w-[200px] lg:min-w-0 p-4 sm:p-5 rounded-2xl text-left select-none outline-none cursor-pointer transition-all duration-300 active:scale-[0.98] ${
        isActive
          ? "bg-white dark:bg-[#18181D] border-2 border-[#D41514] shadow-[0_12px_32px_-8px_rgba(212,21,20,0.32)] dark:shadow-[0_12px_32px_-8px_rgba(212,21,20,0.40)] translate-y-[-2px]"
          : isCompleted
          ? "bg-white/95 dark:bg-[#131316] border border-slate-200/90 dark:border-white/[0.12] hover:border-[#D41514]/40 hover:bg-white dark:hover:bg-[#16161A] shadow-sm"
          : "bg-white/80 dark:bg-[#101013] border border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.14] hover:bg-white dark:hover:bg-[#141418]"
      }`}
    >
      {/* Top Specular Sheen for Active Card */}
      {isActive && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#D41514] to-transparent"
          aria-hidden="true"
        />
      )}

      {/* Header: Stage Number & Status Pill */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md transition-colors duration-200 ${
            isActive
              ? "bg-[#D41514] text-white"
              : isCompleted
              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-slate-100 text-slate-600 dark:bg-white/[0.05] dark:text-[#8E8C8B] border border-slate-200/70 dark:border-white/[0.08]"
          }`}
        >
          {stage.num}
        </span>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors duration-200 ${
            isActive
              ? "bg-[#D41514]/15 text-[#D41514] dark:text-[#FF4D4D] border border-[#D41514]/30"
              : isCompleted
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-600 dark:text-[#8E8C8B]"
          }`}
        >
          {isActive ? "Active" : isCompleted ? "Completed" : "Upcoming"}
        </span>
      </div>

      {/* Middle: Icon & Compact Typography */}
      <div className="my-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
            isActive
              ? "bg-[#D41514] text-white shadow-[0_4px_14px_-2px_rgba(212,21,20,0.5)] scale-105"
              : isCompleted
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#CDCBCA] border border-slate-200/80 dark:border-white/[0.08] group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <h4
          className={`text-base font-bold tracking-tight transition-colors duration-200 leading-snug ${
            isActive
              ? "text-slate-900 dark:text-white"
              : "text-slate-800 dark:text-[#CDCBCA] group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          {stage.title}
        </h4>

        <p className="text-[11px] font-medium text-slate-600 dark:text-[#8E8C8B] line-clamp-1 mt-0.5">
          {stage.tagline}
        </p>
      </div>

      {/* Footer: Timeline & Action Pill */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
        <span className="font-mono text-[10px] text-slate-600 dark:text-[#8E8C8B] uppercase tracking-wider">
          {stage.duration}
        </span>
        <span
          className={`flex items-center gap-0.5 font-semibold text-[11px] transition-transform duration-200 ${
            isActive
              ? "text-[#D41514] dark:text-[#FF4D4D] translate-x-0.5"
              : "text-slate-600 dark:text-[#8E8C8B] group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          <span>{isActive ? "Viewing" : "Explore"}</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      {/* Bottom Accent Line for Active Button */}
      {isActive && (
        <div
          className="absolute inset-x-4 -bottom-[2px] h-[3px] rounded-full bg-[#D41514]"
          aria-hidden="true"
        />
      )}
    </button>
  );
});

export function SectionProgression() {
  const [activeId, setActiveId] = useState<string>("build"); // Defaults to Stage 03 Build
  const activeStage = STAGES.find((s) => s.id === activeId) || STAGES[2];
  const activeIndex = activeStage.stepIndex;

  const handleSelectStage = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <ScrollSection
      id="progression"
      ariaLabel="From Progress to Possibility"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-white/[0.08]"
    >
      {({ inView: isVisible }) => (
        <div className="mx-auto max-w-7xl">
          {/* Section Header with Clean Hierarchy */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D41514]/25 bg-[#D41514]/8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D41514] dark:text-[#FF4D4D] mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Milestone-Driven Lifecycle</span>
            </div>

            <h2
              className={`scroll-reveal scroll-delay-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] ${
                isVisible ? "is-in-view" : ""
              }`}
            >
              From Progress to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D41514] via-[#FF4D4D] to-[#007BA7]">
                Possibility
              </span>
            </h2>

            <p
              className={`scroll-reveal scroll-delay-2 mt-3 text-sm sm:text-base text-slate-600 dark:text-[#CDCBCA] leading-relaxed max-w-2xl mx-auto ${
                isVisible ? "is-in-view" : ""
              }`}
            >
              A five-stage horizontal trajectory that transforms foundational learning into production engineering, verified peer endorsements, and corporate placements.
            </p>
          </div>

          {/* Unified Horizontal Journey Conduit & Cards */}
          <div
            className={`scroll-reveal scroll-delay-3 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0E0E12] p-5 sm:p-7 lg:p-9 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] ${
              isVisible ? "is-in-view" : ""
            }`}
          >
            {/* Top Progress Track (Desktop & Tablet) */}
            <div className="mb-6 px-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-[#CDCBCA] mb-2.5">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#D41514] animate-pulse" />
                  Stage {activeStage.num} of 05 • {activeStage.title}
                </span>
                <span className="font-mono text-[11px] text-[#D41514] dark:text-[#FF4D4D] font-bold">
                  {Math.round(((activeIndex + 1) / 5) * 100)}% Milestone Completed
                </span>
              </div>

              {/* Connected Conduit Bar with Dynamic Progress Fill */}
              <div
                className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(((activeIndex + 1) / 5) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Five-stage progression tracker"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D41514] via-[#FF4D4D] to-[#007BA7] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    width: `${((activeIndex + 1) / 5) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* 5 Stage Button-Cards in Horizontal Flow */}
            <div
              role="tablist"
              aria-label="SkillBridge 5-Stage Journey"
              className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-3 lg:pb-0 scrollbar-none snap-x snap-mandatory"
            >
              {STAGES.map((stage, idx) => (
                <div key={stage.id} className="snap-start flex-1 shrink-0">
                  <StageButtonCard
                    stage={stage}
                    isActive={activeId === stage.id}
                    isCompleted={idx < activeIndex}
                    onSelect={() => handleSelectStage(stage.id)}
                  />
                </div>
              ))}
            </div>

            {/* Integrated Stage Showcase Console (Directly Inside the Section!) */}
            <div
              id={`progression-panel-${activeStage.id}`}
              role="tabpanel"
              aria-labelledby={`progression-stage-${activeStage.id}`}
              className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200/80 dark:border-white/[0.08] transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left Column: Context, Value Proposition & Action */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D41514]/12 text-[#D41514] dark:text-[#FF4D4D] border border-[#D41514]/25">
                      Stage {activeStage.num} • {activeStage.duration}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-[#CDCBCA]">
                      {activeStage.phaseLabel}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {activeStage.title}: {activeStage.tagline}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-[#CDCBCA] leading-relaxed">
                    {activeStage.summary}
                  </p>

                  {/* High-Impact Deliverables */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeStage.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#141418] border border-slate-200/80 dark:border-white/[0.08] shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#D41514] dark:text-[#FF4D4D] shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-800 dark:text-[#CDCBCA] leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Primary Direct Action Link */}
                  <div className="pt-3 flex flex-wrap items-center gap-4">
                    <Link
                      href={activeStage.targetHref}
                      className="btn btn-primary group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shadow-md transition-all duration-200"
                    >
                      <span>Explore Stage {activeStage.num} Pathways</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>

                    <span className="text-xs text-slate-600 dark:text-[#8E8C8B] font-mono">
                      Cohort-guided or self-paced
                    </span>
                  </div>
                </div>

                {/* Right Column: Realistic Visual Artifact Console */}
                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.10] bg-white dark:bg-[#15151A] p-5 sm:p-6 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
                    {/* Console Header Bar */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D41514]" />
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D41514] dark:text-[#FF4D4D]">
                          {activeStage.visual.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-[#8E8C8B] uppercase">
                        SkillBridge Engine
                      </span>
                    </div>

                    {/* Console Content */}
                    <div className="py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-600 dark:text-[#8E8C8B]">
                            Focus Area &amp; Benchmark
                          </p>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            {activeStage.visual.headline}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#8E8C8B]">
                            {activeStage.visual.metricLabel}
                          </p>
                          <p className="text-lg font-mono font-bold text-[#D41514] dark:text-[#FF4D4D]">
                            {activeStage.visual.metricValue}
                          </p>
                        </div>
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {activeStage.visual.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#CDCBCA] border border-slate-200/80 dark:border-white/[0.08]"
                          >
                            <ShieldCheck className="w-3 h-3 text-[#D41514] dark:text-[#FF4D4D]" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Status Snippet Callout */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#101013] border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-slate-500 dark:text-[#8E8C8B] shrink-0" />
                        <span className="text-xs text-slate-600 dark:text-[#8E8C8B] leading-tight">
                          {activeStage.visual.detailSnippet}
                        </span>
                      </div>
                    </div>

                    {/* Console Footer */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-600 dark:text-[#8E8C8B]">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Stage {activeStage.num} Active Verification</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ● Live Sync Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollSection>
  );
}

export default SectionProgression;
