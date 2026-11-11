"use client";

import React from "react";
import { AlertCircle, RefreshCw, FolderOpen, SearchX, WifiOff } from "lucide-react";

interface ActionProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface StateViewProps {
  type: "empty" | "error" | "no-results" | "offline";
  title?: string;
  description?: string;
  action?: ActionProps;
  secondaryAction?: ActionProps;
  className?: string;
  icon?: React.ReactNode;
}

export function StateView({
  type,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  icon,
}: StateViewProps) {
  const defaults = {
    empty: {
      title: "No records found",
      description: "Get started by creating your first entry or checking back later.",
      icon: <FolderOpen size={36} className="text-slate-400 dark:text-slate-500" />,
    },
    error: {
      title: "Unable to load data",
      description: "Something went wrong while retrieving information. Please try again.",
      icon: <AlertCircle size={36} className="text-rose-500 dark:text-rose-400" />,
    },
    "no-results": {
      title: "No matching results",
      description: "Try adjusting your search keywords, filters, or clearing active criteria.",
      icon: <SearchX size={36} className="text-amber-500 dark:text-amber-400" />,
    },
    offline: {
      title: "Network disconnected",
      description: "You seem to be offline. Reconnect to the internet to resume synchronization.",
      icon: <WifiOff size={36} className="text-slate-400 dark:text-slate-500" />,
    },
  }[type];

  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayIcon = icon || defaults.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-xl ${className}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm mb-4">
        {displayIcon}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1.5">
        {displayTitle}
      </h3>

      <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {displayDesc}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                action.variant === "secondary"
                  ? "border border-slate-200 dark:border-white/15 bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/15"
                  : "bg-gradient-to-r from-[#007BA7] to-[#00A3D7] dark:from-sb-cyan dark:to-sb-pink text-white dark:text-black hover:opacity-95"
              }`}
            >
              {type === "error" && <RefreshCw size={14} />}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/15 transition-all shadow-sm"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
