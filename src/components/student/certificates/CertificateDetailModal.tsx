"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Users,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Briefcase,
  FileCheck2,
  ListOrdered,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import type {
  GlobalCertificate,
  CertificateRecommendation,
  StudentCertificateProgress,
} from "@/lib/student/certificate-types";

interface Props {
  certificate: GlobalCertificate | null;
  recommendation?: CertificateRecommendation;
  isSaved?: boolean;
  progress?: StudentCertificateProgress;
  isEarned?: boolean;
  onClose: () => void;
  onToggleSave: (certId: string, currentSaved: boolean) => void;
  onAddToPlan: (cert: GlobalCertificate, targetDate: string, notes: string) => Promise<void>;
  onMarkCompleted?: (cert: GlobalCertificate, credentialUrl: string) => Promise<void>;
}

export function CertificateDetailModal({
  certificate,
  recommendation,
  isSaved = false,
  progress,
  isEarned = false,
  onClose,
  onToggleSave,
  onAddToPlan,
  onMarkCompleted,
}: Props) {
  const [targetDate, setTargetDate] = useState(
    progress?.targetCompletionDate ||
      new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(progress?.notes || "");
  const [credentialUrl, setCredentialUrl] = useState(progress?.verificationUrl || "");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!certificate) return null;

  async function handlePlanSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onAddToPlan(certificate!, targetDate, notes);
    setBusy(false);
    setIsPlanning(false);
  }

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onMarkCompleted) return;
    setBusy(true);
    await onMarkCompleted(certificate!, credentialUrl);
    setBusy(false);
    setIsCompleting(false);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#12141A] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
              <Award size={18} />
            </span>
            <span className="text-xs font-bold text-sb-muted uppercase tracking-wider">
              Certificate Profile & Syllabus
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSave(certificate.id, isSaved)}
              className={`btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl cursor-pointer transition-all ${
                isSaved
                  ? "bg-orange-500/15 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan"
                  : "text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
              }`}
              title={isSaved ? "Saved to your list" : "Save this certificate"}
            >
              <Bookmark size={15} className={isSaved ? "fill-current" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="close-modal-btn"
              className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5.5 space-y-6 select-none">
          {/* Main Hero Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan border border-orange-500/20 dark:border-sb-cyan/20">
                {certificate.domain}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/10 text-[#555] dark:text-[#bbb]">
                {certificate.badgeType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {certificate.pricing}
              </span>
              {isEarned && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Already Earned & Added
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] dark:text-white leading-tight">
              {certificate.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666] dark:text-sb-muted font-medium">
              <span>
                Offered by <strong className="text-[#171717] dark:text-white">{certificate.issuer}</strong>
              </span>
              <span>•</span>
              <span>
                Platform: <strong className="text-[#171717] dark:text-white">{certificate.platform}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={13} className="fill-current" />
                <strong className="text-[#171717] dark:text-white">{certificate.rating}</strong>
                <span>({certificate.reviewsCount.toLocaleString()} ratings)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {certificate.enrolledStudentsCount}
              </span>
            </div>
          </div>

          {/* Personalized Recommendation Explanation Banner (if matched) */}
          {recommendation && (
            <div className="rounded-2xl border border-orange-500/25 dark:border-sb-cyan/25 bg-gradient-to-r from-orange-500/[0.07] via-amber-500/[0.04] to-transparent dark:from-sb-cyan/[0.07] dark:via-blue-500/[0.04] p-4.5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500/15 text-[#FF6A00] dark:bg-sb-cyan/20 dark:text-sb-cyan shrink-0">
                  <Sparkles size={18} />
                </span>
                <div>
                  <div className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-2">
                    <span>Why SkillBridge Recommends This</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-extrabold bg-[#FF6A00] text-white dark:bg-sb-cyan dark:text-black">
                      {recommendation.matchScore}% Match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#555] dark:text-[#bbb] leading-relaxed">
                    {recommendation.matchReason}
                  </p>
                  {recommendation.matchedCourses && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#777] dark:text-sb-muted font-medium">
                      <span>Direct connection:</span>
                      {recommendation.matchedCourses.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan font-bold"
                        >
                          {c} Course
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] p-3">
              <div className="text-xs text-sb-muted flex items-center gap-1">
                <Clock size={12} /> Duration
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717] dark:text-white">
                {certificate.duration}
              </div>
            </div>

            <div className="rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] p-3">
              <div className="text-xs text-sb-muted flex items-center gap-1">
                <TrendingUp size={12} /> Difficulty
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717] dark:text-white">
                {certificate.difficulty} Level
              </div>
            </div>

            <div className="rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] p-3">
              <div className="text-xs text-sb-muted flex items-center gap-1">
                <DollarSign size={12} /> Pricing
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717] dark:text-white">
                {certificate.pricing}
              </div>
            </div>

            <div className="rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] p-3">
              <div className="text-xs text-sb-muted flex items-center gap-1">
                <Briefcase size={12} /> Target Roles
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717] dark:text-white truncate">
                {certificate.careerRelevance[0]}
              </div>
            </div>
          </div>

          {/* Pricing Detail Note */}
          {certificate.priceDetail && (
            <div className="text-xs text-[#666] dark:text-sb-muted bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/[0.04] dark:border-white/5">
              <strong>Enrollment & Access:</strong> {certificate.priceDetail}
            </div>
          )}

          {/* Resume Impact & Honest Value Guidance */}
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white dark:bg-white/[0.01] p-4.5 space-y-3">
            <h3 className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-2">
              <FileCheck2 size={16} className="text-emerald-500" />
              Honest Resume Impact & Recommended Bullet Points
            </h3>
            <p className="text-xs text-[#666] dark:text-sb-muted leading-relaxed">
              Recruiters value demonstrable competence over paper badges. Once earned, here is how to articulate this credential on your CV:
            </p>
            <ul className="space-y-2">
              {certificate.resumeValueBullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#222] dark:text-[#ddd] bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-xl border border-black/[0.04] dark:border-white/5"
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills Covered */}
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-white mb-2.5 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#FF6A00] dark:text-sb-cyan" />
              Verified Competencies Covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {certificate.skillsCovered.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-orange-500/10 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan border border-orange-500/15 dark:border-sb-cyan/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Syllabus Modules */}
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-white mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-sb-muted" />
              Official Syllabus & Course Structure ({certificate.syllabus.length} Modules)
            </h3>
            <div className="space-y-2.5">
              {certificate.syllabus.map((mod, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-black/[0.06] dark:border-white/10 p-3.5 bg-black/[0.01] dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#171717] dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-black/[0.05] dark:bg-white/10 text-[10px]">
                        {idx + 1}
                      </span>
                      {mod.title}
                    </span>
                    <span className="text-[11px] font-semibold text-sb-muted px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/5">
                      {mod.duration}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#555] dark:text-[#aaa] leading-relaxed pl-7">
                    {mod.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Plan Form (if toggled) */}
          {isPlanning && (
            <form
              onSubmit={handlePlanSubmit}
              className="rounded-2xl border border-orange-500/30 dark:border-sb-cyan/30 bg-orange-500/[0.03] dark:bg-sb-cyan/[0.03] p-4.5 space-y-3.5 animate-in fade-in"
            >
              <div className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-[#FF6A00] dark:text-sb-cyan" />
                Schedule in Smart Learning Planner
              </div>
              <p className="text-xs text-sb-muted">
                Add daily tasks to your Student Dashboard to prepare for and complete this certification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#444] dark:text-[#bbb] mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-black/10 dark:border-white/15 bg-white dark:bg-black/30 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] dark:text-[#bbb] mb-1">
                    Personal Study Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 hour every weekday evening"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-black/10 dark:border-white/15 bg-white dark:bg-black/30 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanning(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-sb-muted hover:text-[#171717] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-bounce-sm px-4 py-1.5 rounded-xl text-xs font-bold bg-[#FF6A00] text-white hover:brightness-105 disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save to Smart Planner"}
                </button>
              </div>
            </form>
          )}

          {/* Interactive Mark Complete Form (if toggled) */}
          {isCompleting && (
            <form
              onSubmit={handleCompleteSubmit}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4.5 space-y-3.5 animate-in fade-in"
            >
              <div className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Add to Your Verified Profile Credentials
              </div>
              <p className="text-xs text-sb-muted">
                Enter your verifiable credential link (Credly, Coursera Certificate URL, or PDF link) so recruiters can verify it.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#bbb] mb-1">
                  Credential Verification URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.coursera.org/verify/... or https://www.credly.com/badges/..."
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-black/10 dark:border-white/15 bg-white dark:bg-black/30 text-[#171717] dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompleting(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-sb-muted hover:text-[#171717] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-bounce-sm px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:brightness-105 disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Mark Earned & Add to Profile"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isEarned && !isCompleting && (
              <button
                type="button"
                onClick={() => setIsCompleting(true)}
                className="btn-bounce-sm inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <CheckCircle2 size={14} /> Already Finished? Mark as Earned
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEarned && !isPlanning && (
              <button
                type="button"
                onClick={() => setIsPlanning(true)}
                className="btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-black/[0.05] dark:bg-white/10 text-[#171717] dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/15 transition-all cursor-pointer"
              >
                <Calendar size={14} /> {progress ? "Update Learning Plan" : "Add to Learning Plan"}
              </button>
            )}

            <a
              href={certificate.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bounce-sm inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-md shadow-orange-500/20 hover:brightness-105 transition-all cursor-pointer"
            >
              Enroll on Official Portal <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
