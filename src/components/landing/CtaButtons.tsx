"use client";

import { useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CtaButtons() {
  const isScrollingRef = useRef(false);
  const { t } = useLanguage();

  const handleGetStarted = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isScrollingRef.current) return;

    const target = document.getElementById("ecosystem");
    if (!target) return;

    isScrollingRef.current = true;

    // Reset active pillar selection if any, ensuring no portal is preselected
    window.dispatchEvent(new CustomEvent("skillbridge:reset-ecosystem-pillar"));

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      isScrollingRef.current = false;
      return;
    }

    const navOffset = 64; // Comfort breathing room below top navbar
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Reset guard after smooth scroll completes (~900ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 900);
  }, []);

  return (
    <div className="flex items-center">
      <a
        id="hero-btn-primary"
        href="#ecosystem"
        onClick={handleGetStarted}
        className="btn btn-primary group cursor-pointer select-none px-5 py-2.5 text-sm font-medium"
        aria-label="Get Started: Explore Student, Academia, and Industry Portals"
      >
        <span>{t.hero.getStarted}</span>
        <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 text-current" aria-hidden="true" />
      </a>
    </div>
  );
}
