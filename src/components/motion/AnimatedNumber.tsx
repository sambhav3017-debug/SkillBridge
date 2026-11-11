"use client";

import React from "react";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

export interface AnimatedNumberProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  autoFormat?: boolean;
}

export default function AnimatedNumber({
  value,
  className = "",
  prefix = "",
  suffix = "",
  decimals,
  autoFormat = true,
}: AnimatedNumberProps) {
  return (
    <SpinningCounter
      value={value}
      prefix={prefix}
      suffix={suffix}
      className={`font-num tabular-nums tracking-[-0.02em] ${className}`}
      decimals={decimals}
      autoFormat={autoFormat}
    />
  );
}
