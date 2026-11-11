"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Briefcase, Landmark } from "lucide-react";
import ScrollSection from "./ScrollSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SectionClosingCta() {
  const { t } = useLanguage();

  return (
    <ScrollSection id="cta" className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      {({ inView }) => (
        <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 text-center">
          {/* Cinematic Perspective Horizon Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
          >
            {/* Ambient Radial Gradient Halo */}
            <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-t from-[#007BA7]/20 via-[#743BFF]/20 to-[#D81B7A]/20 blur-[120px] dark:from-[#19B8E6]/25 dark:via-[#B57CFF]/25 dark:to-[#FF2D95]/25" />

            {/* Perspective Horizon Sun / Glow */}
            <div className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-blue-500/10 via-transparent to-transparent" />

            {/* Horizon Converging Grid Lines */}
            <svg
              className="absolute bottom-0 h-[320px] w-full max-w-[1200px] opacity-30 dark:opacity-25"
              preserveAspectRatio="none"
              viewBox="0 0 1000 300"
            >
              <line x1="500" y1="0" x2="0" y2="300" stroke="#19B8E6" strokeWidth="1.5" />
              <line x1="500" y1="0" x2="200" y2="300" stroke="#19B8E6" strokeWidth="1" />
              <line x1="500" y1="0" x2="380" y2="300" stroke="#B57CFF" strokeWidth="1.5" />
              <line x1="500" y1="0" x2="500" y2="300" stroke="#FF2D95" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="500" y1="0" x2="620" y2="300" stroke="#B57CFF" strokeWidth="1.5" />
              <line x1="500" y1="0" x2="800" y2="300" stroke="#19B8E6" strokeWidth="1" />
              <line x1="500" y1="0" x2="1000" y2="300" stroke="#19B8E6" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Heading */}
          <h2
            className={`scroll-reveal scroll-delay-1 mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-[#161B2E] dark:text-[#CDCBCA] ${
              inView ? "is-in-view" : ""
            }`}
          >
            {t.closingCta.titleLine1}{" "}
            <span className="font-editorial block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#D81B7A] dark:from-[#19B8E6] dark:via-[#B57CFF] dark:to-[#FF2D95]">
              {t.closingCta.titleLine2}
            </span>
          </h2>

          {/* Description */}
          <p
            className={`scroll-reveal scroll-delay-2 mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#434D62] dark:text-[#8E8C8B] ${
              inView ? "is-in-view" : ""
            }`}
          >
            {t.closingCta.subtitle}
          </p>

          {/* High-Impact Action CTAs */}
          <div
            className={`scroll-reveal scroll-delay-3 mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3.5 ${
              inView ? "is-in-view" : ""
            }`}
          >
            <Link
              href="/student/signup"
              id="closing-cta-btn-primary"
              className="btn btn-crimson group px-6 py-3 text-sm font-medium"
            >
              <span>{t.closingCta.primaryBtn}</span>
              <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 text-current" aria-hidden="true" />
            </Link>

            <Link
              href="/student"
              id="closing-cta-btn-glass"
              className="btn btn-glass group px-5 py-3 text-sm font-medium"
            >
              <span>{t.closingCta.secondaryBtn}</span>
              <GraduationCap size={16} className="text-slate-400 group-hover:text-slate-200 transition-colors" aria-hidden="true" />
            </Link>
          </div>

          {/* Quick Portal Switcher Pills */}
          <div
            className={`mt-12 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/60 p-2 text-xs font-semibold backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03] transition-all duration-700 delay-400 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-neutral-500 dark:text-neutral-400 px-2">Explore Portals:</span>
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 active:scale-95 transition-all duration-200"
            >
              <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
              <span>Students</span>
            </Link>
            <Link
              href="/industry"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 active:scale-95 transition-all duration-200"
            >
              <Briefcase className="h-3.5 w-3.5 text-pink-500" />
              <span>Industry</span>
            </Link>
            <Link
              href="/academia"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 active:scale-95 transition-all duration-200"
            >
              <Landmark className="h-3.5 w-3.5 text-purple-500" />
              <span>Academia</span>
            </Link>
          </div>
        </div>
      )}
    </ScrollSection>
  );
}
