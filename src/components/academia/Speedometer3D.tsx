"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

export interface SpeedometerMetricOption {
  id: string;
  label: string;
  shortLabel: string;
  value: number; // 0 to 100
  subtitle: string;
  targetBenchmark: number;
  accreditationThreshold: number;
  category: string;
  detail: string;
}

interface MinimalistGaugeProps {
  metrics: SpeedometerMetricOption[];
  activeMetricId: string;
  onSelectMetric: (id: string) => void;
  institutionName: string;
}

export default function Speedometer3D({
  metrics,
  activeMetricId,
  onSelectMetric,
  institutionName,
}: MinimalistGaugeProps) {
  const gradientId = useId();
  const prefersReduced = usePrefersReducedMotion();

  const currentOption = useMemo(() => {
    return (
      metrics.find((m) => m.id === activeMetricId) ||
      metrics[0] || {
        id: "default",
        label: "Academic Progress",
        shortLabel: "Progress",
        value: 0,
        subtitle: "No data available",
        targetBenchmark: 75,
        accreditationThreshold: 60,
        category: "General",
        detail: "Institutional performance metric",
      }
    );
  }, [metrics, activeMetricId]);

  // Clamped real target percentage: 0 to 100
  const targetVal = useMemo(() => {
    const raw = Number(currentOption.value);
    if (isNaN(raw)) return 0;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [currentOption.value]);

  const [replayKey, setReplayKey] = useState(0);
  const [needleVal, setNeedleVal] = useState(0);
  const [arcVal, setArcVal] = useState(0);
  const [displayNum, setDisplayNum] = useState(0);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [isSettled, setIsSettled] = useState(false);

  // EXACT 4-STAGE MINIMALIST ANIMATION SEQUENCE (Total ~2.8s)
  // Stage 1 (0ms-150ms): Zero state (needle at 0, arc at 0, number at 0)
  // Stage 2 (150ms-850ms): First progress reveal (0 -> targetVal)
  // Stage 2 Hold (850ms-1100ms): Pause at actual progress
  // Stage 3a (1100ms-1450ms): Smooth return to 0%
  // Stage 3b (1450ms-2150ms): Full-scale sweep from 0% -> 100%
  // Stage 3 Hold (2150ms-2350ms): Brief hold at 100%
  // Stage 4 (2350ms-3050ms): Final settle smoothly from 100% -> targetVal
  useEffect(() => {
    let rafId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (prefersReduced) {
        setNeedleVal(targetVal);
        setArcVal(targetVal);
        setDisplayNum(targetVal);
        setStage(4);
        setIsSettled(true);
        return;
      }

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < 150) {
        // Stage 1: Initial Zero State
        setStage(1);
        setNeedleVal(0);
        setArcVal(0);
        setDisplayNum(0);
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 850) {
        // Stage 2: First progress reveal toward actual progress (0 -> targetVal)
        setStage(2);
        const t = (elapsed - 150) / 700;
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const current = ease * targetVal;
        setNeedleVal(current);
        setArcVal(current);
        setDisplayNum(Math.round(current));
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 1100) {
        // Stage 2 Hold: Pause at actual progress
        setStage(2);
        setNeedleVal(targetVal);
        setArcVal(targetVal);
        setDisplayNum(targetVal);
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 1450) {
        // Stage 3a: Smooth return to 0%
        setStage(3);
        const t = (elapsed - 1100) / 350;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const current = targetVal * (1 - ease);
        setNeedleVal(current);
        setArcVal(current);
        setDisplayNum(Math.round(current));
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 2150) {
        // Stage 3b: Full-scale sweep from 0% -> 100%
        setStage(3);
        const t = (elapsed - 1450) / 700;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const current = ease * 100;
        setNeedleVal(current);
        setArcVal(current);
        setDisplayNum(Math.round(current));
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 2350) {
        // Stage 3 Hold: Brief hold at 100%
        setStage(3);
        setNeedleVal(100);
        setArcVal(100);
        setDisplayNum(100);
        rafId = requestAnimationFrame(animate);
      } else if (elapsed < 3050) {
        // Stage 4: Settle smoothly from 100% back to targetVal
        setStage(4);
        const t = (elapsed - 2350) / 700;
        const ease = 1 - Math.pow(1 - t, 3.2); // Gentle deceleration
        const current = 100 - (100 - targetVal) * ease;
        setNeedleVal(current);
        setArcVal(current);
        setDisplayNum(Math.round(current));
        rafId = requestAnimationFrame(animate);
      } else {
        // Settled precisely at targetVal
        setStage(4);
        setNeedleVal(targetVal);
        setArcVal(targetVal);
        setDisplayNum(targetVal);
        setIsSettled(true);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [targetVal, replayKey, prefersReduced]);

  // Clean, Minimalist Semicircular Gauge Geometry
  // Center at (140, 125), Radius = 95
  const cx = 140;
  const cy = 125;
  const radius = 95;
  const totalArcLength = Math.PI * radius; // ~298.45

  // Arc stroke-dashoffset for animated progress
  const strokeDashoffset = totalArcLength * (1 - Math.min(100, Math.max(0, arcVal)) / 100);

  // Sleek needle indicator rotation in degrees:
  // 0% -> -90 deg (points directly left)
  // 50% -> 0 deg (points directly up)
  // 100% -> +90 deg (points directly right)
  const needleAngle = -90 + (Math.min(100, Math.max(0, needleVal)) / 100) * 180;

  // Minimal ticks: 25%, 50%, 75%
  const minimalTicks = useMemo(() => {
    return [25, 50, 75].map((val) => {
      const angleRad = Math.PI * (1 - val / 100);
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return {
        val,
        x1: cx - (radius - 5) * cos,
        y1: cy - (radius - 5) * sin,
        x2: cx - (radius + 5) * cos,
        y2: cy - (radius + 5) * sin,
      };
    });
  }, [cx, cy, radius]);

  // Status Badge Evaluation
  const benchmarkStatus = useMemo(() => {
    if (targetVal >= currentOption.targetBenchmark) {
      return {
        label: "Exceeds Target",
        tone: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
        icon: CheckCircle2,
      };
    }
    if (targetVal >= currentOption.accreditationThreshold) {
      return {
        label: "On Track",
        tone: "text-sb-cyan border-sb-cyan/30 bg-sb-cyan/10 light:text-[#007ba7]",
        icon: Award,
      };
    }
    return {
      label: "Needs Focus",
      tone: "text-amber-400 border-amber-400/30 bg-amber-400/10",
      icon: AlertCircle,
    };
  }, [targetVal, currentOption]);

  const StatusIcon = benchmarkStatus.icon;

  return (
    <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300">
      {/* Specular Top Rim */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent light:via-white/70"
        aria-hidden="true"
      />

      {/* Header and Controls */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Academic Progress
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${benchmarkStatus.tone}`}
            >
              <StatusIcon size={10} /> {benchmarkStatus.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="group flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-sb-muted transition-all hover:border-sb-cyan/40 hover:text-white light:border-black/10 light:hover:text-[#007ba7]"
            title="Replay progress sequence"
          >
            <RotateCcw size={11} className="transition-transform duration-300 group-hover:-rotate-90 text-sb-cyan light:text-[#007ba7]" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        </div>

        <h3 className="mt-1 text-base sm:text-lg font-bold text-white light:text-[#171717]">
          {currentOption.label}
        </h3>
        <p className="text-xs text-sb-muted line-clamp-1">
          {currentOption.subtitle} · {institutionName}
        </p>
      </div>

      {/* Minimalist Semicircular Gauge SVG Canvas */}
      <div className="relative my-4 flex flex-col items-center justify-center select-none">
        <div className="relative w-full max-w-[280px]">
          <svg viewBox="0 0 280 155" className="w-full overflow-visible" role="img" aria-label={`${currentOption.label}: ${displayNum}%`}>
            <defs>
              {/* Slender Vibrant Gradient */}
              <linearGradient id={`${gradientId}-arc`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007ba7" />
                <stop offset="50%" stopColor="#19b8e6" />
                <stop offset="100%" stopColor="#ff2d95" />
              </linearGradient>

              {/* Delicate Glow Filter */}
              <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#19b8e6" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Subtle Gauge Track (Full 100% Semicircle) */}
            <path
              d={`M 45 125 A ${radius} ${radius} 0 0 1 235 125`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="9"
              strokeLinecap="round"
              className="light:stroke-black/10"
            />

            {/* Minimal Ticks (25%, 50%, 75%) */}
            {minimalTicks.map((t) => (
              <line
                key={t.val}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1.5"
                className="light:stroke-black/25"
              />
            ))}

            {/* Active Vibrant Semicircular Arc */}
            <path
              d={`M 45 125 A ${radius} ${radius} 0 0 1 235 125`}
              fill="none"
              stroke={`url(#${gradientId}-arc)`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={totalArcLength}
              strokeDashoffset={strokeDashoffset}
              filter={`url(#${gradientId}-glow)`}
            />

            {/* Scale End Labels (0% and 100%) */}
            <text
              x="45"
              y="145"
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="rgba(255, 255, 255, 0.45)"
              className="light:fill-[#596579] font-mono select-none"
            >
              0%
            </text>
            <text
              x="235"
              y="145"
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="rgba(255, 255, 255, 0.45)"
              className="light:fill-[#596579] font-mono select-none"
            >
              100%
            </text>

            {/* Sleek Minimalist Indicator Needle */}
            <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`} className="transition-transform duration-75 ease-out">
              {/* Slender Needle Pointer */}
              <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 5} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="light:stroke-[#171717]" />
              {/* Needle Tip Glowing Pip */}
              <circle cx={cx} cy={cy - radius + 5} r="2.5" fill="#19b8e6" className="shadow-sm" />
            </g>

            {/* Minimal Pivot Hub */}
            <circle cx={cx} cy={cy} r="6.5" fill="#0f172a" stroke="#19b8e6" strokeWidth="1.5" className="light:fill-white" />
            <circle cx={cx} cy={cy} r="2.5" fill="#19b8e6" />
          </svg>

          {/* Semicircular Base Digital Percentage Readout */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white light:text-[#171717]">
                <SpinningCounter value={targetVal} />
              </span>
              <span className="text-lg font-bold text-sb-cyan light:text-[#007ba7]">%</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-sb-muted font-medium">
              {currentOption.shortLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="mt-2 border-t border-white/[0.08] pt-3">
        <div className="flex flex-wrap gap-1.5">
          {metrics.map((m) => {
            const isSelected = m.id === currentOption.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMetric(m.id)}
                className={`flex-1 min-w-[70px] rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition-all ${
                  isSelected
                    ? "border border-sb-cyan/40 bg-sb-cyan/15 font-semibold text-white shadow-sm light:border-[#007ba7]/40 light:bg-[#007ba7]/10 light:text-[#007ba7]"
                    : "border border-transparent bg-white/[0.02] text-sb-muted hover:bg-white/[0.05] hover:text-white light:text-[#596579] light:hover:text-[#171717]"
                }`}
              >
                <div className="truncate">{m.shortLabel}</div>
                <div className="font-mono text-[10px] opacity-80">{Math.round(m.value)}%</div>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-sb-muted">
          <span>Target Benchmark: <strong className="text-white light:text-[#171717]">{currentOption.targetBenchmark}%</strong></span>
          <span className="font-mono text-[10px]">
            {isSettled ? "● Settled" : "◌ Stage " + stage}
          </span>
        </div>
      </div>
    </div>
  );
}
