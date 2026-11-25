"use client";

import { useRef } from "react";
import HeroStage from "./hero/HeroStage";
import { ArrowRight, LogIn } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Smooth cinematic ease-in-out with a subtle, controlled damped spring settle
 * at the tail (max ~1.2% overshoot) matching SkillBridge's expressive motion language.
 */
function easeCinematicSpring(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < 0.78) {
    // Smooth quintic ease-in-out up to 78% progress
    const u = t / 0.78;
    const eased = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    return eased * 0.96;
  }
  // Controlled damped spring settle from 0.96 -> 1.012 -> 1.0
  const s = (t - 0.78) / 0.22;
  const decay = Math.exp(-5.2 * s);
  return 1 - 0.04 * decay * Math.cos(Math.PI * 1.35 * s);
}

export default function Hero() {
  const { t } = useLanguage();
  const scrollRafRef = useRef<number | null>(null);

  const handleScrollToEcosystem = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById("ecosystem");
    if (!section) return;

    // Cancel any in-flight programmatic scroll
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    // Compute layout offsetTop (unaffected by CSS entrance transforms like translate3d(0, 36px, 0))
    const heading = (section.querySelector("h2") as HTMLElement | null) || section;
    let layoutTop = 0;
    let node: HTMLElement | null = heading;
    while (node) {
      layoutTop += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }

    const isMobile = window.innerWidth < 768;
    const topBreathingRoom = isMobile ? 36 : 48;
    const targetTop = Math.max(0, layoutTop - topBreathingRoom);

    window.history.pushState(null, "", "#ecosystem");

    // Respect OS prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetTop, behavior: "auto" });
      return;
    }

    const startY = window.pageYOffset;
    const deltaY = targetTop - startY;
    if (Math.abs(deltaY) < 2) {
      window.scrollTo(0, targetTop);
      return;
    }

    const duration = Math.min(1250, Math.max(850, Math.abs(deltaY) * 0.42));
    let startTime: number | null = null;

    const cancelOnUserInput = () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("wheel", cancelOnUserInput);
      window.removeEventListener("touchstart", cancelOnUserInput);
      window.removeEventListener("keydown", cancelOnUserInput);
    };

    window.addEventListener("wheel", cancelOnUserInput, { passive: true, once: true });
    window.addEventListener("touchstart", cancelOnUserInput, { passive: true, once: true });
    window.addEventListener("keydown", cancelOnUserInput, { passive: true, once: true });

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeCinematicSpring(progress);

      window.scrollTo({ top: startY + deltaY * eased, behavior: "instant" as ScrollBehavior });

      if (progress < 1) {
        scrollRafRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo({ top: targetTop, behavior: "instant" as ScrollBehavior });
        scrollRafRef.current = null;
        cleanupListeners();
      }
    };

    scrollRafRef.current = requestAnimationFrame(step);
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
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#005F85] via-[#007BA7] to-[#0284C7] dark:from-[#00A8FF] dark:via-[#00E5FF] dark:to-[#70F0FF] dark:drop-shadow-[0_0_16px_rgba(0,229,255,0.24)]">
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

          {/* Hero CTA Stack: Primary Explore Opportunity + Secondary Login */}
          <div className="rise d4 mt-5 sm:mt-7 lg:mt-9 flex flex-col items-start gap-3 sm:gap-3.5">
            <a
              id="hero-btn-primary"
              href="#ecosystem"
              onClick={handleScrollToEcosystem}
              className="btn btn-crimson group px-5 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-base font-medium inline-flex items-center gap-2 cursor-pointer"
              aria-label="Explore Opportunity: Scroll down to Three Words, One Unified Network"
            >
              <span>Explore Opportunity</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5 text-current"
                aria-hidden="true"
              />
            </a>

            <a
              id="hero-btn-login"
              href="#ecosystem"
              onClick={handleScrollToEcosystem}
              className="btn group px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium inline-flex items-center gap-2 cursor-pointer backdrop-blur-md border border-[#007BA7]/45 bg-white/85 text-[#00688F] hover:border-[#007BA7] hover:bg-white hover:text-[#005070] hover:shadow-[0_6px_18px_-4px_rgba(0,123,167,0.28)] dark:border-[#00E5FF]/45 dark:bg-[#0A1019]/75 dark:text-[#E0F7FF] dark:hover:border-[#00E5FF]/85 dark:hover:bg-[#0E1724]/90 dark:hover:text-[#70F0FF] dark:hover:shadow-[0_0_22px_-4px_rgba(0,229,255,0.38)] active:scale-[0.985] transition-all duration-200"
              aria-label="Login: Scroll down to choose Student, Academia, or Industry portal"
            >
              <LogIn
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5 text-[#007BA7] dark:text-[#00E5FF]"
                aria-hidden="true"
              />
              <span>Login</span>
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
