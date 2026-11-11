"use client";

import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterToolbarProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  onClearAll: () => void;
  totalResults?: number;
  className?: string;
}

export function FilterToolbar({
  groups,
  selectedFilters,
  onFilterChange,
  onClearAll,
  totalResults,
  className = "",
}: FilterToolbarProps) {
  const activeCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          {groups.map((group) => {
            const currentVal = selectedFilters[group.id] || "";
            return (
              <div key={group.id} className="relative">
                <select
                  value={currentVal}
                  onChange={(e) => onFilterChange(group.id, e.target.value)}
                  aria-label={group.label}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md focus:outline-none transition-colors appearance-none pr-7 cursor-pointer ${
                    currentVal
                      ? "border-[#007BA7] bg-cyan-50/60 text-[#007BA7] dark:border-sb-cyan dark:bg-cyan-950/30 dark:text-sb-cyan font-semibold"
                      : "border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <option value="">{group.label} (All)</option>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.6rem] text-slate-400">
                  ▼
                </div>
              </div>
            );
          })}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors font-medium"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {totalResults !== undefined && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-700 dark:text-white">{totalResults}</strong> results
          </div>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {Object.entries(selectedFilters).map(([groupId, val]) => {
            if (!val) return null;
            const group = groups.find((g) => g.id === groupId);
            const opt = group?.options.find((o) => o.value === val);
            const displayLabel = opt ? opt.label : val;

            return (
              <span
                key={groupId}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[0.72rem] font-semibold text-cyan-700 dark:text-sb-cyan"
              >
                <span>
                  {group?.label}: {displayLabel}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange(groupId, "")}
                  aria-label={`Remove filter ${displayLabel}`}
                  className="rounded-full hover:bg-cyan-500/20 p-0.5 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
