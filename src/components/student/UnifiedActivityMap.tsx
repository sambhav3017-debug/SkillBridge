"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Code,
  ExternalLink,
  Layers,
} from "lucide-react";
import type {
  CodingActivityItem,
  StudentData,
} from "@/lib/student/types";

interface UnifiedActivityMapProps {
  data: StudentData;
  onOpenAccountsManager?: () => void;
}

type PlatformFilter = "all" | "github" | "leetcode" | "codechef" | "skillbridge";
type DateRange = "7d" | "30d" | "90d" | "1y";

export default function UnifiedActivityMap({
  data,
  onOpenAccountsManager,
}: UnifiedActivityMapProps) {
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("90d");
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  // Combine stored coding activities with projects & skills from student data
  const allActivities = useMemo<CodingActivityItem[]>(() => {
    const list: CodingActivityItem[] = [...(data.codingActivities || [])];

    // Add internal SkillBridge projects as activities
    if (data.projects && data.projects.length > 0) {
      for (const proj of data.projects) {
        list.push({
          id: `sb-proj-${proj.id}`,
          studentId: data.user.id,
          platform: "skillbridge",
          activityType: "project_milestone",
          title: `Updated Capstone: ${proj.title}`,
          description: proj.description.slice(0, 80),
          date: new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          metricValue: 2,
          skillTopic: proj.technologies[0] || "Full-Stack Development",
          externalUrl: proj.url || `/student/projects`,
        });
      }
    }

    return list;
  }, [data.codingActivities, data.projects, data.user.id]);

  // Filter activities based on selected platform
  const filteredActivities = useMemo(() => {
    if (platformFilter === "all") return allActivities;
    return allActivities.filter((a) => a.platform === platformFilter);
  }, [allActivities, platformFilter]);

  // Map activities by YYYY-MM-DD
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, CodingActivityItem[]>();
    for (const act of filteredActivities) {
      const existing = map.get(act.date) || [];
      existing.push(act);
      map.set(act.date, existing);
    }
    return map;
  }, [filteredActivities]);

  // Generate calendar days for the selected range (7d, 30d, 90d, 1y)
  const calendarDays = useMemo(() => {
    const daysCount =
      dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 91 : 364;
    const now = new Date();
    const days: Array<{
      dateStr: string;
      dayOfWeek: number;
      monthName: string;
      count: number;
      level: number;
    }> = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const items = activitiesByDate.get(dateStr) || [];
      const count = items.reduce((sum, item) => sum + (item.metricValue || 1), 0);

      // Determine intensity level (0 to 4)
      const level =
        count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;

      days.push({
        dateStr,
        dayOfWeek: d.getDay(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        count,
        level,
      });
    }

    return days;
  }, [dateRange, activitiesByDate]);

  // Selected Day Details
  const selectedDayItems = useMemo(() => {
    if (!selectedDayDate) return null;
    return activitiesByDate.get(selectedDayDate) || [];
  }, [selectedDayDate, activitiesByDate]);

  // Topic distribution
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "React & Frontend": 0,
      "TypeScript & Node": 0,
      "DSA & Algorithms": 0,
      "System Architecture": 0,
      "Competitive Programming": 0,
    };

    for (const act of filteredActivities) {
      const topic = act.skillTopic || "DSA & Algorithms";
      counts[topic] = (counts[topic] || 0) + act.metricValue;
    }

    return counts;
  }, [filteredActivities]);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-gradient-to-tr from-[#FF6A00] to-[#E94E00] dark:from-sb-cyan dark:to-sb-blue border-transparent";
      case 3:
        return "bg-[#FF9F1C] dark:bg-sb-cyan/70 border-transparent";
      case 2:
        return "bg-[#FFD166] dark:bg-sb-cyan/40 border-transparent";
      case 1:
        return "bg-orange-100 border-orange-200/50 dark:bg-white/15 dark:border-transparent";
      default:
        return "bg-[#EBEBEB] dark:bg-white/5 border-transparent";
    }
  };

  const hasConnectedAccounts = data.codingAccounts && data.codingAccounts.length > 0;

  return (
    <div className="analytics-panel-interactive rounded-3xl bg-white dark:bg-[var(--card-glass-bg)] border border-[#E3E3E3] dark:border-[var(--card-glass-border)] p-6 shadow-sm select-none">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E3E3E3] dark:border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
            <Layers size={17} />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <span>Skill-Focused Map & Activity Intensity</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Unified
              </span>
            </h3>
            <p className="text-xs text-[#686868] dark:text-sb-muted mt-0.5 font-medium">
              Aggregated daily coding velocity across GitHub, LeetCode, CodeChef, and SkillBridge.
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filters */}
          <div className="flex items-center gap-1 rounded-xl bg-black/[0.04] dark:bg-white/5 p-1 border border-[#E3E3E3] dark:border-white/10 text-xs">
            {(
              [
                { id: "all", label: "All Platforms" },
                { id: "github", label: "GitHub" },
                { id: "leetcode", label: "LeetCode" },
                { id: "codechef", label: "CodeChef" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatformFilter(p.id)}
                className={`btn-bounce-sm px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  platformFilter === p.id
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-sm dark:bg-white dark:text-[#18181B]"
                    : "text-[#686868] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-black/[0.04] dark:bg-white/5 p-1 border border-[#E3E3E3] dark:border-white/10 text-xs">
            {(
              [
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "90d", label: "90D" },
                { id: "1y", label: "1Y" },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`btn-bounce-sm px-2 py-1 rounded-lg font-bold transition-all ${
                  dateRange === r.id
                    ? "bg-[#FF6A00] text-white shadow-sm dark:bg-sb-cyan dark:text-black"
                    : "text-[#686868] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Visualization */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-[#686868] dark:text-sb-muted mb-2 font-medium">
          <span className="font-semibold text-[#171717] dark:text-white">
            {calendarDays.length} Days Activity Calendar ({filteredActivities.length} total events)
          </span>

          {/* Intensity Legend */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#686868] dark:text-sb-muted">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-[#EBEBEB] dark:bg-white/5" />
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-100 dark:bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#FFD166] dark:bg-sb-cyan/40" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#FF9F1C] dark:bg-sb-cyan/70" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#FF6A00] dark:bg-sb-cyan" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div
            className={`grid gap-1.5 min-w-[500px] ${
              dateRange === "7d"
                ? "grid-cols-7"
                : dateRange === "30d"
                ? "grid-cols-15 sm:grid-cols-30"
                : dateRange === "90d"
                ? "grid-cols-13 sm:grid-cols-26"
                : "grid-cols-26 sm:grid-cols-52"
            }`}
          >
            {calendarDays.map((d) => (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => setSelectedDayDate(d.dateStr === selectedDayDate ? null : d.dateStr)}
                title={`${d.dateStr}: ${d.count} activities`}
                className={`heatmap-cell-interactive h-4 sm:h-5 rounded-md cursor-pointer border ${getHeatmapColor(
                  d.level
                )} ${selectedDayDate === d.dateStr ? "ring-2 ring-[#FF6A00] dark:ring-white scale-110" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Day Detail Inspector (Opens when a day is clicked) */}
        {selectedDayDate && (
          <div className="mt-4 rounded-2xl bg-orange-500/[0.05] dark:bg-white/[0.03] border border-orange-200 dark:border-white/10 p-4 animate-dash-fade">
            <div className="flex items-center justify-between pb-2 border-b border-orange-200/60 dark:border-white/10 mb-3">
              <span className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                <Calendar size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                Activity on {new Date(selectedDayDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayDate(null)}
                aria-label="Close activity day inspector"
                className="btn-bounce-sm text-xs font-bold text-[#686868] hover:text-[#171717] dark:text-sb-muted dark:hover:text-white px-2 py-1 rounded-md"
              >
                Close ✕
              </button>
            </div>

            {selectedDayItems && selectedDayItems.length > 0 ? (
              <div className="space-y-2">
                {selectedDayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          item.platform === "github"
                            ? "bg-[#24292F] text-white"
                            : item.platform === "leetcode"
                            ? "bg-[#FFA116] text-white"
                            : item.platform === "codechef"
                            ? "bg-[#5B4638] text-white"
                            : "bg-[#FF6A00] text-white"
                        }`}
                      >
                        {item.platform}
                      </span>
                      <span className="font-semibold text-[#171717] dark:text-white truncate max-w-sm">
                        {item.title}
                      </span>
                      {item.skillTopic && (
                        <span className="hidden sm:inline-block text-[10px] text-[#686868] dark:text-sb-muted font-mono">
                          · {item.skillTopic}
                        </span>
                      )}
                    </div>

                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline flex items-center gap-0.5 text-[11px] font-semibold flex-none"
                      >
                        <span>View</span> <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#686868] dark:text-sb-muted py-1 font-medium">
                No activity recorded on this day for the selected platform filter.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Skill / Topic Progress Map Row */}
      <div className="mt-5 pt-4 border-t border-[#E3E3E3] dark:border-white/10">
        <p className="text-xs font-bold text-[#171717] dark:text-white mb-2.5">
          Observed Practice Topics & Technical Areas
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(topicCounts).map(([topic, count]) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-[#F7F7F7] dark:bg-white/5 text-xs font-semibold text-[#171717] dark:text-white"
            >
              <Code size={12} className="text-[#FF6A00] dark:text-sb-cyan" />
              <span>{topic}</span>
              <span className="font-mono text-[10px] text-[#686868] dark:opacity-75 font-bold">
                ({count} {count === 1 ? "event" : "events"})
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Account Connection Prompt */}
      <div className="mt-5 pt-3 border-t border-[#E3E3E3] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#686868] dark:text-sb-muted font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#171717] dark:text-sb-muted font-semibold">
            {hasConnectedAccounts
              ? `${data.codingAccounts?.length} Coding Account${data.codingAccounts?.length === 1 ? "" : "s"} Connected (Auto-Deduplicated)`
              : "No external coding accounts connected yet."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/settings#coding-accounts"
            onClick={onOpenAccountsManager}
            className="font-bold text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline flex items-center gap-1"
          >
            <span>Manage Accounts</span> <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
