"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useInteractiveTilt } from "@/components/student/useInteractiveTilt";

interface AcademiaKpiCard3DProps {
  href: string;
  title: string;
  value: ReactNode;
  subtitle: ReactNode;
  footerLeft: ReactNode;
  footerRightText?: string;
  icon: ReactNode;
  accentColor: "blue" | "indigo" | "emerald" | "purple";
  badgeText?: string;
  trendText?: string;
}

export default function AcademiaKpiCard3D({
  href,
  title,
  value,
  subtitle,
  footerLeft,
  footerRightText = "Explore →",
  icon,
  accentColor,
  badgeText,
  trendText,
}: AcademiaKpiCard3DProps) {
  const {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  } = useInteractiveTilt({
    maxDeg: 5,
    perspective: 900,
    translateY: -3,
  });

  // Dynamic styling by accent color
  const accentStyles = {
    blue: {
      borderHover: "hover:border-[#007BA7]/50 dark:hover:border-sb-cyan/50",
      glow: "hover:shadow-[0_16px_32px_-8px_rgba(0,123,167,0.22)]",
      iconBox:
        "border-[#007BA7]/30 bg-gradient-to-br from-[#007BA7]/20 to-[#007BA7]/5 text-[#007BA7] dark:border-sb-cyan/40 dark:bg-sb-cyan/15 dark:text-sb-cyan",
      badge: "bg-[#007BA7]/10 text-[#007BA7] dark:bg-sb-cyan/15 dark:text-sb-cyan border-[#007BA7]/20 dark:border-sb-cyan/30",
      highlight: "rgba(0, 123, 167, 0.15)",
      link: "text-[#007BA7] dark:text-sb-cyan",
    },
    indigo: {
      borderHover: "hover:border-[#4F46E5]/50 dark:hover:border-indigo-400/50",
      glow: "hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.22)]",
      iconBox:
        "border-[#4F46E5]/30 bg-gradient-to-br from-[#4F46E5]/20 to-[#4F46E5]/5 text-[#4F46E5] dark:border-indigo-400/40 dark:bg-indigo-950/40 dark:text-indigo-400",
      badge: "bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-indigo-950/40 dark:text-indigo-300 border-[#4F46E5]/20 dark:border-indigo-400/30",
      highlight: "rgba(79, 70, 229, 0.15)",
      link: "text-[#4F46E5] dark:text-indigo-400",
    },
    emerald: {
      borderHover: "hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
      glow: "hover:shadow-[0_16px_32px_-8px_rgba(16,185,129,0.22)]",
      iconBox:
        "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/30",
      highlight: "rgba(16, 185, 129, 0.15)",
      link: "text-emerald-600 dark:text-emerald-400",
    },
    purple: {
      borderHover: "hover:border-[#7C3AED]/50 dark:hover:border-purple-400/50",
      glow: "hover:shadow-[0_16px_32px_-8px_rgba(124,58,237,0.22)]",
      iconBox:
        "border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/5 text-[#7C3AED] dark:border-purple-400/40 dark:bg-purple-950/40 dark:text-purple-300",
      badge: "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-purple-950/40 dark:text-purple-300 border-[#7C3AED]/20 dark:border-purple-400/30",
      highlight: "rgba(124, 58, 237, 0.15)",
      link: "text-[#7C3AED] dark:text-purple-300",
    },
  }[accentColor];

  return (
    <Link
      href={href}
      className="block outline-none select-none group"
      title={`Click to open ${title}`}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={transformStyle}
        className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-gradient-to-br from-white/95 via-white/80 to-white/90 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent backdrop-blur-xl shadow-xs transition-all duration-300 ${accentStyles.borderHover} ${accentStyles.glow}`}
      >
        {/* Top Specular Rim */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25 select-none"
          aria-hidden="true"
        />

        {/* Dynamic Cursor Light Sheen */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: tilt && !prefersReduced ? 1 : 0,
            background: `radial-gradient(350px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, ${accentStyles.highlight} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Header: Title and 3D Icon */}
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sb-muted light:text-[#686868]">
              {title}
            </span>
            {badgeText ? (
              <span
                className={`mt-1 block w-fit rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${accentStyles.badge}`}
              >
                {badgeText}
              </span>
            ) : null}
          </div>

          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-110 ${accentStyles.iconBox}`}
          >
            {icon}
          </span>
        </div>

        {/* Big Metric Value and Subtitle */}
        <div className="relative z-10 mt-4 flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold font-num tracking-tight tabular-nums text-[var(--color-text)] drop-shadow-xs">
            {value}
          </span>
          <div className="text-right">
            <span className="text-xs font-medium text-sb-muted light:text-[#686868] block">
              {subtitle}
            </span>
            {trendText ? (
              <span className={`text-[10px] font-semibold tracking-tight ${accentStyles.link}`}>
                {trendText}
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Footer: Metadata and Action Link */}
        <div className="relative z-10 mt-3 flex items-center justify-between border-t border-[#E3E3E3] dark:border-[var(--glass-border)] pt-2.5 text-[11px] text-sb-muted light:text-[#686868]">
          <span className="truncate pr-2">{footerLeft}</span>
          <span
            className={`font-semibold shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${accentStyles.link}`}
          >
            {footerRightText}
          </span>
        </div>
      </div>
    </Link>
  );
}
