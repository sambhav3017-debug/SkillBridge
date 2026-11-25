"use client";

import React from "react";
import CinematicBridgeHero3D from "./CinematicBridgeHero3D";

/**
 * HeroStage: Houses the photorealistic 3D WebGL experience for the SkillBridge Hero Section
 * ("The Hand That Becomes Your Bridge"), backed by art-directed daylight and blue-hour
 * environmental horizon photography and a balanced left-column readability scrim.
 */
export default function HeroStage() {
  return (
    <div
      className="hero-stage absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#1c2b3e] dark:bg-[#080808] transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Light Mode Photorealistic Daylight Sky & Valley Horizon Plate (4K Ultra-HD Responsive) */}
      <picture className="pointer-events-none absolute inset-0 w-full h-full opacity-95 dark:opacity-0 transition-opacity duration-700">
        <source
          type="image/avif"
          srcSet="/hero/env-daylight-sky-1080.avif 1080w, /hero/env-daylight-sky-1920.avif 1920w, /hero/env-daylight-sky-4k.avif 3840w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/hero/env-daylight-sky-1080.webp 1080w, /hero/env-daylight-sky-1920.webp 1920w, /hero/env-daylight-sky-4k.webp 3840w"
          sizes="100vw"
        />
        <img
          src="/hero/env-daylight-sky.jpg"
          alt=""
          width={3840}
          height={2160}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </picture>

      {/* Dark Mode Photorealistic Blue-Hour Twilight Sky & Gorge Horizon Plate (4K Ultra-HD Responsive) */}
      <picture className="pointer-events-none absolute inset-0 w-full h-full opacity-0 dark:opacity-90 transition-opacity duration-700">
        <source
          type="image/avif"
          srcSet="/hero/env-evening-sky-1080.avif 1080w, /hero/env-evening-sky-1920.avif 1920w, /hero/env-evening-sky-4k.avif 3840w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/hero/env-evening-sky-1080.webp 1080w, /hero/env-evening-sky-1920.webp 1920w, /hero/env-evening-sky-4k.webp 3840w"
          sizes="100vw"
        />
        <img
          src="/hero/env-evening-sky.jpg"
          alt=""
          width={3840}
          height={2160}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </picture>

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
