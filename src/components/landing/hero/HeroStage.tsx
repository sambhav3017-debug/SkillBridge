"use client";

import React from "react";
import CinematicBridgeHero3D from "./CinematicBridgeHero3D";

/**
 * HeroStage: Houses the interactive 3D WebGL experience for the initial Hero Section.
 * Renders the monumental bridge, descending opportunity gateway, walking students,
 * and mouse-responsive cinematic perspective.
 */
export default function HeroStage() {
  return (
    <div
      className="hero-stage absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#F8FAFC] dark:bg-[#080808]"
      aria-hidden="true"
    >
      <div
        id="hero-media-slot"
        className="hero-media-slot absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      >
        <CinematicBridgeHero3D />
      </div>
    </div>
  );
}
