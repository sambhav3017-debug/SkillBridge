import React from "react";

export interface TechIconMeta {
  id: string;
  name: string;
  category: string;
  brandColor: string; // Hex or CSS color
  secondaryColor?: string;
  gradient: string; // Tailwind gradient for 3D container background
  darkGradient?: string;
  shadowColor: string; // rgba or hex shadow
  svgPath: React.ReactNode; // SVG path or elements
  viewBox?: string;
}
