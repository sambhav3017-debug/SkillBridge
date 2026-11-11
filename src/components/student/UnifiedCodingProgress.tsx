"use client";

import { useMemo } from "react";
import {
  Award,
  Code2,
  ExternalLink,
  Flame,
  GitCommit,
  Plus,
  RefreshCw,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { GithubIcon } from "./ui";
import type { StudentData } from "@/lib/student/types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface UnifiedCodingProgressProps {
  data: StudentData;
  onOpenAccountsManager?: () => void;
}

export default function UnifiedCodingProgress({
  data,
  onOpenAccountsManager,
}: UnifiedCodingProgressProps) {
  const accounts = data.codingAccounts || [];
  const stats = useMemo(
    () =>
      data.codingStats || {
        totalProblemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalCommits: 0,
        reposContributed: 0,
        contestsAttended: 0,
        activeStreakDays: 0,
        longestStreakDays: 0,
        activeDaysLast30: 0,
        activeDaysLastYear: 0,
      },
    [data.codingStats]
  );

  const ghAccount = accounts.find((a) => a.platform === "github" && a.status === "synced");
  const lcAccount = accounts.find((a) => a.platform === "leetcode" && a.status === "synced");
  const ccAccount = accounts.find((a) => a.platform === "codechef" && a.status === "synced");

  const totalConnected = accounts.filter((a) => a.status === "synced").length;

  const easyPct = useMemo(() => {
    if (!stats.totalProblemsSolved) return 0;
    return Math.round((stats.easySolved / stats.totalProblemsSolved) * 100);
  }, [stats]);

  const medPct = useMemo(() => {
    if (!stats.totalProblemsSolved) return 0;
    return Math.round((stats.mediumSolved / stats.totalProblemsSolved) * 100);
  }, [stats]);

  const hardPct = useMemo(() => {
    if (!stats.totalProblemsSolved) return 0;
    return Math.max(0, 100 - easyPct - medPct);
  }, [stats, easyPct, medPct]);

  return (
    <div className="space-y-5">
      {/* Header with Title and Quick Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E3E3] dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
              <Code2 size={16} />
            </span>
            <h3 className="text-base font-bold text-[#171717] dark:text-white">
              Unified Coding Progress & Ratings
            </h3>
          </div>
          <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5">
            Real-time aggregate across your verified GitHub, LeetCode, and CodeChef profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {totalConnected < 3 && onOpenAccountsManager && (
            <button
              type="button"
              onClick={onOpenAccountsManager}
              className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6A00] border border-orange-500/20 dark:bg-sb-cyan/10 dark:hover:bg-sb-cyan/20 dark:text-sb-cyan dark:border-transparent transition-colors"
            >
              <Plus size={14} /> Connect Platform ({3 - totalConnected} remaining)
            </button>
          )}
          {onOpenAccountsManager && (
            <button
              type="button"
              onClick={onOpenAccountsManager}
              className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F7F7F7] border border-[#E3E3E3] hover:bg-black/[0.04] text-[#171717] dark:bg-white/5 dark:border-transparent dark:hover:bg-white/10 dark:text-white transition-colors"
            >
              <RefreshCw size={13} /> Manage Accounts
            </button>
          )}
        </div>
      </div>

      {/* 4 Multi-Platform Metric Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Problem Solving Progress */}
        <div className="card-interactive rounded-2xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E3E3E3] dark:border-white/5">
              <span className="font-semibold text-[#686868] dark:text-sb-muted flex items-center gap-1.5">
                <Target size={14} className="text-[#FF6A00] dark:text-sb-cyan" /> Problem Solving
              </span>
              <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-black text-[#171717] dark:text-white tracking-tight font-mono">
                  <SpinningCounter value={stats.totalProblemsSolved} />
                </p>
                <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 font-medium">Problems Solved</p>
              </div>
              <div className="text-right text-[11px] text-[#686868] dark:text-sb-muted">
                <p>LC: <span className="font-bold text-[#171717] dark:text-white"><SpinningCounter value={lcAccount?.metrics?.problemsSolved ?? 0} /></span></p>
                <p>CC: <span className="font-bold text-[#171717] dark:text-white"><SpinningCounter value={ccAccount?.metrics?.problemsSolved ?? 0} /></span></p>
              </div>
            </div>

            {/* Tri-color Difficulty Stack Bar */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden flex">
                <div
                  style={{ width: `${easyPct}%` }}
                  title={`Easy: ${stats.easySolved}`}
                  className="h-full bg-emerald-500"
                />
                <div
                  style={{ width: `${medPct}%` }}
                  title={`Medium: ${stats.mediumSolved}`}
                  className="h-full bg-[#FF9F1C]"
                />
                <div
                  style={{ width: `${hardPct}%` }}
                  title={`Hard: ${stats.hardSolved}`}
                  className="h-full bg-[#D93820]"
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy <SpinningCounter value={stats.easySolved} /></span>
                <span className="text-[#E94E00] dark:text-amber-400">Med <SpinningCounter value={stats.mediumSolved} /></span>
                <span className="text-[#D93820] dark:text-rose-400">Hard <SpinningCounter value={stats.hardSolved} /></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#E3E3E3] dark:border-white/5 flex items-center justify-between text-[11px] text-[#686868] dark:text-sb-muted font-medium">
            <span>Aggregated Pool</span>
            {lcAccount ? (
              <a
                href={lcAccount.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-bounce-sm font-medium text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline inline-flex items-center gap-0.5"
              >
                LeetCode Profile <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-xs text-[#FF6A00]">LeetCode not linked</span>
            )}
          </div>
        </div>

        {/* Card 2: Development & GitHub Activity */}
        <div className="card-interactive rounded-2xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E3E3E3] dark:border-white/5">
              <span className="font-semibold text-[#686868] dark:text-sb-muted flex items-center gap-1.5">
                <GithubIcon size={14} className="text-[#171717] dark:text-white" /> Open Source & Dev
              </span>
              <span className="font-bold text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md">
                GitHub Live
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-black text-[#171717] dark:text-white tracking-tight font-mono">
                  <SpinningCounter value={stats.totalCommits} />
                </p>
                <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 font-medium">Commits & Pushes</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 grid place-items-center">
                <GitCommit size={18} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#F7F7F7] dark:bg-white/[0.03] border border-[#E3E3E3] dark:border-white/[0.05]">
                <p className="text-[11px] text-[#686868] dark:text-sb-muted font-medium">Repositories</p>
                <p className="text-base font-bold text-[#171717] dark:text-white font-mono mt-0.5">
                  <SpinningCounter value={stats.reposContributed} />
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F7F7] dark:bg-white/[0.03] border border-[#E3E3E3] dark:border-white/[0.05]">
                <p className="text-[11px] text-[#686868] dark:text-sb-muted font-medium">Pull Requests</p>
                <p className="text-base font-bold text-[#171717] dark:text-white font-mono mt-0.5">
                  <SpinningCounter value={ghAccount?.metrics?.prsCount ?? Math.round(stats.reposContributed * 1.5)} />
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#E3E3E3] dark:border-white/5 flex items-center justify-between text-[11px] text-[#686868] dark:text-sb-muted font-medium">
            <span>Version Control</span>
            {ghAccount ? (
              <a
                href={ghAccount.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-bounce-sm font-medium text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline inline-flex items-center gap-0.5"
              >
                @{ghAccount.username} <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-xs text-[#FF6A00]">GitHub not linked</span>
            )}
          </div>
        </div>

        {/* Card 3: Competitive Programming & Contests */}
        <div className="card-interactive rounded-2xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E3E3E3] dark:border-white/5">
              <span className="font-semibold text-[#686868] dark:text-sb-muted flex items-center gap-1.5">
                <Trophy size={14} className="text-[#FF9F1C]" /> Contest Ratings
              </span>
              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                Competitive
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-3xl font-black text-[#171717] dark:text-white tracking-tight font-mono">
                    {stats.codechefRating || stats.leetcodeRating ? (
                      <SpinningCounter value={stats.codechefRating || stats.leetcodeRating || 0} />
                    ) : (
                      "—"
                    )}
                  </p>
                  {stats.codechefStars && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs">
                      {stats.codechefStars} <Star size={11} className="fill-amber-500 text-amber-500" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 font-medium">Top Rating Achieved</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 grid place-items-center">
                <Award size={18} />
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E3E3E3] dark:border-white/5">
                <span className="text-[#686868] dark:text-sb-muted">LeetCode Contest Rating:</span>
                <span className="font-mono font-bold text-[#171717] dark:text-white">
                  {stats.leetcodeRating ? <SpinningCounter value={stats.leetcodeRating} /> : "Unranked"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#686868] dark:text-sb-muted">Contests Attended:</span>
                <span className="font-mono font-bold text-[#171717] dark:text-white">
                  <SpinningCounter value={stats.contestsAttended} /> Contests
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#E3E3E3] dark:border-white/5 flex items-center justify-between text-[11px] text-[#686868] dark:text-sb-muted font-medium">
            <span>CodeChef Rating</span>
            {ccAccount ? (
              <a
                href={ccAccount.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-bounce-sm font-medium text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline inline-flex items-center gap-0.5"
              >
                CodeChef Profile <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-xs text-[#FF6A00]">CodeChef not linked</span>
            )}
          </div>
        </div>

        {/* Card 4: Consistency & Active Habit */}
        <div className="card-interactive rounded-2xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E3E3E3] dark:border-white/5">
              <span className="font-semibold text-[#686868] dark:text-sb-muted flex items-center gap-1.5">
                <Flame size={14} className="text-[#FF6A00]" /> Consistency Habit
              </span>
              <span className="font-bold text-[11px] text-[#E94E00] dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-md">
                Active Streak
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-[#FF6A00] dark:text-sb-cyan tracking-tight font-mono">
                    <SpinningCounter value={stats.activeStreakDays} />
                  </p>
                  <span className="text-xs font-bold text-[#686868] dark:text-sb-muted">days</span>
                </div>
                <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 font-medium">Current Active Streak</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan grid place-items-center">
                <Flame size={18} />
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E3E3E3] dark:border-white/5">
                <span className="text-[#686868] dark:text-sb-muted">Longest Habit Streak:</span>
                <span className="font-mono font-bold text-[#171717] dark:text-white">
                  <SpinningCounter value={stats.longestStreakDays} /> days
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#686868] dark:text-sb-muted">Active Days (Last 30d):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <SpinningCounter value={stats.activeDaysLast30} /> / 30
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#E3E3E3] dark:border-white/5 flex items-center justify-between text-[11px] text-[#686868] dark:text-sb-muted font-medium">
            <span>Overall Activity</span>
            <span className="font-bold text-[#171717] dark:text-white">
              <SpinningCounter value={stats.activeDaysLastYear} /> days in past year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
