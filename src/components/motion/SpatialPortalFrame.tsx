"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "./MotionHooks";

type PortalSection = "landing" | "student" | "industry" | "academia" | "legal" | "other";
type TransitionMode = "none" | "enter-portal" | "recede-portal" | "cross-portal";

function getPortalSection(path: string): PortalSection {
  if (path === "/") return "landing";
  if (path.startsWith("/student")) return "student";
  if (path.startsWith("/industry")) return "industry";
  if (path.startsWith("/academia")) return "academia";
  if (path.startsWith("/legal")) return "legal";
  return "other";
}

export default function SpatialPortalFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentSection = getPortalSection(pathname);
  const prevSectionRef = useRef<PortalSection>(currentSection);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>("none");
  const [transitionKey, setTransitionKey] = useState<string>(currentSection);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const prev = prevSectionRef.current;
    if (prev !== currentSection) {
      let mode: TransitionMode = "cross-portal";
      if (prev === "landing" && currentSection !== "landing") {
        mode = "enter-portal";
      } else if (prev !== "landing" && currentSection === "landing") {
        mode = "recede-portal";
      } else {
        mode = "cross-portal";
      }

      setTransitionMode(mode);
      setTransitionKey(currentSection + "-" + Date.now());
      prevSectionRef.current = currentSection;

      // Reset transition state after animation finishes
      const timer = window.setTimeout(() => {
        setTransitionMode("none");
      }, 540);
      return () => window.clearTimeout(timer);
    }
  }, [currentSection]);

  const getAnimationClass = () => {
    if (prefersReduced || transitionMode === "none") return "";
    switch (transitionMode) {
      case "enter-portal":
        return "animate-spatial-portal-enter";
      case "recede-portal":
        return "animate-spatial-portal-recede";
      case "cross-portal":
        return "animate-spatial-portal-cross";
      default:
        return "";
    }
  };

  const showSweep = !prefersReduced && transitionMode !== "none";

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      {/* Level A: Glass Reflection & Dual Neon Light Sweep Overlay */}
      {showSweep && (
        <div
          key={transitionKey + "-sweep"}
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-spatial-glass-sweep absolute -inset-y-20 -left-1/4 w-[150vw] spatial-sweep-beam blur-[2px]" />
        </div>
      )}

      {/* Main 3D Spatial Perspective Stage */}
      <div
        key={transitionKey}
        className={`spatial-perspective-stage min-h-screen w-full ${
          transitionMode !== "none" ? "is-transitioning" : ""
        } ${getAnimationClass()}`}
      >
        {children}
      </div>
    </div>
  );
}
