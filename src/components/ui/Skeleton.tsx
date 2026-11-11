"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "rectangular" | "circular" | "rounded" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClass = {
    rectangular: "rounded-none",
    circular: "rounded-full",
    rounded: "rounded-xl",
    text: "rounded-md h-4 my-1",
  }[variant];

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        ...style,
      }}
      className={`relative overflow-hidden bg-slate-200/70 dark:bg-white/[0.06] animate-pulse ${variantClass} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/[0.08] to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c101d]/60 p-5 shadow-sm backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="h-4 w-1/2" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} className="mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/5">
        <Skeleton variant="rounded" className="h-7 w-20" />
        <Skeleton variant="rounded" className="h-7 w-24" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c101d]/60 overflow-hidden ${className}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                variant="text"
                className={`h-4.5 flex-1 ${c === 0 ? "max-w-[140px]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c101d]/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2.5 max-w-md w-full">
            <Skeleton variant="rounded" className="h-6 w-32" />
            <Skeleton variant="text" className="h-8 w-3/4" />
            <Skeleton variant="text" className="h-4 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="rounded" className="h-10 w-28" />
            <Skeleton variant="rounded" className="h-10 w-28" />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c101d]/60 p-4.5 backdrop-blur-xl"
          >
            <Skeleton variant="text" className="h-3.5 w-1/2 mb-2" />
            <Skeleton variant="text" className="h-7 w-2/3 mb-1.5" />
            <Skeleton variant="text" className="h-3 w-3/4" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonTable rows={4} cols={3} />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
