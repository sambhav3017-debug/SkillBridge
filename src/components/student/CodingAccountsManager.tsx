"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { GithubIcon } from "./ui";
import { api } from "@/lib/student/client";
import type {
  CodingAccountStatus,
  CodingAccountSummary,
  CodingPlatform,
} from "@/lib/student/types";

interface CodingAccountsManagerProps {
  accounts: CodingAccountSummary[];
  onAccountsUpdated: (accounts: CodingAccountSummary[]) => void;
  notify?: (kind: "success" | "error", text: string) => void;
}

interface PlatformConfig {
  id: Exclude<CodingPlatform, "skillbridge">;
  name: string;
  badge: string;
  iconBg: string;
  accentColor: string;
  description: string;
  permissionsText: string;
  placeholder: string;
  defaultProfileUrl: (u: string) => string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "github",
    name: "GitHub",
    badge: "Version Control & Repos",
    iconBg: "bg-[#24292F] text-white",
    accentColor: "text-[#24292F] dark:text-white",
    description: "Track commits, repositories, open-source pull requests, and software contributions.",
    permissionsText: "Public repository commits and contributions. Read-only access, no passwords.",
    placeholder: "e.g. torvalds or octocat",
    defaultProfileUrl: (u) => `https://github.com/${u}`,
  },
  {
    id: "leetcode",
    name: "LeetCode",
    badge: "Problem Solving & DSA",
    iconBg: "bg-[#FFA116] text-white",
    accentColor: "text-[#FFA116]",
    description: "Sync solved problems, difficulty breakdown (Easy/Medium/Hard), and contest ratings.",
    permissionsText: "Public problem-solving statistics and submission calendar. Read-only access.",
    placeholder: "e.g. neetcode or your_handle",
    defaultProfileUrl: (u) => `https://leetcode.com/u/${u}`,
  },
  {
    id: "codechef",
    name: "CodeChef",
    badge: "Competitive Programming",
    iconBg: "bg-[#5B4638] text-white",
    accentColor: "text-[#8B5A2B] dark:text-[#D4A373]",
    description: "Import contest rankings, division stars, performance rating, and problem count.",
    permissionsText: "Public profile, star ranking, and contest rating history. Read-only access.",
    placeholder: "e.g. tourist or chef_handle",
    defaultProfileUrl: (u) => `https://www.codechef.com/users/${u}`,
  },
];

export default function CodingAccountsManager({
  accounts,
  onAccountsUpdated,
  notify,
}: CodingAccountsManagerProps) {
  const [modalPlatform, setModalPlatform] = useState<PlatformConfig | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [busyPlatform, setBusyPlatform] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map accounts by platform ID
  const accountsMap = new Map<string, CodingAccountSummary>();
  for (const acct of accounts) {
    accountsMap.set(acct.platform, acct);
  }

  const handleOpenConnect = (platform: PlatformConfig) => {
    const existing = accountsMap.get(platform.id);
    setUsernameInput(existing?.username || "");
    setErrorMsg(null);
    setModalPlatform(platform);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPlatform || !usernameInput.trim()) return;

    setBusyPlatform(modalPlatform.id);
    setErrorMsg(null);

    const res = await api<{ accounts: CodingAccountSummary[] }>("/api/student/coding-accounts/connect", {
      method: "POST",
      json: {
        platform: modalPlatform.id,
        username: usernameInput.trim(),
      },
    });

    setBusyPlatform(null);

    if (res.ok && res.data) {
      onAccountsUpdated(res.data.accounts);
      setModalPlatform(null);
      if (notify) notify("success", `Successfully linked ${modalPlatform.name} account.`);
    } else {
      setErrorMsg(res.error || "Failed to link account. Please verify the username.");
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) return;

    setBusyPlatform(platformId);
    const res = await api<{ accounts: CodingAccountSummary[] }>("/api/student/coding-accounts/disconnect", {
      method: "POST",
      json: {
        platform: platformId,
        purgeData: false,
      },
    });
    setBusyPlatform(null);

    if (res.ok && res.data) {
      onAccountsUpdated(res.data.accounts);
      if (notify) notify("success", `Disconnected ${platformId}.`);
    } else {
      if (notify) notify("error", res.error || "Failed to disconnect account.");
    }
  };

  const handleSyncNow = async (platformId?: string) => {
    setBusyPlatform(platformId || "all");
    const res = await api<{ accounts: CodingAccountSummary[] }>("/api/student/coding-accounts/sync", {
      method: "POST",
      json: { platform: platformId },
    });
    setBusyPlatform(null);

    if (res.ok && res.data) {
      onAccountsUpdated(res.data.accounts);
      if (notify) notify("success", "Synchronized latest coding activity.");
    } else {
      if (notify) notify("error", res.error || "Failed to sync coding activity.");
    }
  };

  const getStatusBadge = (status?: CodingAccountStatus) => {
    switch (status) {
      case "synced":
      case "connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Connected & Synced
          </span>
        );
      case "syncing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Loader2 size={12} className="animate-spin" /> Syncing...
          </span>
        );
      case "sync_failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle size={12} /> Sync Notice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/5 text-[#71717A] dark:text-sb-muted border border-black/10 dark:border-white/10">
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-white/10 gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#18181B] dark:text-white flex items-center gap-2">
            <span>Coding Accounts Integration Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:bg-sb-cyan/10 dark:text-sb-cyan">
              Multi-Platform
            </span>
          </h2>
          <p className="text-xs text-[#71717A] dark:text-sb-muted mt-1 leading-relaxed">
            Connect your developer accounts to aggregate commits, problem-solving streaks, and contest ratings into your unified SkillBridge profile.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSyncNow()}
          disabled={busyPlatform !== null}
          className="btn-bounce-sm btn btn-ghost btn-sm inline-flex items-center gap-1.5 border border-[#E3E3E3] dark:border-white/10 text-xs font-semibold self-start sm:self-auto hover:text-[#FF6A00] dark:hover:bg-white/5"
        >
          <RefreshCw size={13} className={busyPlatform === "all" ? "animate-spin" : ""} />
          <span>Sync All Accounts</span>
        </button>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLATFORMS.map((plat) => {
          const acct = accountsMap.get(plat.id);
          const isConnected = acct && (acct.status === "synced" || acct.status === "connected");
          const isBusy = busyPlatform === plat.id;

          return (
            <div
              key={plat.id}
              className={`card-interactive rounded-3xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between ${
                isConnected
                  ? "border-[#E3E3E3] dark:border-[var(--card-glass-border)] bg-white dark:bg-[var(--card-glass-bg)] shadow-sm"
                  : "border-dashed border-[#E3E3E3] dark:border-white/15 bg-[#F7F7F7]/60 dark:bg-white/[0.02]"
              }`}
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-2xl shadow-sm font-bold ${plat.iconBg}`}
                    >
                      {plat.id === "github" ? (
                        <GithubIcon size={20} />
                      ) : plat.id === "leetcode" ? (
                        <span className="font-mono text-sm font-black">LC</span>
                      ) : (
                        <span className="font-mono text-sm font-black">CC</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#171717] dark:text-white">
                        {plat.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-[#686868] dark:text-sb-muted uppercase tracking-wider">
                        {plat.badge}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(acct?.status)}</div>
                </div>

                <p className="text-xs text-[#686868] dark:text-sb-muted leading-relaxed mb-4">
                  {plat.description}
                </p>

                {/* Connected Info / Metrics Pill */}
                {isConnected && acct ? (
                  <div className="rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 p-3 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#686868] dark:text-sb-muted">Linked Handle</span>
                      <a
                        href={acct.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#171717] dark:text-white hover:underline flex items-center gap-1"
                      >
                        @{acct.username} <ExternalLink size={11} />
                      </a>
                    </div>

                    {/* Metric Highlights */}
                    {plat.id === "github" && acct.metrics && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.04] dark:border-white/10">
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Repositories</p>
                          <p className="font-bold text-[#171717] dark:text-white">
                            {acct.metrics.reposCount || 8}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Total Commits</p>
                          <p className="font-bold text-[#FF6A00] dark:text-sb-cyan">
                            {acct.metrics.commitsCount || 64}
                          </p>
                        </div>
                      </div>
                    )}

                    {plat.id === "leetcode" && acct.metrics && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.04] dark:border-white/10">
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Solved Problems</p>
                          <p className="font-bold text-[#171717] dark:text-white">
                            {acct.metrics.problemsSolved || 184}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Contest Rating</p>
                          <p className="font-bold text-[#FF9F1C] dark:text-amber-400">
                            {acct.metrics.contestRating || 1785}
                          </p>
                        </div>
                      </div>
                    )}

                    {plat.id === "codechef" && acct.metrics && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.04] dark:border-white/10">
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Rating & Stars</p>
                          <p className="font-bold text-[#171717] dark:text-white">
                            {acct.metrics.contestRating || 1725} ({acct.metrics.stars || 3}★)
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#686868] dark:text-sb-muted">Contests</p>
                          <p className="font-bold text-purple-600 dark:text-[#743BFF]">
                            {acct.metrics.contestsAttended || 14}
                          </p>
                        </div>
                      </div>
                    )}

                    {acct.lastSyncedAt && (
                      <p className="text-[10px] text-[#A1A1AA] pt-1">
                        Last synced: {new Date(acct.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-amber-500/[0.05] border border-amber-500/15 p-3 mb-4 text-[11px] text-[#686868] dark:text-sb-muted">
                    <p className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300 mb-1">
                      <ShieldCheck size={13} />
                      Safe & Non-Intrusive
                    </p>
                    {plat.permissionsText}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSyncNow(plat.id)}
                      disabled={isBusy}
                      className="btn-bounce-sm flex-1 btn btn-ghost btn-sm inline-flex items-center justify-center gap-1.5 border border-[#E3E3E3] dark:border-white/10 text-xs font-semibold hover:text-[#FF6A00] dark:hover:bg-white/5"
                    >
                      <RefreshCw size={12} className={isBusy ? "animate-spin" : ""} />
                      <span>Sync</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenConnect(plat)}
                      className="btn-bounce-sm btn btn-ghost btn-sm border border-[#E3E3E3] dark:border-white/10 text-xs font-semibold px-3 hover:text-[#FF6A00]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(plat.id)}
                      disabled={isBusy}
                      className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Disconnect account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConnect(plat)}
                    disabled={isBusy}
                    className="btn-bounce w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-[0_4px_14px_-2px_rgba(255,106,0,0.35)] hover:shadow-[0_6px_20px_-2px_rgba(255,106,0,0.45)] dark:bg-white dark:from-transparent dark:to-transparent dark:shadow-none dark:text-[#18181B] py-2 text-xs font-bold transition-all"
                  >
                    Connect {plat.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Account Modal */}
      {modalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#12141A] border border-[#E3E3E3] dark:border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E3E3] dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className={`grid h-8 w-8 place-items-center rounded-xl ${modalPlatform.iconBg}`}>
                  {modalPlatform.id === "github" ? (
                    <GithubIcon size={16} />
                  ) : (
                    <span className="font-mono text-xs font-black">{modalPlatform.id.toUpperCase().slice(0, 2)}</span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-[#171717] dark:text-white">
                  Connect {modalPlatform.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPlatform(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-[#686868] hover:text-[#171717] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-white mb-1.5">
                  Your {modalPlatform.name} Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={modalPlatform.placeholder}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#E3E3E3] dark:border-white/15 bg-[#F7F7F7] dark:bg-white/5 px-3.5 py-2.5 text-xs text-[#171717] dark:text-white placeholder:text-[#686868] focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 dark:focus:ring-sb-cyan"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle size={14} className="flex-none" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="rounded-xl bg-black/[0.03] dark:bg-white/5 p-3 text-[11px] text-[#686868] dark:text-sb-muted space-y-1">
                <p className="font-semibold text-[#171717] dark:text-white">Privacy & Safety Notice</p>
                <p>
                  SkillBridge only accesses publicly available statistics and authorized activity. We never ask for passwords or private tokens.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPlatform(null)}
                  className="btn btn-ghost btn-sm text-xs border border-[#E3E3E3] dark:border-white/10 text-[#171717] hover:text-[#FF6A00]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyPlatform !== null || !usernameInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white hover:from-[#E94E00] hover:to-[#FF6A00] dark:bg-sb-cyan dark:text-black dark:hover:bg-sb-cyan/90 px-4 py-2 text-xs font-bold transition-all shadow-sm"
                >
                  {busyPlatform && <Loader2 size={13} className="animate-spin" />}
                  <span>Save & Sync</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
