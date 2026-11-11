"use client";

import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "./MotionHooks";

export default function DashboardPageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className={`relative w-full ${className}`}>
      {/* Level B Micro-Tracer Line beneath header on route change */}
      {!prefersReduced && (
        <div
          key={pathname + "-tracer"}
          className="pointer-events-none fixed left-0 right-0 top-[68px] z-30 h-[2px] overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-spatial-tracer h-full w-full bg-gradient-to-r from-transparent via-sb-cyan to-sb-pink" />
        </div>
      )}

      {/* Level B Fast Page Transition Container */}
      <div
        key={pathname}
        className={prefersReduced ? "w-full" : "animate-spatial-dashboard-enter w-full"}
      >
        {children}
      </div>
    </div>
  );
}
