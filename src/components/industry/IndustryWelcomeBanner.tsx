"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Globe2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useInteractiveTilt } from "@/components/student/useInteractiveTilt";
import { getISTGreeting, getMsUntilNextISTBoundary } from "@/lib/utils/greeting";
import { VerificationBadge } from "./IndustryOnboardingWizard";
import IndustryEmblem3D from "./IndustryEmblem3D";
import type { VerificationState } from "@/lib/industry/types";

interface IndustryWelcomeBannerProps {
  company: {
    name: string;
    industry: string;
    headquarters?: string;
    verificationStatus: VerificationState;
  };
  recruiter: {
    name: string;
    role: string;
  };
}

export default function IndustryWelcomeBanner({
  company,
  recruiter,
}: IndustryWelcomeBannerProps) {
  // Dynamic time-based greeting strictly in Indian Standard Time (Asia/Kolkata)
  const [greeting, setGreeting] = useState<string>(() => getISTGreeting());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      const ms = getMsUntilNextISTBoundary();
      timeoutId = setTimeout(() => {
        setGreeting(getISTGreeting());
        scheduleNext();
      }, ms);
    };

    scheduleNext();

    // Periodic check every 30 seconds for clock drift or system resume
    const interval = setInterval(() => {
      const nextGreeting = getISTGreeting();
      setGreeting((prev) => (prev !== nextGreeting ? nextGreeting : prev));
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const recruiterFirstName = recruiter.name ? recruiter.name.trim().split(/\s+/)[0] : "";
  const fullGreetingText = recruiterFirstName ? `${greeting}, ${recruiterFirstName}` : greeting;

  const {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  } = useInteractiveTilt({
    maxDeg: 3.5,
    perspective: 1200,
    translateY: -2,
  });

  return (
    <section
      ref={cardRef}
      id="industry-welcome-banner"
      data-keep-white="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={fullGreetingText}
      style={transformStyle}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-7 outline-none transition-all duration-300 select-none ${
        tilt
          ? "shadow-[0_24px_60px_-15px_rgba(99,102,241,0.35)] dark:shadow-[0_24px_60px_-15px_rgba(6,182,212,0.35)]"
          : "shadow-[0_16px_40px_-12px_rgba(99,102,241,0.22)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* 1. HERO BACKGROUND: Accenture-inspired High-Performance Palette */}
      {/* Light Mode: Royal Indigo & Obsidian Sapphire; Dark Mode: Deep Midnight Void & Violet Cyber Glow */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] dark:from-[#070913] dark:via-[#0F172A] dark:to-[#05070E] transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Dramatic Ambient Light Blooms (Electric Violet, Cyber Cyan, and Warm Titanium) */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#6366F1]/25 blur-[90px] dark:bg-[#7C3AED]/20 dark:blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#06B6D4]/25 blur-[100px] dark:bg-[#007BA7]/20 dark:blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 h-64 w-64 rounded-full bg-[#38BDF8]/15 blur-[80px] dark:bg-[#6366F1]/15 dark:blur-[90px]"
        aria-hidden="true"
      />

      {/* Luminous Sweep Highlight across banner surface */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full animate-[shimmer_8s_infinite] select-none"
      />

      {/* 2. Dynamic Mouse-Synchronized Surface Illumination */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: tilt && !prefersReduced ? 1 : 0,
          background: `radial-gradient(550px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(255, 255, 255, 0.22) 0%, rgba(99, 102, 241, 0.15) 40%, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* 3. Top Specular Edge Highlight following cursor */}
      <div
        className="pointer-events-none absolute -top-px h-[2px] rounded-full transition-all duration-150 ease-out"
        style={{
          left: tilt && !prefersReduced ? `calc(${tilt.px}% - 90px)` : "calc(50% - 70px)",
          width: tilt && !prefersReduced ? "180px" : "140px",
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9) 50%, transparent)",
          opacity: tilt && !prefersReduced ? 1 : 0.5,
        }}
        aria-hidden="true"
      />

      {/* 4. HERO CONTENT */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 h-full text-white">
        <div className="flex-1 flex flex-col justify-between h-full min-w-0 pr-2">
          <div>
            {/* Status Badge & Company Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md shadow-xs">
                <Building2 size={13} className="text-white/90" /> {company.name}
              </span>
              <VerificationBadge status={company.verificationStatus} />
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs text-white/90 font-medium backdrop-blur-sm">
                {recruiter.role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 backdrop-blur-sm border border-emerald-400/30 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Talent Drive Active
              </span>
            </div>

            {/* Dynamic IST Greeting Headline */}
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
              aria-label={fullGreetingText}
            >
              <span className="text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">{greeting}</span>
              {recruiterFirstName ? (
                <>
                  ,{" "}
                  <span className="text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
                    {recruiterFirstName}
                  </span>
                </>
              ) : null}
            </h1>
          </div>

          {/* Floating Enterprise Dimension Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200 backdrop-blur-md shadow-xs">
              <ShieldCheck size={12} className="text-cyan-300" /> Tier 1 Employer
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200 backdrop-blur-md shadow-xs">
              <TrendingUp size={12} className="text-indigo-300" /> Talent Radar 98%
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md">
              <Globe2 size={11} className="text-white/80" /> {company.industry}
              {company.headquarters ? ` · ${company.headquarters}` : ""}
            </span>
          </div>

          <p className="mt-2.5 text-xs text-white/80 leading-relaxed max-w-lg">
            SkillBridge Enterprise Suite · Direct campus recruiting, verified student portfolios, and automated ATS pipeline.
          </p>
        </div>

        {/* Right Side: Custom 3D Industry Innovation Emblem */}
        <div className="hidden sm:flex items-center justify-center shrink-0 self-center">
          <IndustryEmblem3D size={210} className="transform-gpu drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
    </section>
  );
}
