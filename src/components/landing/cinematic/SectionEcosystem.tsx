"use client";

import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollSection } from "./ScrollSection";
import { GraduationCap, Building2, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

export type PillarId = "students" | "academia" | "industry";

export interface PillarData {
  id: PillarId;
  title: string;
  tagline: string;
  href: string;
  primaryHex: string;
  secondaryHex: string;
  ambientGlowHex: string;
  softTintHex: string;
  accentHex: string;
  badgeText: string;
  badgeBg: string;
  borderActive: string;
  iconBg: string;
  iconActiveBg: string;
  glowColor: string;
  ctaStyle: {
    bg: string;
    hoverBg: string;
    textColor: string;
  };
  description: string;
  imageSrc: string;
  imageAlt: string;
  highlights: string[];
  stats: { label: string; value: string }[];
  icon: React.ReactNode;
}

export const PILLARS: PillarData[] = [
  {
    id: "students",
    title: "Students",
    tagline: "Build Verified Portfolios & Launch Careers",
    href: "/student",
    primaryHex: "#007BA7",
    secondaryHex: "#19B8E6",
    ambientGlowHex: "#19B8E6",
    softTintHex: "rgba(0, 123, 167, 0.08)",
    accentHex: "#007BA7",
    badgeText: "text-[#007BA7] dark:text-[#19B8E6]",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30",
    borderActive: "border-[#007BA7] dark:border-[#19B8E6] ring-1 ring-[#007BA7]/30 dark:ring-[#19B8E6]/40",
    iconBg: "bg-cyan-500/10 text-[#007BA7] dark:text-[#19B8E6] border-cyan-500/25",
    iconActiveBg: "bg-[#007BA7] dark:bg-[#19B8E6] text-white dark:text-[#080808] border-[#007BA7] dark:border-[#19B8E6] shadow-[0_8px_20px_-4px_rgba(0,123,167,0.45)]",
    glowColor: "rgba(0, 123, 167, 0.20)",
    ctaStyle: {
      bg: "bg-[#007BA7] dark:bg-[#19B8E6]",
      hoverBg: "hover:bg-[#00688F] dark:hover:bg-[#38BDF8]",
      textColor: "text-white dark:text-[#080808]",
    },
    description:
      "Gain hands-on experience by solving real-world engineering, data, and design challenges co-authored by industry leaders and university faculty.",
    imageSrc: "/portals/students.jpg",
    imageAlt: "Students collaborating on technical projects",
    highlights: [
      "Work on live industry-sponsored problem briefs",
      "Earn verifiable skill credentials & faculty endorsements",
      "Fast-track directly to internships & technical interviews",
    ],
    stats: [
      { label: "Active Learners", value: "10,000+" },
      { label: "Placement Rate", value: "92%" },
    ],
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: "academia",
    title: "Academia",
    tagline: "Bridge Curricula with Applied Industry R&D",
    href: "/academia",
    primaryHex: "#743BFF",
    secondaryHex: "#B57CFF",
    ambientGlowHex: "#743BFF",
    softTintHex: "rgba(116, 59, 255, 0.08)",
    accentHex: "#743BFF",
    badgeText: "text-[#743BFF] dark:text-[#B57CFF]",
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    borderActive: "border-[#743BFF] dark:border-[#B57CFF] ring-1 ring-[#743BFF]/30 dark:ring-[#B57CFF]/40",
    iconBg: "bg-purple-500/10 text-[#743BFF] dark:text-[#B57CFF] border-purple-500/25",
    iconActiveBg: "bg-[#743BFF] dark:bg-[#B57CFF] text-white dark:text-[#080808] border-[#743BFF] dark:border-[#B57CFF] shadow-[0_8px_20px_-4px_rgba(116,59,255,0.45)]",
    glowColor: "rgba(116, 59, 255, 0.20)",
    ctaStyle: {
      bg: "bg-[#743BFF] dark:bg-[#B57CFF]",
      hoverBg: "hover:bg-[#6027E6] dark:hover:bg-[#743BFF]",
      textColor: "text-white dark:text-[#080808]",
    },
    description:
      "Embed live corporate capstones, research collaborations, and real-time competency analytics directly into university degree programs and labs.",
    imageSrc: "/portals/academia.jpg",
    imageAlt: "University faculty and researchers collaborating",
    highlights: [
      "Turnkey industry-aligned capstone & lab modules",
      "Co-supervise applied research grants with enterprise R&D",
      "Real-time accreditation & cohort outcome telemetry",
    ],
    stats: [
      { label: "Partner Universities", value: "45+" },
      { label: "Joint Research Labs", value: "120+" },
    ],
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "industry",
    title: "Industry",
    tagline: "Source Pre-Vetted Talent & Accelerate Innovation",
    href: "/industry",
    primaryHex: "#FF2D95",
    secondaryHex: "#E0187E",
    ambientGlowHex: "#FF2D95",
    softTintHex: "rgba(255, 45, 149, 0.08)",
    accentHex: "#FF2D95",
    badgeText: "text-[#FF2D95] dark:text-[#FF2D95]",
    badgeBg: "bg-pink-500/10 border-pink-500/30",
    borderActive: "border-[#FF2D95] dark:border-[#FF2D95] ring-1 ring-[#FF2D95]/30 dark:ring-[#FF2D95]/40",
    iconBg: "bg-pink-500/10 text-[#FF2D95] dark:text-[#FF2D95] border-pink-500/25",
    iconActiveBg: "bg-[#FF2D95] text-white border-[#FF2D95] shadow-[0_8px_20px_-4px_rgba(255,45,149,0.45)]",
    glowColor: "rgba(255, 45, 149, 0.20)",
    ctaStyle: {
      bg: "bg-[#FF2D95]",
      hoverBg: "hover:bg-[#E0187E]",
      textColor: "text-white",
    },
    description:
      "Sponsor custom project briefs, evaluate candidates through real engineering deliverables instead of resumes, and co-develop prototypes with top academic labs.",
    imageSrc: "/portals/industry.jpg",
    imageAlt: "Industry leaders reviewing engineering outcomes",
    highlights: [
      "Evaluate candidates on actual code & architecture execution",
      "Launch rapid R&D prototypes with faculty-led student squads",
      "Reduce time-to-hire by 60% with zero-noise talent pipelines",
    ],
    stats: [
      { label: "Enterprise Partners", value: "85+" },
      { label: "Prototypes Shipped", value: "450+" },
    ],
    icon: <Briefcase className="w-5 h-5" />,
  },
];

const PillarCard = memo(function PillarCard({
  pillar,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: {
  pillar: PillarData;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
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
    if (!el || e.pointerType === "touch") return;
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
    if (el) {
      el.style.setProperty("--px", "50%");
      el.style.setProperty("--py", "50%");
    }
    onLeave();
  }, [onLeave]);

  // Static tailwind styles per portal theme for guaranteed compilation & zero lag
  const isStudents = pillar.id === "students";
  const isAcademia = pillar.id === "academia";

  // Hover-only surface styling: card background stays deep black (#080808) in dark mode
  const activeSurface = isStudents
    ? "border-2 border-[#007BA7] dark:border-[#19B8E6] bg-white dark:bg-[#080808] ring-1 ring-[#007BA7]/30 dark:ring-[#19B8E6]/40 shadow-[0_16px_36px_-12px_rgba(0,123,167,0.35)]"
    : isAcademia
    ? "border-2 border-[#743BFF] dark:border-[#B57CFF] bg-white dark:bg-[#080808] ring-1 ring-[#743BFF]/30 dark:ring-[#B57CFF]/40 shadow-[0_16px_36px_-12px_rgba(116,59,255,0.35)]"
    : "border-2 border-[#FF2D95] dark:border-[#FF2D95] bg-white dark:bg-[#080808] ring-1 ring-[#FF2D95]/30 dark:ring-[#FF2D95]/40 shadow-[0_16px_36px_-12px_rgba(255,45,149,0.35)]";

  const defaultSurface =
    "border border-slate-200/80 dark:border-[rgba(205,203,202,0.12)] bg-white/95 dark:bg-[#080808] shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] dark:shadow-none";

  return (
    <button
      ref={cardRef}
      id={`pillar-card-${pillar.id}`}
      type="button"
      role="tab"
      aria-selected={isHovered}
      aria-label={`${pillar.title} Portal: ${pillar.tagline}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--px": "50%",
          "--py": "50%",
          willChange: "transform",
          transform: isHovered
            ? "translate3d(0, -4px, 0)"
            : "translate3d(0, 0, 0)",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 260ms ease, background-color 260ms ease",
        } as React.CSSProperties
      }
      className={`group relative w-full text-left rounded-2xl p-4 sm:p-5 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 active:scale-[0.985] transition-all ${
        isHovered ? activeSurface : defaultSurface
      }`}
    >
      {/* Top-edge specular highlight bar on hover */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `linear-gradient(90deg, transparent, ${pillar.primaryHex}, transparent)`,
        }}
      />

      {/* Pointer-following radial illumination on hover */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(240px circle at var(--px, 50%) var(--py, 50%), ${pillar.glowColor}, transparent 72%)`,
        }}
      />

      {/* Corner Ambient Glow on Hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundColor: pillar.ambientGlowHex,
          opacity: isHovered ? 0.25 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Row: Icon + Badge */}
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? `${pillar.iconActiveBg} scale-105`
                  : `${pillar.iconBg} dark:bg-[#121212] dark:text-[#CDCBCA] dark:border-white/10`
              }`}
            >
              {pillar.icon}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border transition-colors duration-300 ${
                isHovered
                  ? `${pillar.badgeBg} ${pillar.badgeText}`
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-[#8E8C8B] border-slate-200 dark:border-white/10"
              }`}
            >
              {isHovered ? "Explore" : "Portal"}
            </span>
          </div>

          {/* Title & Tagline */}
          <h3
            className={`text-xl sm:text-[22px] font-bold tracking-tight mb-1 transition-colors ${
              isHovered ? pillar.badgeText : "text-[#0F172A] dark:text-[#CDCBCA]"
            }`}
          >
            {pillar.title}
          </h3>
          <p
            className={`text-xs sm:text-[13px] font-medium leading-relaxed transition-colors duration-300 line-clamp-2 ${
              isHovered ? pillar.badgeText : "text-slate-600 dark:text-[#8E8C8B]"
            }`}
          >
            {pillar.tagline}
          </p>
        </div>

        {/* Bottom Row: Stats & Enter CTA */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3.5">
            {pillar.stats.map((st, idx) => (
              <div key={idx}>
                <span className="block text-[9.5px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8E8C8B]">
                  {st.label}
                </span>
                <span
                  className={`text-xs sm:text-[13px] font-bold transition-colors ${
                    isHovered ? pillar.badgeText : "text-[#0F172A] dark:text-[#CDCBCA]"
                  }`}
                >
                  <SpinningCounter value={st.value} />
                </span>
              </div>
            ))}
          </div>

          <div
            className={`inline-flex items-center gap-1 text-xs font-bold transition-transform duration-300 ${
              isHovered
                ? `${pillar.badgeText} translate-x-0.5`
                : "text-slate-600 dark:text-[#8E8C8B] group-hover:text-[#0F172A] dark:group-hover:text-[#CDCBCA]"
            }`}
          >
            <span>Enter</span>
            <ArrowRight
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isHovered ? "translate-x-0.5" : "group-hover:translate-x-0.5"
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  );
});

export function SectionEcosystem() {
  const [selectedPillar, setSelectedPillar] = useState<PillarId>("students");
  const [hoveredPillar, setHoveredPillar] = useState<PillarId | null>(null);

  // Active showcase panel displays either hovered pillar or selected pillar
  const activeId = hoveredPillar || selectedPillar;
  const activeData = PILLARS.find((p) => p.id === activeId) || PILLARS[0];

  const handleSelectPillar = useCallback((id: PillarId) => {
    setSelectedPillar(id);
    const panel = document.getElementById("ecosystem-content-panel");
    if (panel) {
      const rect = panel.getBoundingClientRect();
      if (rect.bottom > window.innerHeight || rect.top < 80) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, []);

  const handleHoverPillar = useCallback((id: PillarId) => {
    setHoveredPillar(id);
  }, []);

  const handleLeavePillar = useCallback(() => {
    setHoveredPillar(null);
  }, []);

  const handleContainerLeave = useCallback(() => {
    setHoveredPillar(null);
  }, []);

  return (
    <ScrollSection
      id="ecosystem"
      ariaLabel="Three Words, One Unified Network"
      className="py-18 sm:py-24 md:py-28 px-4 sm:px-6 border-b border-[#222222]/[0.06] relative overflow-hidden"
    >
      {({ inView: isVisible }) => (
        <>
          {/* =========================================================================
              Preserved Section-Wide Color-Grading Environment Atmosphere:
              Student (Left, Cyan/Blue), Academia (Center, Purple), Industry (Right, Pink)
              ========================================================================= */}
          {/* Left Column: Student Ambient Grading */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-[4%] sm:left-[14%] top-1/2 -translate-y-1/2 h-[320px] sm:h-[500px] w-[220px] sm:w-[380px] max-w-full rounded-full blur-[70px] sm:blur-[130px] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hoveredPillar === "students"
                ? "opacity-35 dark:opacity-40"
                : "opacity-16 dark:opacity-20"
            }`}
            style={{
              backgroundColor: "#19B8E6",
            }}
          />

          {/* Center Column: Academia Ambient Grading */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[320px] sm:h-[500px] w-[220px] sm:w-[380px] max-w-full rounded-full blur-[70px] sm:blur-[130px] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hoveredPillar === "academia"
                ? "opacity-35 dark:opacity-40"
                : "opacity-16 dark:opacity-20"
            }`}
            style={{
              backgroundColor: "#743BFF",
            }}
          />

          {/* Right Column: Industry Ambient Grading */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-[4%] sm:right-[14%] top-1/2 -translate-y-1/2 h-[320px] sm:h-[500px] w-[220px] sm:w-[380px] max-w-full rounded-full blur-[70px] sm:blur-[130px] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hoveredPillar === "industry"
                ? "opacity-35 dark:opacity-40"
                : "opacity-16 dark:opacity-20"
            }`}
            style={{
              backgroundColor: "#FF2D95",
            }}
          />

          {/* Subtle Diffused Environmental Atmosphere */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 95% 65% at 50% 40%, rgba(116, 59, 255, 0.07) 0%, rgba(0, 123, 167, 0.05) 45%, rgba(255, 45, 149, 0.05) 80%, transparent 100%)",
            }}
          />

          <div
            className="mx-auto max-w-6xl relative z-10"
            onPointerLeave={handleContainerLeave}
          >
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              {/* Constant, Unchanging Original Neon Brand Gradient Heading */}
              <h2
                className={`scroll-reveal-expressive scroll-delay-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-[#CDCBCA] leading-[1.12] ${
                  isVisible ? "is-in-view" : ""
                }`}
              >
                Three Words,{" "}
                <span className="font-editorial text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#FF2D95] dark:from-[#19B8E6] dark:via-[#B57CFF] dark:to-[#FF2D95]">
                  One Unified Network
                </span>
              </h2>

              <p
                className={`scroll-reveal scroll-delay-2 mt-4 text-base sm:text-lg text-slate-600 dark:text-[#8E8C8B] leading-relaxed max-w-2xl mx-auto ${
                  isVisible ? "is-in-view" : ""
                }`}
              >
                SkillBridge eliminates institutional silos by giving Students, Academia, and Industry a shared workspace with aligned incentives.
              </p>
            </div>

            {/* 3 Interactive Pillar Selector Cards: Compact, Balanced, Deep Black Surfaces */}
            <div
              role="tablist"
              aria-label="SkillBridge Network Pillars"
              onPointerLeave={handleContainerLeave}
              className={`scroll-reveal scroll-delay-3 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-10 ${
                isVisible ? "is-in-view" : ""
              }`}
            >
              {PILLARS.map((pillar) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}
                  isHovered={hoveredPillar === pillar.id}
                  onSelect={() => handleSelectPillar(pillar.id)}
                  onHover={() => handleHoverPillar(pillar.id)}
                  onLeave={handleLeavePillar}
                />
              ))}
            </div>

            {/* Synchronized Portal Deep-Dive Showcase Panel */}
            <div
              id="ecosystem-content-panel"
              className={`rounded-3xl border bg-white dark:bg-[#0D0D0D] p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.10)] transition-[opacity,transform,border-color] duration-500 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                borderColor: `${activeData.primaryHex}35`,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Content */}
                <div className="lg:col-span-7 space-y-6">
                  <div
                    className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest border transition-colors duration-500 ${activeData.badgeBg} ${activeData.badgeText}`}
                  >
                    {activeData.icon}
                    <span>{activeData.title} Portal Experience</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-[#CDCBCA] tracking-tight leading-tight">
                    {activeData.tagline}
                  </h3>

                  <p className="text-base text-slate-600 dark:text-[#8E8C8B] leading-relaxed">
                    {activeData.description}
                  </p>

                  <ul className="space-y-3 pt-1">
                    {activeData.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 mt-0.5 transition-colors duration-300 ${activeData.badgeText}`}
                        />
                        <span className="text-sm sm:text-base text-[#0F172A] dark:text-[#CDCBCA] font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <Link
                      href={activeData.href}
                      className={`${activeData.ctaStyle.bg} ${activeData.ctaStyle.hoverBg} ${activeData.ctaStyle.textColor} px-7 py-3.5 rounded-xl font-bold text-sm inline-flex items-center gap-2.5 shadow-md transition-all active:scale-[0.98]`}
                    >
                      <span>Enter {activeData.title} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div
                      className={`flex items-center gap-6 px-4 py-2 rounded-xl border transition-colors duration-300 ${activeData.badgeBg}`}
                    >
                      {activeData.stats.map((st, i) => (
                        <div key={i}>
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#8E8C8B]">
                            {st.label}
                          </span>
                          <span
                            className={`text-sm font-bold ${activeData.badgeText}`}
                          >
                            <SpinningCounter value={st.value} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Visual Card */}
                <div className="lg:col-span-5">
                  <div
                    className="relative rounded-2xl overflow-hidden border bg-[#121212] aspect-[4/3] shadow-xl group transition-colors duration-500"
                    style={{
                      borderColor: `${activeData.primaryHex}35`,
                    }}
                  >
                    {PILLARS.map((pillar) => {
                      const isCurrent = pillar.id === activeData.id;
                      return (
                        <Image
                          key={pillar.id}
                          src={pillar.imageSrc}
                          alt={pillar.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className={`object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isCurrent
                              ? "opacity-95 scale-100 z-10"
                              : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                          }`}
                        />
                      );
                    })}
                    <div
                      data-keep-white="true"
                      className="absolute inset-0 z-20 bg-gradient-to-t from-[#080808]/90 via-[#080808]/30 to-transparent"
                    />
                    <div
                      data-keep-white="true"
                      className="absolute bottom-4 left-4 right-4 z-20 p-3.5 rounded-xl bg-[#080808]/85 backdrop-blur-md border border-white/15 flex items-center justify-between"
                    >
                      <div>
                        <span
                          className="text-[10px] font-mono uppercase tracking-widest block font-bold transition-colors duration-300"
                          style={{
                            color:
                              activeData.id === "students"
                                ? "#19B8E6"
                                : activeData.id === "academia"
                                ? "#B57CFF"
                                : "#FF2D95",
                          }}
                        >
                          Dedicated Environment
                        </span>
                        <span className="text-sm font-bold text-[#FFFFFF]">
                          SkillBridge {activeData.title} Hub
                        </span>
                      </div>
                      <Link
                        href={activeData.href}
                        aria-label={`Open ${activeData.title} Hub`}
                        className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-[#FFFFFF] transition-colors"
                        style={{
                          backgroundColor: activeData.primaryHex,
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ScrollSection>
  );
}

export default SectionEcosystem;
