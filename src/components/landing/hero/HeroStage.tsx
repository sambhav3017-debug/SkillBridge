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
      className="hero-stage absolute inset-0 overflow-hidden pointer-events-none select-none bg-gradient-to-b from-[#F4F8FD] via-[#E9F1FA] to-[#F8FAFC] dark:from-[#080808] dark:via-[#0B0E14] dark:to-[#080808] transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Ambient Horizon Glow behind World B (Right Side) — Adapts to Light & Dark Mode */}
      <div
        className="pointer-events-none absolute right-[-5%] top-[12%] h-[58vh] w-[58vw] rounded-full opacity-70 dark:opacity-45 blur-[90px] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(212, 21, 20, 0.10) 48%, transparent 72%)",
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
