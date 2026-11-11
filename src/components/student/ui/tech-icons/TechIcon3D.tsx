"use client";

import React, { useRef, useState } from "react";
import { getTechIconMeta } from "./tech-icons-data";

interface TechIcon3DProps {
  nameOrId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLighting?: boolean;
}

export function TechIcon3D({
  nameOrId,
  size = "md",
  className = "",
  showLighting = true,
}: TechIcon3DProps) {
  const iconMeta = getTechIconMeta(nameOrId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  // Size variations
  const sizeMap = {
    sm: {
      container: "h-9 w-9 rounded-xl p-1.5",
      iconSize: 18,
      perspective: "perspective(300px)",
    },
    md: {
      container: "h-11 w-11 rounded-2xl p-2",
      iconSize: 22,
      perspective: "perspective(400px)",
    },
    lg: {
      container: "h-14 w-14 rounded-2xl p-2.5",
      iconSize: 28,
      perspective: "perspective(500px)",
    },
    xl: {
      container: "h-16 w-16 rounded-3xl p-3",
      iconSize: 34,
      perspective: "perspective(600px)",
    },
  }[size];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate subtle tilt angle (-12deg to 12deg)
    const rotateY = (x / (rect.width / 2)) * 10;
    const rotateX = -(y / (rect.height / 2)) * 10;
    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative grid place-items-center shrink-0 border border-black/[0.08] dark:border-white/10 bg-gradient-to-br ${iconMeta.gradient} dark:${iconMeta.darkGradient || iconMeta.gradient} shadow-sm backdrop-blur-md transition-all duration-300 ease-out select-none ${sizeMap.container} ${className}`}
      style={{
        transform: hovered
          ? `${sizeMap.perspective} rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
          : `${sizeMap.perspective} rotateX(0deg) rotateY(0deg) translateY(0px)`,
        boxShadow: hovered
          ? `0 12px 24px -6px ${iconMeta.shadowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.4)`
          : `0 4px 10px -2px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.2)`,
      }}
      title={iconMeta.name}
    >
      {/* Top 3D Specular Rim Light */}
      {showLighting && (
        <div className="pointer-events-none absolute inset-x-1 top-0 h-[1.5px] rounded-t-full bg-gradient-to-r from-transparent via-white/70 dark:via-white/30 to-transparent" />
      )}

      {/* SVG Technology Logo */}
      <svg
        viewBox={iconMeta.viewBox || "0 0 24 24"}
        width={sizeMap.iconSize}
        height={sizeMap.iconSize}
        className="transition-transform duration-300 ease-out drop-shadow-xs"
        style={{
          transform: hovered ? "translateZ(10px) scale(1.08)" : "translateZ(0px) scale(1)",
        }}
      >
        {iconMeta.svgPath}
      </svg>
    </div>
  );
}
