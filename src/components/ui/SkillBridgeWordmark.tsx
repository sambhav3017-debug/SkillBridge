"use client";

import React from "react";

export interface SkillBridgeWordmarkProps {
  className?: string;
  bridgeClassName?: string;
  portal?: "landing" | "student" | "industry" | "academia" | "auth" | "default";
  variant?: "loop" | "manual" | "static";
  isShown?: boolean;
  isHiding?: boolean;
}

/**
 * SkillBridgeWordmark
 *
 * Premium Brand Identity Wordmark for SkillBridge
 * Features:
 * - Distinctive typography powered by Outfit / Plus Jakarta Sans display weights
 * - Carefully calibrated tracking (-0.032em) and optical kerning
 * - Pure Chrome Silver / White "Skill" paired with Laser Crimson Red "Bridge" (in Dark Mode)
 * - Official Transitions.dev "Texts Reveal" synchronized motion loop
 * - Zero blur, perfectly crisp subpixel text antialiasing
 */
export function SkillBridgeWordmark({
  className = "",
  bridgeClassName,
  portal = "default",
  variant = "loop",
  isShown = true,
  isHiding = false,
}: SkillBridgeWordmarkProps) {
  // Resolve portal-specific brand accent styling for "Bridge" if bridgeClassName is not explicitly passed
  let resolvedBridgeClass = bridgeClassName;

  if (!resolvedBridgeClass) {
    switch (portal) {
      case "landing":
        resolvedBridgeClass = "text-[#007BA7] dark:text-[#D41514] transition-colors duration-200 group-hover:text-[#00688F] dark:group-hover:text-[#FF2D2D]";
        break;
      case "student":
      case "industry":
        resolvedBridgeClass = "dark:text-[#D41514] text-[#007BA7]";
        break;
      case "academia":
        resolvedBridgeClass = "text-[#007BA7] dark:text-[#D41514]";
        break;
      case "auth":
      default:
        resolvedBridgeClass = "text-[#007BA7] dark:text-[#D41514]";
        break;
    }
  }

  const baseTypography = "font-heading font-[750] tracking-[-0.032em] leading-none";

  if (variant === "static") {
    return (
      <span className={`inline-flex items-baseline select-none ${baseTypography} ${className}`}>
        <span className="text-[#141311] dark:text-[#FFFFFF] transition-colors">Skill</span>
        <span className={`${resolvedBridgeClass} ml-[0.5px]`}>Bridge</span>
      </span>
    );
  }

  if (variant === "manual") {
    return (
      <span
        className={`t-stagger ${isShown ? "is-shown" : ""} ${isHiding ? "is-hiding" : ""} inline-flex items-baseline select-none ${baseTypography} ${className}`}
        aria-label="SkillBridge"
      >
        <span className="t-stagger-line t-stagger-line--1 text-[#141311] dark:text-[#FFFFFF]">Skill</span>
        <span className={`t-stagger-line t-stagger-line--2 ${resolvedBridgeClass} ml-[0.5px]`}>Bridge</span>
      </span>
    );
  }

  // Default: Continuous official Texts Reveal loop
  return (
    <span
      className={`t-stagger-loop inline-flex items-baseline select-none ${baseTypography} ${className}`}
      aria-label="SkillBridge"
    >
      <span className="t-stagger-loop-line t-stagger-loop-line--1 text-[#141311] dark:text-[#FFFFFF]">
        Skill
      </span>
      <span className={`t-stagger-loop-line t-stagger-loop-line--2 ${resolvedBridgeClass} ml-[0.5px]`}>
        Bridge
      </span>
    </span>
  );
}

export default SkillBridgeWordmark;
