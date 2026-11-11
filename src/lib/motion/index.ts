/**
 * SkillBridge Motion & Animation System
 * Core helpers, easing functions, and celebration triggers.
 */

import confetti from "canvas-confetti";

export const EASING = {
  // Tesla / Apple style smooth cubic bezier
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  elastic: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.7, 0, 0.84, 0)",
} as const;

/** Brand color confetti burst for milestones (applications submitted, drives scheduled, placements confirmed) */
export function triggerMilestoneCelebration(origin = { x: 0.5, y: 0.6 }) {
  if (typeof window === "undefined") return;

  const count = 40;
  const defaults = {
    origin,
    disableForReducedMotion: true,
    colors: ["#19b8e6", "#007ba7", "#ff2d95", "#f5f7fa", "#ff7ab8"],
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.6),
    spread: 60,
    startVelocity: 35,
    scalar: 0.9,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.4),
    spread: 100,
    startVelocity: 45,
    scalar: 1.1,
  });
}
