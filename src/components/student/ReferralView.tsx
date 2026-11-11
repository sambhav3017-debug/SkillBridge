"use client";

import React, { useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useStudent } from "./StudentProvider";

export default function ReferralView() {
  const { data, notify } = useStudent();
  const [copied, setCopied] = useState(false);

  // Generate deterministic unique referral code from student ID
  const cleanId = data.user.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const referralCode = `SKILL-${cleanId.slice(0, 4)}-${cleanId.slice(-4)}`;
  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/student/signup?ref=${referralCode}`
    : `https://skillbridge.edu/student/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      notify("success", "Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify("error", "Could not copy automatically. Please copy the link manually.");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join me on SkillBridge",
          text: "Connect your coursework with top tech opportunities and verified industry capstones on SkillBridge!",
          url: referralUrl,
        });
        notify("success", "Shared successfully!");
      } catch {
        // User cancelled share dialog
      }
    } else {
      handleCopy();
    }
  };

  const milestones = [
    {
      goal: 1,
      reward: "Verified Community Contributor Badge",
      status: "unlocked",
      description: "Invited your first classmate to join SkillBridge.",
    },
    {
      goal: 3,
      reward: "Priority Recruiter Spotlight",
      status: "in-progress",
      description: "Profile featured in top recruiter search results for 30 days.",
    },
    {
      goal: 5,
      reward: "1-on-1 Industry Mentor Consultation",
      status: "locked",
      description: "Exclusive mock interview and portfolio feedback from an enterprise mentor.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-10 backdrop-blur-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-sb-cyan">
            <Gift size={14} />
            <span>SkillBridge Peer Referral Program</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invite Peers. Unlock Mentorship. Accelerate Careers.
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Share your unique invite code with fellow students. When they create an account and complete their profile, both of you earn verified peer endorsements and priority employer exposure.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/20 to-pink-500/20 blur-3xl -z-0" />
      </div>

      {/* Share Box & Referral Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c101d]/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#007BA7] dark:text-sb-cyan" />
            Your Exclusive Referral Link
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Personal Referral URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200 select-all focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share referral link"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Your Referral Code: <strong className="font-mono text-slate-800 dark:text-white font-bold">{referralCode}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} /> Active & Verified
            </span>
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c101d]/70 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" />
              Referral Stats
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <div className="text-xs text-slate-500 dark:text-slate-400">Joined via your link</div>
                <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">1 Student</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <div className="text-xs text-slate-500 dark:text-slate-400">Current Reward Tier</div>
                <div className="text-sm font-bold text-[#007BA7] dark:text-sb-cyan mt-1">Tier 1: Community Badge</div>
              </div>
            </div>
          </div>

          <p className="text-[0.74rem] text-slate-400 dark:text-slate-500 mt-6">
            Statistics are updated in real-time as peers create accounts.
          </p>
        </div>
      </div>

      {/* Reward Milestones */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c101d]/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          Referral Milestones & Perks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {milestones.map((m) => (
            <div
              key={m.goal}
              className={`p-5 rounded-2xl border transition-all ${
                m.status === "unlocked"
                  ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                  : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {m.goal} {m.goal === 1 ? "Invite" : "Invites"}
                </span>
                <span
                  className={`text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    m.status === "unlocked"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">
                {m.reward}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Program Rules & Security Notice */}
      <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02] text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
          Referral Integrity & Fair Play
        </h4>
        <p>
          Self-referrals, automated submissions, or disposable email accounts are automatically detected and disqualified to preserve accredited talent pool integrity. Rewards are granted exclusively for genuine student account creations.
        </p>
      </div>
    </div>
  );
}
