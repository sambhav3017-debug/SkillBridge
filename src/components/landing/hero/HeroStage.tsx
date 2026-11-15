"use client";

import React from "react";
import CinematicBridgeHero3D from "./CinematicBridgeHero3D";

/**
 * HeroStage: Houses the interactive 3D WebGL experience for the SkillBridge Hero Section
 * ("The Hand That Becomes Your Bridge"), along with theme-adaptive sky/horizon lighting
 * and a left-column readability scrim for both Light Mode and Dark Mode.
 */
export default function HeroStage() {
  return (
    <div
      className="hero-stage absolute inset-0 overflow-hidden pointer-events-none select-none bg-gradient-to-b from-[#F2EFE9] via-[#E4ECF5] to-[#D6E0EC] dark:from-[#080808] dark:via-[#0B0E14] dark:to-[#080808] transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Warm Architectural Sun Glow on Left (World A) in Light Mode */}
      <div
        className="pointer-events-none absolute left-[18%] top-[8%] h-[46vh] w-[42vw] rounded-full opacity-55 dark:opacity-15 blur-[95px] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, rgba(212, 21, 20, 0.05) 52%, transparent 74%)",
        }}
      />

      {/* Ambient Horizon Glow behind World B (Right Side) — Adapts to Light & Dark Mode */}
      <div
        className="pointer-events-none absolute right-[-5%] top-[12%] h-[58vh] w-[58vw] rounded-full opacity-60 dark:opacity-45 blur-[90px] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.20) 0%, rgba(212, 21, 20, 0.08) 48%, transparent 72%)",
        }}
      />

      {/* Interactive 3D Canvas Slot */}
      <div
        id="hero-media-slot"
        className="hero-media-slot absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      >
        <CinematicBridgeHero3D />
      </div>

      {/* Left-Column Readability Scrim (Desktop: Left gradient; Mobile: Top gradient) */}
      <div className="hero-grade pointer-events-none absolute inset-0 z-[2]" />
    </div>
  );
}
