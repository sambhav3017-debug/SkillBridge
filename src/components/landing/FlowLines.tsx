"use client";

import React from "react";

export default function FlowLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative -mb-px h-24 w-full overflow-hidden sm:h-32 bg-transparent">
      <svg viewBox="0 0 1600 140" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="fl-cyan" x1="0" x2="1">
            <stop offset="0%" stopColor="#19b8e6" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#19b8e6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fl-blue" x1="0" x2="1">
            <stop offset="15%" stopColor="#007ba7" stopOpacity="0" />
            <stop offset="50%" stopColor="#007ba7" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#007ba7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fl-pink" x1="0" x2="1">
            <stop offset="40%" stopColor="#ff2d95" stopOpacity="0" />
            <stop offset="100%" stopColor="#ff2d95" stopOpacity="0.9" />
          </linearGradient>
          <filter id="fl-glow" x="-5%" y="-50%" width="110%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g fill="none" strokeLinecap="round">
          <path d="M0 40 C 300 120, 600 10, 900 70 S 1400 110, 1600 60" stroke="url(#fl-cyan)" strokeWidth="6" filter="url(#fl-glow)" opacity="0.5" />
          <path d="M0 40 C 300 120, 600 10, 900 70 S 1400 110, 1600 60" stroke="url(#fl-cyan)" strokeWidth="1.2" />
          <path d="M0 90 C 400 20, 700 130, 1000 80 S 1450 40, 1600 90" stroke="url(#fl-blue)" strokeWidth="1" />
          <path d="M0 110 C 500 90, 900 20, 1200 60 S 1500 120, 1600 50" stroke="url(#fl-pink)" strokeWidth="6" filter="url(#fl-glow)" opacity="0.45" />
          <path d="M0 110 C 500 90, 900 20, 1200 60 S 1500 120, 1600 50" stroke="url(#fl-pink)" strokeWidth="1.2" />
          <path className="flow-dash" d="M0 40 C 300 120, 600 10, 900 70 S 1400 110, 1600 60" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
