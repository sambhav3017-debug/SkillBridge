"use client";

import React, { useEffect, useState, useRef } from "react";

interface NotificationBadgeRemixProps {
  count: number;
  max?: number;
  className?: string;
}

/**
 * Transaction.dev Notification Badge Remix
 *
 * Implements exact reference motion tokens:
 * - Badge slide-in duration: 260ms (cubic-bezier(0.22, 1, 0.36, 1))
 * - Badge scale-in duration: 500ms (cubic-bezier(0.34, 1.36, 0.64, 1) gentle bounce)
 * - Badge scale-out duration: 180ms (cubic-bezier(0.4, 0, 0.2, 1))
 * - Badge opacity-in duration: 400ms
 * - Badge opacity-out duration: 180ms
 * - Initial offsets: x = -8.2px, y = 12.4px
 * - Initial blur: 2px -> 0px
 * - Full prefers-reduced-motion fallback
 */
export function NotificationBadgeRemix({
  count,
  max = 99,
  className = "",
}: NotificationBadgeRemixProps) {
  const [isRendered, setIsRendered] = useState(() => count > 0);
  const [animState, setAnimState] = useState<"entering" | "entered" | "updating" | "exiting">(() =>
    count > 0 ? "entering" : "exiting"
  );
  const [displayedCount, setDisplayedCount] = useState(count);
  const prevCountRef = useRef(count);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = count;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (count > 0 && prevCount === 0) {
      // Transition from 0 -> positive: trigger entrance animation
      setDisplayedCount(count);
      setIsRendered(true);
      setAnimState("entering");
      timerRef.current = setTimeout(() => {
        setAnimState("entered");
      }, 500); // 500ms scale-in duration completes
    } else if (count === 0 && prevCount > 0) {
      // Transition from positive -> 0: trigger scale-out/exit animation
      setAnimState("exiting");
      timerRef.current = setTimeout(() => {
        setIsRendered(false);
        setDisplayedCount(0);
      }, 180); // 180ms scale-out duration completes
    } else if (count > 0 && prevCount > 0 && count !== prevCount) {
      // Count changed while badge is visible: trigger update pulse
      setDisplayedCount(count);
      setAnimState("updating");
      timerRef.current = setTimeout(() => {
        setAnimState("entered");
      }, 320);
    } else if (count > 0 && animState === "entering") {
      timerRef.current = setTimeout(() => {
        setAnimState("entered");
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [count, animState]);

  if (!isRendered && count === 0) {
    return null;
  }

  const label =
    displayedCount > max ? `${max}+` : `${displayedCount}`;

  return (
    <span
      className={`notification-badge-remix ${
        animState === "entering"
          ? "is-entering"
          : animState === "exiting"
          ? "is-exiting"
          : animState === "updating"
          ? "is-updating"
          : "is-entered"
      } ${className}`}
      aria-hidden="true"
      data-count={displayedCount}
    >
      <span>{label}</span>
    </span>
  );
}

export default NotificationBadgeRemix;
