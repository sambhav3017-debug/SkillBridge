"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";
import {
  CERTIFICATE_DOMAINS,
  CERTIFICATE_PLATFORMS,
} from "@/lib/student/certificate-catalog";

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDomain: string;
  onDomainChange: (d: string) => void;
  selectedPlatform: string;
  onPlatformChange: (p: string) => void;
  selectedPricing: string;
  onPricingChange: (p: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (diff: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function CertificateFilterBar({
  searchQuery,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  selectedPlatform,
  onPlatformChange,
  selectedPricing,
  onPricingChange,
  selectedDifficulty,
  onDifficultyChange,
  onResetFilters,
  hasActiveFilters,
}: Props) {
  return (
    <div className="space-y-3.5">
      {/* Search Bar + Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Keyword Search Input */}
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search certifications by name, skill, provider, or topic (e.g. AWS, Python, Deep Learning, SQL)..."
            portalVariant="student"
          />
        </div>

        {/* Quick Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pricing Selector */}
          <select
            value={selectedPricing}
            onChange={(e) => onPricingChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#181a20] text-xs font-semibold text-[#171717] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Pricing</option>
            <option value="Free">100% Free</option>
            <option value="Free Audit">Free to Audit</option>
            <option value="Paid">Professional Paid</option>
          </select>

          {/* Difficulty Selector */}
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#181a20] text-xs font-semibold text-[#171717] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#181a20] text-xs font-semibold text-[#171717] dark:text-white focus:outline-none cursor-pointer"
          >
            {CERTIFICATE_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="btn-bounce-sm px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Domain Scrollable Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CERTIFICATE_DOMAINS.map((domain) => {
          const active = selectedDomain === domain;
          return (
            <button
              key={domain}
              type="button"
              onClick={() => onDomainChange(domain)}
              className={`btn-bounce-sm px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-xs font-bold"
                  : "bg-black/[0.04] dark:bg-white/[0.04] text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.07] dark:hover:bg-white/10"
              }`}
            >
              {domain}
            </button>
          );
        })}
      </div>
    </div>
  );
}
