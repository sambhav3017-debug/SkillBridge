"use client";

import HeroStage from "./hero/HeroStage";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("opportunity");
    if (target) {
      const header = document.querySelector("header");
      const headerHeight = header ? header.getBoundingClientRect().height : 70;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - headerHeight);

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      window.history.pushState(null, "", "#opportunity");
    }
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden min-h-screen min-h-[100dvh] flex flex-col justify-start lg:justify-center pt-[11.5vh] sm:pt-[13.5vh] lg:pt-[18vh] pb-16 sm:pb-20 lg:pb-24 select-none"
    >
      {/* 3D Cinematic Interactive Hero Experience ("The Hand That Becomes Your Bridge") */}
      <HeroStage />

      {/* Main Hero Content: Left Column Headline & Narrative */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 xs:px-6 sm:px-10 lg:px-16 pointer-events-none">
        <div className="max-w-[26rem] sm:max-w-[32rem] lg:max-w-[35rem] pointer-events-auto">
          {/* Eyebrow */}
          <div
            id="hero-eyebrow"
            className="rise d1 inline-flex items-center gap-1.5 sm:gap-2 tracking-[0.2em] sm:tracking-[0.22em] text-[0.68rem] sm:text-[0.8rem] font-semibold uppercase text-slate-600 dark:text-[#8E8C8B] select-none"
          >
            <span>{t.hero.eyebrow1}</span>
            <span className="opacity-45">/</span>
            <span>{t.hero.eyebrow2}</span>
            <span className="opacity-45">/</span>
            <span className="text-[#D41514] dark:text-[#D41514] font-bold">
              {t.hero.eyebrow3}
            </span>
          </div>

          {/* Headline: 'Your Skills.' and 'Our Bridge.' */}
          <h1
            id="hero-title"
            className="rise d2 mt-3 sm:mt-4 lg:mt-5 text-[clamp(2.05rem,5.2vw,5.15rem)] font-[800] leading-[1.04] tracking-[-0.038em]"
          >
            <span className="block text-[#0F172A] dark:text-[#CDCBCA]">
              {t.hero.titleLine1}
            </span>
            <span className="block mt-1 sm:mt-1.5">
              <span className="text-[#0F172A] dark:text-[#CDCBCA]">
                {t.hero.titleLine2Our}
              </span>{" "}
              <span className="text-[#D41514] dark:text-[#D41514]">
                {t.hero.titleLine2Bridge}
              </span>
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            id="hero-description"
            className="rise d3 mt-3.5 sm:mt-5 lg:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-700 dark:text-[#8E8C8B] max-w-[30rem]"
          >
            A complete ecosystem to learn, build and grow — from college to career.
          </p>

          {/* Primary CTA Button: Smooth Scroll to Opportunity Section */}
          <div className="rise d4 mt-5 sm:mt-7 lg:mt-9 flex items-center">
            <a
              id="hero-btn-primary"
              href="#opportunity"
              onClick={handleExploreClick}
              className="btn btn-crimson group px-5 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-base font-medium inline-flex items-center gap-2 cursor-pointer"
              aria-label="Explore Opportunity: Scroll down to discover SkillBridge pathways and verified opportunities"
            >
              <span>Explore Opportunity</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5 text-current"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Multi-Stop Atmospheric Color Grading Transition into Next Section */}
      <div
        id="hero-bottom-transition"
        aria-hidden="true"
        className="hero-bottom-color-grade pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 lg:h-44 z-[5]"
      />
    </section>
  );
}
