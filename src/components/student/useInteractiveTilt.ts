"use client";

import { useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

export interface TiltState {
  x: number;
  y: number;
  px: number;
  py: number;
}

export interface InteractiveTiltOptions {
  maxDeg?: number;
  perspective?: number;
  translateY?: number;
}

export function useInteractiveTilt({
  maxDeg = 7,
  perspective = 1000,
  translateY = -2,
}: InteractiveTiltOptions = {}) {
  const [tilt, setTilt] = useState<TiltState | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    if (e.pointerType === "touch") return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      // Restrained, controlled perspective tilt
      const rotateX = (0.5 - y) * maxDeg;
      const rotateY = (x - 0.5) * maxDeg;

      setTilt({
        x: rotateX,
        y: rotateY,
        px: Math.round(x * 100),
        py: Math.round(y * 100),
      });
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt(null);
  };

  const transformStyle: React.CSSProperties = {
    transform:
      tilt && !prefersReduced
        ? `perspective(${perspective}px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateY(${translateY}px)`
        : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateY(0)`,
    transition: tilt
      ? "transform 90ms ease-out"
      : "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1), border-color 450ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  };
}
