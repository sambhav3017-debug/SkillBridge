"use client";

import React, { useState, useRef, memo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Code2,
  Microscope,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import ScrollSection from "./ScrollSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface DestinationItem {
  id: string;
  tag: string;
  title: string;
  badge: string;
  tagline: string;
  accent: "pink" | "purple" | "cyan" | "metallic";
  icon: typeof Code2;
  imageSrc: string;
  imageAlt: string;
  metricLabel: string;
  metricValue: string;
  href: string;
}

export const DESTINATIONS: DestinationItem[] = [
  {
    id: "capstones",
    tag: "PRODUCTION CODE",
    title: "Industry Capstones",
    badge: "Verified Briefs",
    tagline: "Ship production-grade systems evaluated by staff engineers.",
    accent: "pink", // Interchanged with Mentorship (formerly Mentorship pink)
    icon: Code2,
    imageSrc: "/pathways/industry-capstone.jpg",
    imageAlt:
      "University engineering students and researchers collaborating with technical prototype equipment in an applied industry research lab",
    metricLabel: "Code Review",
    metricValue: "Staff Engineers",
    href: "/student/opportunities",
  },
  {
    id: "research",
    tag: "ACADEMIC FRONTIER",
    title: "Research Fellowships",
    badge: "Faculty Directed",
    tagline: "Collaborate on frontier AI & peer-reviewed laboratory grants.",
    accent: "purple",
    icon: Microscope,
    imageSrc: "/pathways/research-fellowship.jpg",
    imageAlt:
      "Research fellow analyzing experimental telemetry on a laptop beside laboratory testing hardware",
    metricLabel: "Publication",
    metricValue: "Peer-Reviewed",
    href: "/academia",
  },
  {
    id: "mentorship",
    tag: "GUIDED GROWTH",
    title: "1-on-1 Mentorship",
    badge: "Verified Guides",
    tagline: "Direct architecture reviews & live career guidance from veterans.",
    accent: "cyan", // Interchanged with Capstones (formerly Capstones cyan)
    icon: Compass,
    imageSrc: "/pathways/one-on-one-mentor.jpg",
    imageAlt:
      "Senior mentor guiding a young software professional one-on-one through code on a laptop in a natural workspace",
    metricLabel: "Alignment",
    metricValue: "Skill-Matched",
    href: "/student",
  },
  {
    id: "careers",
    tag: "DIRECT HIRING",
    title: "Fast-Track Pipelines",
    badge: "Direct Placement",
    tagline: "Skip keyword resume screens through verified code evidence.",
    accent: "metallic", // Distinct, sophisticated dark metallic chrome identity
    icon: Rocket,
    imageSrc: "/pathways/fast-track-pipeline.jpg",
    imageAlt:
      "Young professional participating in a direct technical interview and career assessment with a recruitment lead in a modern workplace",
    metricLabel: "Evaluation",
    metricValue: "Code Signatures",
    href: "/student/opportunities",
  },
];

/* -------------------------------------------------------------------------- */
/* Individual Pathway Card Component                                          */
/* -------------------------------------------------------------------------- */

interface PathwayCardProps {
  dest: DestinationItem;
  isActive: boolean;
  isHovered: boolean;
  prefersReduced: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onLeave: () => void;
  onNavigate: (href: string) => void;
}

const PathwayCard = memo(function PathwayCard({
  dest,
  isActive,
  isHovered,
  prefersReduced,
  onSelect,
  onHover,
  onLeave,
  onNavigate,
}: PathwayCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [pointer, setPointer] = useState<{ px: number; py: number } | null>(null);

  const Icon = dest.icon;

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    onHover(dest.id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (prefersReduced || e.pointerType === "touch") return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPointer({ px, py });
    if (!isHovered) {
      onHover(dest.id);
    }
  };

  const handlePointerLeave = () => {
    setPointer(null);
    onLeave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(dest.id);
    }
  };

  // Distinct color tokens per pathway (activated exclusively on HOVER):
  // Capstones: Pink (#FF2D95)
  // Research: Purple (#743BFF / #B57CFF)
  // Mentorship: Cyan (#007BA7 / #19B8E6)
  // Fast-Track: Metallic Chrome / Titanium (#94A3B8 / #CDCBCA)
  const isPink = dest.accent === "pink";
  const isPurple = dest.accent === "purple";
  const isCyan = dest.accent === "cyan";
  const isMetallic = dest.accent === "metallic";

  const hoverCardSurface = isPink
    ? "border-2 border-[#FF2D95] bg-white dark:border-[#FF2D95] dark:bg-[#1E101A] ring-1 ring-[#FF2D95]/30 dark:ring-[#FF2D95]/40"
    : isPurple
    ? "border-2 border-[#743BFF] bg-white dark:border-[#B57CFF] dark:bg-[#161226] ring-1 ring-[#743BFF]/30 dark:ring-[#B57CFF]/40"
    : isCyan
    ? "border-2 border-[#007BA7] bg-white dark:border-[#19B8E6] dark:bg-[#0D1524] ring-1 ring-[#007BA7]/30 dark:ring-[#19B8E6]/40"
    : "border-2 border-slate-600 bg-white dark:border-[#CDCBCA] dark:bg-[#131418] ring-1 ring-slate-400/30 dark:ring-[#CDCBCA]/35";

  const hoverGlow = isPink
    ? "shadow-[0_16px_36px_-8px_rgba(255,45,149,0.24)] dark:shadow-[0_16px_40px_-8px_rgba(255,45,149,0.32)]"
    : isPurple
    ? "shadow-[0_16px_36px_-8px_rgba(116,59,255,0.24)] dark:shadow-[0_16px_40px_-8px_rgba(181,124,255,0.32)]"
    : isCyan
    ? "shadow-[0_16px_36px_-8px_rgba(0,123,167,0.24)] dark:shadow-[0_16px_40px_-8px_rgba(25,184,230,0.32)]"
    : "shadow-[0_16px_36px_-8px_rgba(100,116,139,0.24)] dark:shadow-[0_16px_40px_-8px_rgba(205,203,202,0.22)]";

  const iconHoverStyle = isPink
    ? "bg-[#FF2D95] border-[#FF2D95] text-white dark:bg-[#FF2D95] dark:border-[#FF2D95] dark:text-white shadow-[0_6px_16px_-3px_rgba(255,45,149,0.45)]"
    : isPurple
    ? "bg-[#743BFF] border-[#743BFF] text-white dark:bg-[#B57CFF] dark:border-[#B57CFF] dark:text-[#080A10] shadow-[0_6px_16px_-3px_rgba(116,59,255,0.45)]"
    : isCyan
    ? "bg-[#007BA7] border-[#007BA7] text-white dark:bg-[#19B8E6] dark:border-[#19B8E6] dark:text-[#080A10] shadow-[0_6px_16px_-3px_rgba(0,123,167,0.45)] dark:shadow-[0_6px_16px_-3px_rgba(25,184,230,0.55)]"
    : "bg-slate-700 border-slate-700 text-white dark:bg-[#CDCBCA] dark:border-[#CDCBCA] dark:text-[#080808] shadow-[0_6px_16px_-3px_rgba(100,116,139,0.45)]";

  const iconRestingStyle = "border-slate-200/80 bg-slate-100/80 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white";

  const badgeHoverStyle = isPink
    ? "bg-pink-500/10 text-[#FF2D95] dark:text-[#FF2D95] border border-pink-500/25"
    : isPurple
    ? "bg-purple-500/10 text-[#743BFF] dark:text-[#B57CFF] border border-purple-500/25"
    : isCyan
    ? "bg-cyan-500/10 text-[#007BA7] dark:text-[#19B8E6] border border-cyan-500/25"
    : "bg-slate-500/10 text-slate-700 dark:text-[#CDCBCA] border border-slate-400/30 dark:border-white/15";

  const badgeRestingStyle = "bg-slate-100/90 text-slate-600 border border-slate-200/80 dark:bg-white/5 dark:text-slate-400 dark:border-white/10";

  const accentTextStyle = isPink
    ? "text-[#FF2D95] dark:text-[#FF2D95]"
    : isPurple
    ? "text-[#743BFF] dark:text-[#B57CFF]"
    : isCyan
    ? "text-[#007BA7] dark:text-[#19B8E6]"
    : "text-slate-700 dark:text-[#CDCBCA]";

  const topSheenGradient = isPink
    ? "from-transparent via-[#FF2D95] dark:via-[#FF2D95] to-transparent"
    : isPurple
    ? "from-transparent via-[#743BFF] dark:via-[#B57CFF] to-transparent"
    : isCyan
    ? "from-transparent via-[#007BA7] dark:via-[#19B8E6] to-transparent"
    : "from-transparent via-slate-400 dark:via-[#CDCBCA] to-transparent";

  const specularGlow = isPink
    ? "rgba(255, 45, 149, 0.20)"
    : isPurple
    ? "rgba(116, 59, 255, 0.20)"
    : isCyan
    ? "rgba(0, 123, 167, 0.20)"
    : "rgba(205, 203, 202, 0.20)";

  const bottomAmbientGlow = isPink
    ? "bg-[#FF2D95]/20 dark:bg-[#FF2D95]/25"
    : isPurple
    ? "bg-[#743BFF]/20 dark:bg-[#B57CFF]/25"
    : isCyan
    ? "bg-[#007BA7]/20 dark:bg-[#19B8E6]/25"
    : "bg-slate-500/20 dark:bg-[#CDCBCA]/15";

  const focusRing = isPink
    ? "focus-visible:ring-[#FF2D95]"
    : isPurple
    ? "focus-visible:ring-[#743BFF]"
    : isCyan
    ? "focus-visible:ring-[#007BA7]"
    : "focus-visible:ring-slate-500 dark:focus-visible:ring-[#CDCBCA]";

  const imageFrameBorder = isHovered
    ? isPink
      ? "border-[#FF2D95]/40 dark:border-[#FF2D95]/50 shadow-[0_8px_20px_-8px_rgba(255,45,149,0.3)]"
      : isPurple
      ? "border-[#743BFF]/40 dark:border-[#B57CFF]/50 shadow-[0_8px_20px_-8px_rgba(116,59,255,0.3)]"
      : isCyan
      ? "border-[#007BA7]/40 dark:border-[#19B8E6]/50 shadow-[0_8px_20px_-8px_rgba(0,123,167,0.3)]"
      : "border-slate-400/40 dark:border-[#CDCBCA]/40 shadow-[0_8px_20px_-8px_rgba(100,116,139,0.25)]"
    : "border-slate-200/80 dark:border-white/10";

  return (
    <button
      ref={cardRef}
      id={`pathway-card-${dest.id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={`${dest.title} (${dest.badge}). ${dest.tagline}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={() => onHover(dest.id)}
      onBlur={() => onLeave()}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(dest.id)}
      onDoubleClick={() => onNavigate(dest.href)}
      style={{
        transform: prefersReduced
          ? "none"
          : isHovered
          ? "translateY(-5px) scale(1.015)"
          : "translateY(0) scale(1)",
        transition: prefersReduced
          ? "border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease"
          : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 300ms ease, background-color 300ms ease",
      }}
      className={`group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 text-left outline-none select-none cursor-pointer overflow-hidden active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 ${focusRing} ${
        isHovered
          ? `${hoverCardSurface} ${hoverGlow}`
          : isActive
          ? "border border-slate-300 dark:border-white/20 bg-white/95 dark:bg-white/[0.04] shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none"
          : "border border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/[0.03] shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)] dark:shadow-none"
      }`}
    >
      {/* Live Pointer Specular Sheen (Desktop) */}
      {pointer && !prefersReduced && isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-80 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 150px at ${pointer.px}% ${pointer.py}%, ${specularGlow}, transparent 72%)`,
          }}
        />
      )}

      {/* Top Edge Ambient Highlight Sheen (Hover Only) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-20 rounded-full transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        } bg-gradient-to-r ${topSheenGradient}`}
      />

      {/* Card Header: Icon & Category Badge */}
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 ${
              isHovered
                ? `${iconHoverStyle} scale-105`
                : `${iconRestingStyle} ${isActive ? "border-slate-300 dark:border-white/20 text-slate-800 dark:text-white" : ""}`
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider transition-colors duration-200 ${
              isHovered
                ? badgeHoverStyle
                : isActive
                ? "bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-white border border-slate-300/80 dark:border-white/15"
                : badgeRestingStyle
            }`}
          >
            {dest.badge}
          </span>
        </div>

        {/* Real Authentic Photography Frame */}
        <div
          className={`relative mt-3.5 w-full aspect-[16/10] rounded-xl border overflow-hidden bg-slate-100 dark:bg-white/5 transition-all duration-300 ${imageFrameBorder}`}
        >
          <Image
            src={dest.imageSrc}
            alt={dest.imageAlt}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 260px"
            className={`object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isHovered ? "scale-[1.04]" : "scale-100"
            }`}
          />
          {/* Restrained bottom-edge natural vignette for subtle depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent"
          />
        </div>

        {/* Pathway Title & Concise Punchy Tagline */}
        <div className="mt-3.5">
          <span
            className={`text-[0.62rem] font-extrabold uppercase tracking-widest transition-colors duration-200 ${
              isHovered
                ? accentTextStyle
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {dest.tag}
          </span>
          <h3
            className={`mt-0.5 text-base sm:text-lg font-bold leading-snug transition-colors duration-200 ${
              isHovered
                ? accentTextStyle
                : "text-[#0F172A] dark:text-[#F5F7FA]"
            }`}
          >
            {dest.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed line-clamp-2 text-slate-600 dark:text-slate-300">
            {dest.tagline}
          </p>
        </div>
      </div>

      {/* Card Footer: Key Metric Pill & Direct Exploration Action */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 w-full flex items-center justify-between text-xs transition-colors duration-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {dest.metricLabel}:
          </span>
          <span
            className={`font-semibold text-[0.7rem] ${
              isHovered
                ? accentTextStyle
                : "text-[#0F172A] dark:text-[#F5F7FA]"
            }`}
          >
            {dest.metricValue}
          </span>
        </div>

        <span
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(dest.href);
          }}
          className={`inline-flex items-center gap-1 font-bold transition-colors duration-200 ${
            isHovered
              ? accentTextStyle
              : "text-slate-600 dark:text-slate-300 group-hover:text-[#0F172A] dark:group-hover:text-white"
          }`}
        >
          <span>
            <span className="hidden sm:inline">{isActive ? "Active" : "Preview"}</span>
            <span className="sm:hidden">{isActive ? "Active" : "Tap"}</span>
          </span>
          <ArrowRight
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              isHovered
                ? `translate-x-1 ${accentTextStyle}`
                : "text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 group-hover:text-current"
            }`}
          />
        </span>
      </div>

      {/* Corner Ambient Glow: activates exclusively on hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        } ${bottomAmbientGlow}`}
      />
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* SectionOpportunity Main Container Component                                */
/* -------------------------------------------------------------------------- */

export function SectionOpportunity() {
  const [activeDest, setActiveDest] = useState<string>("capstones");
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const handleDestSelect = useCallback((id: string) => {
    setActiveDest((prev) => (prev === id ? prev : id));
  }, []);

  const handleDestHover = useCallback((id: string) => {
    setHoveredDest(id);
  }, []);

  const handleDestLeave = useCallback(() => {
    setHoveredDest(null);
  }, []);

  const handleContainerLeave = useCallback(() => {
    setHoveredDest(null);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  return (
    <ScrollSection
      id="opportunity"
      ariaLabel="Four Pathways to Accelerate Forward"
      className="opportunity-section-wrapper scroll-mt-20 py-24 sm:py-32 lg:py-36 border-b border-[#222222]/[0.06]"
    >
      {({ inView, prefersReduced }) => {
        const activeItem =
          DESTINATIONS.find((d) => d.id === activeDest) || DESTINATIONS[0];

        const hoveredItem = hoveredDest
          ? DESTINATIONS.find((d) => d.id === hoveredDest) || null
          : null;

        return (
          <>
            {/* Secondary anchor ID for #opportunities compatibility */}
            <div id="opportunities" className="sr-only" aria-hidden="true" />

            {/* Top Horizon Color-Grading Bridge from Hero Section */}
            <div
              id="opportunity-top-transition"
              aria-hidden="true"
              className="opportunity-top-color-grade pointer-events-none absolute inset-x-0 top-0 h-36 sm:h-48 lg:h-56"
            />

            <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
              {/* Ambient Background Light Cone: strictly controlled by HOVER state */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[540px] w-[880px] max-w-full rounded-full blur-[140px] transition-all duration-500 ease-out ${
                  hoveredItem
                    ? "opacity-25 dark:opacity-35 scale-100"
                    : "opacity-0 scale-95"
                } ${
                  hoveredItem?.accent === "pink"
                    ? "bg-[#FF2D95]"
                    : hoveredItem?.accent === "purple"
                    ? "bg-[#743BFF] dark:bg-[#B57CFF]"
                    : hoveredItem?.accent === "cyan"
                    ? "bg-[#007BA7] dark:bg-[#19B8E6]"
                    : hoveredItem?.accent === "metallic"
                    ? "bg-[#64748B] dark:bg-[#94A3B8]"
                    : "bg-transparent"
                }`}
              />

              {/* Header Content */}
              <div className="mx-auto max-w-3xl text-center">
                <h2
                  className={`scroll-reveal scroll-delay-1 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#0F172A] dark:text-[#CDCBCA] ${
                    inView ? "is-in-view" : ""
                  }`}
                >
                  {t.opportunities.title}{" "}
                  <span className="font-editorial text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#FF2D95]">
                    {t.opportunities.titleAccent}
                  </span>
                </h2>

                <p
                  className={`scroll-reveal scroll-delay-2 mt-4 sm:mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-[#8E8C8B] ${
                    inView ? "is-in-view" : ""
                  }`}
                >
                  {t.opportunities.subtitle}
                </p>

                <div
                  className={`scroll-reveal scroll-delay-3 mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3.5 ${
                    inView ? "is-in-view" : ""
                  }`}
                >
                  <Link
                    href="/student/opportunities"
                    className="btn btn-primary group px-5 py-2.5 text-sm font-medium"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-150 group-hover:translate-x-0.5 text-current"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link href="/student/projects" className="btn btn-glass group px-5 py-2.5 text-sm font-medium">
                    <span>Browse Projects</span>
                    <Code2 size={16} className="text-slate-400 group-hover:text-slate-200 transition-colors" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* 3D Perspective Stage: Architectural Pathway Showcase */}
              <div
                className={`relative mt-10 sm:mt-14 lg:mt-16 transition-all duration-1000 delay-300 ${
                  inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ perspective: "1200px" }}
              >
                {/* Elevated Stage Surface */}
                <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 dark:border-[rgba(205,203,202,0.12)] dark:bg-gradient-to-b dark:from-[#0E0E0E] dark:via-[#0A0A0A] dark:to-[#080808] p-3.5 sm:p-5 lg:p-6 lg:pb-16 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
                  {/* Subtle Architectural Perspective Grid Lines */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-25"
                  >
                    <svg
                      className="h-full w-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 1000 400"
                    >
                      <defs>
                        <linearGradient id="pathway-beam-v2" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#19B8E6" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#743BFF" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#FF2D95" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line
                        x1="500"
                        y1="400"
                        x2="500"
                        y2="30"
                        stroke="url(#pathway-beam-v2)"
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                      />
                      <line
                        x1="250"
                        y1="400"
                        x2="450"
                        y2="30"
                        stroke="currentColor"
                        className="text-[#007BA7] dark:text-[#19B8E6]/15"
                        strokeWidth="1"
                      />
                      <line
                        x1="750"
                        y1="400"
                        x2="550"
                        y2="30"
                        stroke="currentColor"
                        className="text-[#007BA7] dark:text-[#19B8E6]/15"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>

                  {/* 4 Interactive Pathway Cards */}
                  <div
                    role="tablist"
                    aria-label="SkillBridge Opportunity Pathways"
                    onPointerLeave={handleContainerLeave}
                    className="relative z-10 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 p-1"
                  >
                    {DESTINATIONS.map((dest) => (
                      <PathwayCard
                        key={dest.id}
                        dest={dest}
                        isActive={activeDest === dest.id}
                        isHovered={hoveredDest === dest.id}
                        prefersReduced={prefersReduced}
                        onSelect={handleDestSelect}
                        onHover={handleDestHover}
                        onLeave={handleDestLeave}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>

                  {/* Live Gateway Telemetry Bar */}
                  <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-3.5 sm:left-5 sm:right-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-[rgba(205,203,202,0.12)] bg-white/95 dark:bg-[#0D0D0D] px-4 py-2.5 text-xs backdrop-blur-md transition-colors duration-300 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-emerald-400" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Active Gateway:{" "}
                        <strong className={`font-semibold ${
                          activeItem.accent === "pink"
                            ? "text-[#FF2D95]"
                            : activeItem.accent === "purple"
                            ? "text-[#743BFF] dark:text-[#B57CFF]"
                            : activeItem.accent === "cyan"
                            ? "text-[#007BA7] dark:text-[#19B8E6]"
                            : "text-slate-700 dark:text-[#CDCBCA]"
                        }`}>
                          {activeItem.title}
                        </strong>
                      </span>
                      <span className="hidden md:inline text-neutral-400">•</span>
                      <span className="hidden md:inline text-slate-600 dark:text-slate-300 text-[0.72rem]">
                        {activeItem.tagline}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden lg:flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Real-Time Capability Match Ready</span>
                      </div>
                      <Link
                        href={activeItem.href}
                        className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all text-white shadow-2xs hover:shadow-xs active:scale-[0.98] ${
                          activeItem.accent === "pink"
                            ? "bg-[#FF2D95] hover:bg-[#E02682]"
                            : activeItem.accent === "purple"
                            ? "bg-[#743BFF] hover:bg-[#6025EA]"
                            : activeItem.accent === "cyan"
                            ? "bg-[#007BA7] hover:bg-[#00688F]"
                            : "bg-slate-800 hover:bg-slate-900 dark:bg-[#CDCBCA] dark:hover:bg-white dark:text-[#080808]"
                        }`}
                      >
                        <span>Open {activeItem.title}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }}
    </ScrollSection>
  );
}

export default SectionOpportunity;
