"use client";

import React, { ReactNode } from "react";
import { useInView, usePrefersReducedMotion } from "@/components/motion/MotionHooks";

interface ScrollSectionProps {
  id?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  children: (props: { inView: boolean; prefersReduced: boolean }) => ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollSection({
  id,
  ariaLabel,
  className = "",
  style,
  children,
  threshold = 0.05,
  triggerOnce = false, // Repeatable on entry and re-entry
}: ScrollSectionProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>(
    { threshold, rootMargin: "60px 0px -40px 0px" },
    triggerOnce,
  );

  const isTriggered = prefersReduced || inView;

  return (
    <section
      id={id}
      ref={ref}
      aria-label={ariaLabel}
      style={style}
      data-in-view={isTriggered ? "true" : "false"}
      className={`relative w-full overflow-hidden ${isTriggered ? "is-in-view in-view" : ""} ${className}`}
    >
      {children({ inView: isTriggered, prefersReduced })}
    </section>
  );
}

export default ScrollSection;
