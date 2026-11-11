"use client";

import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

/**
 * AcademiaAmbientBackground
 * 
 * Provides a distinctive academic atmosphere:
 * - Electric Blue (#007BA7 / #19B8E6)
 * - Deep Royal Indigo & Violet (#4F46E5 / #7C3AED / #312E81)
 * - Subtle Amber/Cyan focal light blooms (#F59E0B / #06B6D4)
 * - Drifting luminous ambient orbs with gentle harmonic floating
 * - Soft tinted ambient color washes and refined micro-grid grain texture
 * - Absolute background layering (-z-10) with pointer-events-none
 */
export default function AcademiaAmbientBackground() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-[#080808]"
      aria-hidden="true"
    >
      {/* 1. Base Gradient Canvas Wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.06),rgba(255,255,255,0))] dark:bg-[#080808]" />

      {/* 2. Top-Left Primary Academic Bloom (Subtle Chrome Silver & Laser Crimson) */}
      <div
        className={`absolute -top-32 -left-24 h-[550px] w-[550px] rounded-full blur-[130px] transition-all duration-1000 ${
          prefersReduced ? "opacity-30" : "animate-pulse-slow"
        } bg-gradient-to-br from-[#4F46E5]/18 via-[#007BA7]/12 to-transparent dark:from-[rgba(205,203,202,0.03)] dark:via-[rgba(212,21,20,0.025)] dark:to-transparent`}
        style={{ animationDuration: "14s" }}
      />

      {/* 3. Top-Right Secondary Bloom (Restrained Chrome Silver Depth) */}
      <div
        className={`absolute top-12 -right-28 h-[600px] w-[600px] rounded-full blur-[140px] transition-all duration-1000 ${
          prefersReduced ? "opacity-25" : "animate-float-slow"
        } bg-gradient-to-bl from-[#7C3AED]/14 via-[#6366F1]/10 to-transparent dark:from-[rgba(205,203,202,0.025)] dark:via-transparent dark:to-transparent`}
        style={{ animationDuration: "18s" }}
      />

      {/* 4. Center-Right Ambient Shimmer */}
      <div
        className={`absolute top-[45%] -right-16 h-[480px] w-[480px] rounded-full blur-[120px] transition-all duration-1000 ${
          prefersReduced ? "opacity-20" : "animate-float"
        } bg-gradient-to-br from-[#06B6D4]/12 via-[#007BA7]/8 to-transparent dark:from-[rgba(205,203,202,0.02)] dark:via-transparent dark:to-transparent`}
        style={{ animationDuration: "22s" }}
      />

      {/* 5. Lower-Left Subtle Laser Crimson Focus */}
      <div
        className={`absolute bottom-[-10%] -left-20 h-[500px] w-[500px] rounded-full blur-[130px] transition-all duration-1000 ${
          prefersReduced ? "opacity-20" : "animate-float-reverse"
        } bg-gradient-to-tr from-[#F59E0B]/10 via-[#EC4899]/8 to-transparent dark:from-[rgba(212,21,20,0.02)] dark:via-transparent dark:to-transparent`}
        style={{ animationDuration: "20s" }}
      />

      {/* 6. Subtle Technical Architectural Grid Overlay for Academic Rigor */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#007BA708_1px,transparent_1px),linear-gradient(to_bottom,#007BA708_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(205,203,202,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(205,203,202,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] opacity-60 dark:opacity-30"
      />
    </div>
  );
}
