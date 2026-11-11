"use client";

import React from "react";
import { NotificationBadgeRemix } from "./NotificationBadgeRemix";

/**
 * Minimalist Outline Bell Icon with refined stroke weight and proportions
 * matching Transaction.dev specification
 */
export function NotificationBellIcon({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export interface NotificationBellButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count: number;
  isOpen?: boolean;
  portalVariant?: "student" | "academia" | "industry";
  ariaLabel?: string;
}

/**
 * Transaction.dev Inspired Notification Bell Trigger Button
 *
 * - Perfectly centered 18px outline bell icon with 1.8 stroke
 * - Premium circular container with subtle glass surface & borders
 * - Upper-right positioned NotificationBadgeRemix with smooth entrance & exit
 * - Accessible keyboard focus indicators & ARIA attributes
 */
export const NotificationBellButton = React.forwardRef<
  HTMLButtonElement,
  NotificationBellButtonProps
>(
  (
    {
      count,
      isOpen = false,
      portalVariant = "student",
      ariaLabel,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const computedAriaLabel =
      ariaLabel ||
      `Notifications${count > 0 ? `, ${count} unread` : ""}`;

    // Portal-specific subtle hover accent border & glow matching SkillBridge brand identity
    const hoverPortalStyle =
      portalVariant === "academia"
        ? "hover:border-[#743BFF]/50 hover:text-[#743BFF] dark:hover:border-[#B57CFF]/50 dark:hover:text-[#B57CFF] dark:hover:shadow-[0_0_16px_rgba(116,59,255,0.25)]"
        : portalVariant === "industry"
        ? "hover:border-[#FF2D95]/50 hover:text-[#FF2D95] dark:hover:border-[#FF2D95]/50 dark:hover:text-[#FF2D95] dark:hover:shadow-[0_0_16px_rgba(255,45,149,0.25)]"
        : "hover:border-[#007BA7]/50 hover:text-[#007BA7] dark:hover:border-[#19B8E6]/50 dark:hover:text-[#19B8E6] dark:hover:shadow-[0_0_16px_rgba(25,184,230,0.25)]";

    const focusPortalStyle =
      portalVariant === "academia"
        ? "focus-visible:ring-[#743BFF]/50"
        : portalVariant === "industry"
        ? "focus-visible:ring-[#FF2D95]/50"
        : "focus-visible:ring-[#007BA7]/50";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={computedAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`relative grid h-10 w-10 place-items-center rounded-full border cursor-pointer select-none transition-all duration-200 active:scale-[0.96] border-slate-200/90 bg-white/80 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl hover:bg-white dark:border-white/12 dark:bg-white/[0.05] dark:text-slate-200 dark:shadow-[0_2px_10px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:bg-white/[0.09] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#080A10] ${hoverPortalStyle} ${focusPortalStyle} ${className}`}
        {...props}
      >
        <NotificationBellIcon size={18} />
        <NotificationBadgeRemix
          count={count}
          className="absolute -top-1 -right-1"
        />
      </button>
    );
  }
);

NotificationBellButton.displayName = "NotificationBellButton";

export default NotificationBellButton;
