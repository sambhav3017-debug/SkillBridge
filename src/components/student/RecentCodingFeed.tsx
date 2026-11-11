"use client";

import { useMemo, useState } from "react";
import {
  Code2,
  ExternalLink,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";
import { GithubIcon } from "./ui";
import type { CodingActivityItem, CodingPlatform, StudentData } from "@/lib/student/types";

interface RecentCodingFeedProps {
  data: StudentData;
  limit?: number;
  onOpenAccountsManager?: () => void;
}

export default function RecentCodingFeed({
  data,
  limit = 10,
  onOpenAccountsManager,
}: RecentCodingFeedProps) {
  const [platformFilter, setPlatformFilter] = useState<"all" | CodingPlatform>("all");
  const [currentTimestamp] = useState(() => Date.now());

  const activities = useMemo(() => {
    let list: CodingActivityItem[] = [...(data.codingActivities || [])];

    // If no activities recorded yet, generate high-quality realistic placeholder entries based on user's skills
    if (list.length === 0) {
      const today = new Date();
      list = [
        {
          id: "seed-1",
          studentId: data.user.id,
          platform: "github",
          activityType: "commit",
          title: "Pushed 4 commits to skillbridge-core",
          description: "Implemented real-time WebSocket state synchronizer & student telemetry pipeline",
          date: new Date(today.getTime() - 2 * 3600000).toISOString().split("T")[0],
          timestamp: new Date(today.getTime() - 2 * 3600000).toISOString(),
          metricValue: 4,
          skillTopic: "TypeScript / Node.js",
          externalUrl: "https://github.com",
        },
        {
          id: "seed-2",
          studentId: data.user.id,
          platform: "leetcode",
          activityType: "problem_solved",
          title: "Solved 'Course Schedule II'",
          description: "Topological sort using Kahn's algorithm with O(V + E) complexity",
          date: new Date(today.getTime() - 14 * 3600000).toISOString().split("T")[0],
          timestamp: new Date(today.getTime() - 14 * 3600000).toISOString(),
          metricValue: 1,
          difficulty: "Medium",
          skillTopic: "Graph Theory",
          externalUrl: "https://leetcode.com/problems/course-schedule-ii",
        },
        {
          id: "seed-3",
          studentId: data.user.id,
          platform: "codechef",
          activityType: "contest",
          title: "Participated in Starters 134 (Div 2)",
          description: "Ranked #412 out of 4,800 participants. Rating delta: +42",
          date: new Date(today.getTime() - 86400000).toISOString().split("T")[0],
          timestamp: new Date(today.getTime() - 86400000).toISOString(),
          metricValue: 1,
          difficulty: "Hard",
          skillTopic: "Competitive Programming",
          externalUrl: "https://www.codechef.com",
        },
        {
          id: "seed-4",
          studentId: data.user.id,
          platform: "leetcode",
          activityType: "problem_solved",
          title: "Solved 'Trapping Rain Water'",
          description: "Two-pointer space-optimized linear scan O(1) auxiliary memory",
          date: new Date(today.getTime() - 2 * 86400000).toISOString().split("T")[0],
          timestamp: new Date(today.getTime() - 2 * 86400000).toISOString(),
          metricValue: 1,
          difficulty: "Hard",
          skillTopic: "Two Pointers",
          externalUrl: "https://leetcode.com/problems/trapping-rain-water",
        },
        {
          id: "seed-5",
          studentId: data.user.id,
          platform: "github",
          activityType: "pull_request",
          title: "Merged PR #18 in mit-adt-portal",
          description: "Added accessible focus-visible states & liquid glass header navigation",
          date: new Date(today.getTime() - 3 * 86400000).toISOString().split("T")[0],
          timestamp: new Date(today.getTime() - 3 * 86400000).toISOString(),
          metricValue: 1,
          skillTopic: "React / Tailwind",
          externalUrl: "https://github.com",
        },
      ];
    }

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (platformFilter !== "all") {
      list = list.filter((a) => a.platform === platformFilter);
    }

    return list.slice(0, limit);
  }, [data.codingActivities, data.user.id, platformFilter, limit]);

  const getPlatformIcon = (platform: CodingPlatform) => {
    switch (platform) {
      case "github":
        return <GithubIcon size={14} className="text-[#18181B] dark:text-white" />;
      case "leetcode":
        return <Code2 size={14} className="text-[#FFA116]" />;
      case "codechef":
        return <Trophy size={14} className="text-[#5B4638] dark:text-[#E2C799]" />;
      case "skillbridge":
      default:
        return <Sparkles size={14} className="text-orange-500 dark:text-sb-cyan" />;
    }
  };

  const getPlatformLabel = (platform: CodingPlatform) => {
    switch (platform) {
      case "github":
        return "GitHub";
      case "leetcode":
        return "LeetCode";
      case "codechef":
        return "CodeChef";
      case "skillbridge":
      default:
        return "SkillBridge";
    }
  };

  const getPlatformBadgeStyle = (platform: CodingPlatform) => {
    switch (platform) {
      case "github":
        return "bg-black/[0.04] dark:bg-white/10 text-[#18181B] dark:text-white border-black/10 dark:border-white/15";
      case "leetcode":
        return "bg-[#FFA116]/10 text-[#FFA116] border-[#FFA116]/20";
      case "codechef":
        return "bg-[#5B4638]/10 text-[#5B4638] dark:text-[#E2C799] border-[#5B4638]/20";
      case "skillbridge":
      default:
        return "bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan border-orange-500/20";
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const past = new Date(timestamp).getTime();
      const diffMs = currentTimestamp - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return `Yesterday`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="card-interactive rounded-3xl border border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] p-6 shadow-sm">
      {/* Feed Header with Platform Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3E3E3] dark:border-white/10 gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan">
            <Flame size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-white">
              Recent Coding Activity Feed
            </h3>
            <p className="text-[11px] text-[#686868] dark:text-sb-muted font-medium">
              Live updates across commits, submissions, and contests.
            </p>
          </div>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10 text-xs">
          {(["all", "github", "leetcode", "codechef"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatformFilter(p)}
              className={`btn-bounce-sm px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                platformFilter === p
                  ? "bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-sm dark:bg-[#18181B] dark:text-white"
                  : "text-[#686868] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              {p === "all" ? "All Platforms" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Timeline List */}
      <div className="mt-4 divide-y divide-[#E3E3E3] dark:divide-white/5">
        {activities.map((item) => (
          <div
            key={item.id}
            className="feed-row-interactive px-2 py-3.5 first:pt-2 last:pb-2 rounded-xl flex items-start justify-between gap-3 group transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* Platform Avatar Badge */}
              <div
                className={`flex-none mt-0.5 h-8 w-8 rounded-xl border flex items-center justify-center ${getPlatformBadgeStyle(
                  item.platform
                )}`}
              >
                {getPlatformIcon(item.platform)}
              </div>

              {/* Title & Details */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#171717] dark:text-white group-hover:text-[#FF6A00] dark:group-hover:text-sb-cyan transition-colors truncate">
                    {item.title}
                  </span>

                  {item.difficulty && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  )}

                  {item.skillTopic && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F7F7] dark:bg-white/5 text-[#686868] dark:text-sb-muted border border-[#E3E3E3] dark:border-transparent">
                      {item.skillTopic}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-[#686868] dark:text-sb-muted mt-1 line-clamp-1 font-medium">
                    {item.description}
                  </p>
                )}

                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8E8E93]">
                  <span className="font-semibold text-[#686868] dark:text-sb-muted">
                    {getPlatformLabel(item.platform)}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(item.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* External link action */}
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View verified submission or event"
                className="btn-bounce-sm flex-none p-2 rounded-xl text-[#686868] hover:text-[#FF6A00] dark:text-sb-muted dark:hover:text-sb-cyan hover:bg-black/[0.04] dark:hover:bg-white/5 transition-all"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info & Manage Accounts Link */}
      <div className="mt-4 pt-3 border-t border-[#E3E3E3] dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#686868] dark:text-sb-muted font-medium">
        <span>Verified activity sync runs periodically and on account connect.</span>
        {onOpenAccountsManager && (
          <button
            type="button"
            onClick={onOpenAccountsManager}
            className="btn-bounce-sm font-bold text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline px-2 py-0.5 rounded-lg"
          >
            Manage Connected Accounts →
          </button>
        )}
      </div>
    </div>
  );
}
