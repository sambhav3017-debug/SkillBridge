"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Coins,
  Globe,
  Laptop,
  Loader2,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import type { Opportunity, OppType, WorkMode } from "@/lib/student/types";
import { triggerMilestoneCelebration } from "@/lib/motion";
import { useStudent } from "./StudentProvider";
import { Modal, formatDate } from "./ui";
import { useInteractiveTilt } from "./useInteractiveTilt";

export function daysLeft(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function deadlineText(iso: string) {
  const d = daysLeft(iso);
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

/** Save / apply behaviour shared by every place an opportunity can be acted on. */
export function useOppActions(o: Opportunity) {
  const { data, setSaved, apply, notify } = useStudent();
  const [busy, setBusy] = useState<"save" | "apply" | null>(null);
  const saved = data.saved.includes(o.id);
  const application = data.applications.find((a) => a.opportunityId === o.id);
  const closed = daysLeft(o.deadline) < 0;

  return {
    saved,
    application,
    closed,
    busy,
    async toggleSave() {
      if (busy) return;
      setBusy("save");
      const r = await setSaved(o.id, !saved);
      setBusy(null);
      notify(
        r.ok ? "success" : "error",
        r.ok
          ? saved
            ? "Removed from saved opportunities."
            : "Saved to your bookmarks."
          : (r.error ?? "Could not update saved items.")
      );
    },
    async apply() {
      if (busy || application || closed) return;
      setBusy("apply");
      const r = await apply(o.id);
      setBusy(null);
      if (r.ok) triggerMilestoneCelebration();
      notify(
        r.ok ? "success" : "error",
        r.ok
          ? `Application submitted for ${o.title}.`
          : (r.error ?? "Could not submit application.")
      );
    },
  };
}

export function SampleBadge({ sample = true }: { sample?: boolean }) {
  if (!sample) {
    return (
      <span
        title="Official listing from a verified company on SkillBridge"
        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Verified Partner
      </span>
    );
  }
  return (
    <span
      title="Sample role for demonstration and testing"
      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400"
    >
      Sample Role
    </span>
  );
}

export function TypePill({ type }: { type: OppType }) {
  const styles: Record<OppType, string> = {
    Internship:
      "bg-orange-500/10 text-[#FF6A00] border-orange-500/25 dark:bg-sb-cyan/15 dark:text-sb-cyan dark:border-sb-cyan/30",
    "Full-time Job":
      "bg-purple-500/10 text-purple-600 border-purple-500/25 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
    Project:
      "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
    Hackathon:
      "bg-pink-500/10 text-pink-600 border-pink-500/25 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40",
    Freelance:
      "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${styles[type] || "border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-neutral-300"}`}
    >
      <Briefcase size={11} className="opacity-80" />
      {type}
    </span>
  );
}

export function WorkModePill({ mode }: { mode: WorkMode }) {
  const Icon = mode === "Remote" ? Globe : mode === "Hybrid" ? Laptop : Building2;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200/80 bg-neutral-100/60 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
      <Icon size={11} className="opacity-75" />
      {mode}
    </span>
  );
}

export function ActionButtons({
  o,
  onView,
  compact = false,
}: {
  o: Opportunity;
  onView?: () => void;
  compact?: boolean;
}) {
  const a = useOppActions(o);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900 active:scale-98 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/[0.12] dark:hover:text-white"
        >
          <span>View Details</span>
          <ArrowUpRight size={13} className="opacity-70" />
        </button>
      )}

      <button
        type="button"
        onClick={a.toggleSave}
        aria-pressed={a.saved}
        disabled={a.busy === "save"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
          a.saved
            ? "border-[#FF6A00]/40 bg-[#FFF7ED] text-[#FF6A00] dark:border-sb-cyan/40 dark:bg-sb-cyan/15 dark:text-sb-cyan"
            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
        }`}
        aria-label={a.saved ? `Unsave ${o.title}` : `Save ${o.title}`}
        title={a.saved ? "Saved to bookmarks" : "Save for later"}
      >
        {a.saved ? (
          <BookmarkCheck size={14} className="fill-current text-[#FF6A00] dark:text-sb-cyan" />
        ) : (
          <Bookmark size={14} />
        )}
        {!compact && (a.saved ? "Saved" : "Save")}
      </button>

      {a.application ? (
        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-400">
          <CheckCircle2 size={13} />
          {a.application.status || "Applied"}
        </span>
      ) : (
        <button
          type="button"
          onClick={a.apply}
          disabled={a.closed || a.busy === "apply"}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-98 ${
            a.closed
              ? "cursor-not-allowed bg-neutral-300 text-neutral-500 dark:bg-white/10 dark:text-neutral-500"
              : "bg-gradient-to-r from-[#FF6A00] to-[#E94E00] hover:from-[#E94E00] hover:to-[#D93820] dark:from-sb-blue dark:to-sb-cyan dark:hover:brightness-110"
          }`}
        >
          {a.busy === "apply" && <Loader2 size={13} className="animate-spin" />}
          {a.closed ? "Closed" : "Apply Now"}
        </button>
      )}
    </div>
  );
}

export function OpportunityCard({
  o,
  onView,
  layout = "grid",
}: {
  o: Opportunity;
  onView: () => void;
  layout?: "grid" | "list";
}) {
  const { data } = useStudent();
  const a = useOppActions(o);

  // Compare required skills against student's verified skills
  const studentSkillNames = useMemo(
    () => new Set(data.skills.map((s) => s.name.toLowerCase())),
    [data.skills]
  );

  const matchedSkills = useMemo(
    () => o.skills.filter((s) => studentSkillNames.has(s.toLowerCase())),
    [o.skills, studentSkillNames]
  );

  const matchRatio = o.skills.length > 0 ? matchedSkills.length / o.skills.length : 0;
  const isHighMatch = matchedSkills.length > 0 && matchRatio >= 0.5;
  const isFullMatch = matchedSkills.length === o.skills.length && o.skills.length > 0;

  // 3D Perspective tilt
  const {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  } = useInteractiveTilt({
    maxDeg: 5,
    perspective: 900,
    translateY: -2,
  });

  const remainingDays = daysLeft(o.deadline);
  const isUrgentDeadline = remainingDays >= 0 && remainingDays <= 3;

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={transformStyle}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
        tilt
          ? "border-[#FF6A00]/40 bg-white shadow-[0_12px_28px_-6px_rgba(255,106,0,0.14),inset_0_1px_0_#FFFFFF] dark:border-sb-cyan/40 dark:bg-[#0D121F] dark:shadow-[0_14px_32px_-8px_rgba(0,123,167,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]"
          : "border-neutral-200/90 bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_#FFFFFF] dark:border-white/10 dark:bg-[#0D121F]/90 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
      } ${layout === "list" ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}
    >
      {/* Dynamic Specular Edge Highlight */}
      <div
        className="pointer-events-none absolute -top-px h-[2px] rounded-full transition-all duration-150 ease-out"
        style={{
          left: tilt && !prefersReduced ? `calc(${tilt.px}% - 50px)` : "calc(50% - 35px)",
          width: tilt && !prefersReduced ? "100px" : "70px",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 106, 0, 0.8) 50%, transparent)",
        }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className={`space-y-3.5 ${layout === "list" ? "flex-1" : ""}`}>
        {/* Header Badges & Quick Save */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <TypePill type={o.type} />
            <WorkModePill mode={o.mode} />
            <SampleBadge sample={o.sample} />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              a.toggleSave();
            }}
            disabled={a.busy === "save"}
            aria-label={a.saved ? `Unsave ${o.title}` : `Save ${o.title}`}
            title={a.saved ? "Saved in bookmarks" : "Save for later"}
            className={`rounded-lg p-1.5 transition-colors ${
              a.saved
                ? "bg-[#FFF7ED] text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan"
                : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/[0.08] dark:hover:text-white"
            }`}
          >
            {a.saved ? (
              <BookmarkCheck size={16} className="fill-current text-[#FF6A00] dark:text-sb-cyan" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>

        {/* Title & Organization */}
        <div>
          <button
            type="button"
            onClick={onView}
            className="text-left font-bold text-base sm:text-lg leading-snug text-neutral-900 group-hover:text-[#FF6A00] transition-colors dark:text-white dark:group-hover:text-sb-cyan"
          >
            {o.title}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-sb-muted">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{o.org}</span>
            {o.department && (
              <>
                <span className="opacity-40">•</span>
                <span>{o.department}</span>
              </>
            )}
          </div>
        </div>

        {/* Metadata Chips (Location, Deadline, Compensation, Openings) */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="opacity-70 text-[#FF6A00] dark:text-sb-cyan" />
            {o.location}
          </span>

          <span
            className={`inline-flex items-center gap-1 font-medium ${
              isUrgentDeadline
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : remainingDays < 0
                ? "text-neutral-400 dark:text-neutral-500 line-through"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <CalendarClock size={12} className="opacity-70" />
            {deadlineText(o.deadline)}
          </span>

          {o.salaryRange && (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <Coins size={12} className="opacity-75" />
              {o.salaryRange}
            </span>
          )}

          {o.openings !== undefined && o.openings > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users size={12} className="opacity-70" />
              {o.openings} {o.openings === 1 ? "opening" : "openings"}
            </span>
          )}
        </div>

        {/* Real Verified Skills Match Indicator */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-2 pb-1.5 text-[11px]">
            <span className="font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span>Required Skills</span>
              {matchedSkills.length > 0 && (
                <span className="font-semibold text-[#FF6A00] dark:text-sb-cyan">
                  ({matchedSkills.length}/{o.skills.length} match)
                </span>
              )}
            </span>

            {isFullMatch ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400">
                <Sparkles size={11} /> 100% Match
              </span>
            ) : isHighMatch ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-[10px] text-[#FF6A00] dark:text-sb-cyan">
                <Sparkles size={11} /> High Match
              </span>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-1.5" aria-label="Required skills">
            {o.skills.map((s) => {
              const isMatch = studentSkillNames.has(s.toLowerCase());
              return (
                <li
                  key={s}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                    isMatch
                      ? "border border-[#FED7AA] bg-[#FFF7ED] font-semibold text-[#FF6A00] dark:border-sb-cyan/40 dark:bg-sb-cyan/15 dark:text-sb-cyan"
                      : "border border-neutral-200/80 bg-neutral-100/60 font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400"
                  }`}
                >
                  {isMatch && <Check size={11} className="stroke-[3]" />}
                  <span>{s}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer / Action Area */}
      <div
        className={`mt-4 pt-3.5 border-t border-neutral-100 dark:border-white/[0.06] flex items-center justify-between gap-3 ${
          layout === "list" ? "sm:mt-0 sm:pt-0 sm:border-t-0 sm:flex-col sm:items-end" : ""
        }`}
      >
        <button
          type="button"
          onClick={onView}
          className="text-xs font-semibold text-neutral-700 hover:text-[#FF6A00] dark:text-neutral-300 dark:hover:text-sb-cyan inline-flex items-center gap-1"
        >
          <span>Details</span>
          <ArrowUpRight size={13} />
        </button>

        <div className="flex items-center gap-2">
          {a.application ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-400">
              <CheckCircle2 size={13} />
              {a.application.status || "Applied"}
            </span>
          ) : (
            <button
              type="button"
              onClick={a.apply}
              disabled={a.closed || a.busy === "apply"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-98 ${
                a.closed
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-white/10 dark:text-neutral-500"
                  : "bg-gradient-to-r from-[#FF6A00] to-[#E94E00] hover:from-[#E94E00] hover:to-[#D93820] dark:from-sb-blue dark:to-sb-cyan dark:hover:brightness-110"
              }`}
            >
              {a.busy === "apply" && <Loader2 size={12} className="animate-spin" />}
              {a.closed ? "Closed" : "Apply Now"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function OpportunityModal({
  o,
  onClose,
}: {
  o: Opportunity | null;
  onClose: () => void;
}) {
  const { data } = useStudent();

  // Compare required skills against student's verified skills
  const studentSkillNames = useMemo(
    () => new Set(data.skills.map((s) => s.name.toLowerCase())),
    [data.skills]
  );

  const matchedSkills = useMemo(
    () => (o ? o.skills.filter((s) => studentSkillNames.has(s.toLowerCase())) : []),
    [o, studentSkillNames]
  );

  const missingSkills = useMemo(
    () => (o ? o.skills.filter((s) => !studentSkillNames.has(s.toLowerCase())) : []),
    [o, studentSkillNames]
  );

  return (
    <Modal
      open={!!o}
      onClose={onClose}
      title={o?.title ?? ""}
      footer={o && <ActionButtons o={o} />}
    >
      {o && (
        <div className="space-y-5 text-sm">
          {/* Header metadata row */}
          <div className="flex flex-wrap items-center gap-2">
            <TypePill type={o.type} />
            <WorkModePill mode={o.mode} />
            <SampleBadge sample={o.sample} />
            {o.department && (
              <span className="rounded-md border border-neutral-200 bg-neutral-100/70 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
                {o.department}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white">{o.org}</h4>
            <p className="text-xs text-neutral-500 dark:text-sb-muted">
              Published on {formatDate(o.postedAt)}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Location
              </span>
              <p className="mt-0.5 text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <MapPin size={11} className="text-[#FF6A00] dark:text-sb-cyan" />
                {o.location}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Deadline
              </span>
              <p className="mt-0.5 text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <CalendarClock size={11} className="text-[#FF6A00] dark:text-sb-cyan" />
                {deadlineText(o.deadline)}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Compensation
              </span>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Coins size={11} />
                {o.salaryRange || "Competitive / Stipend"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Openings
              </span>
              <p className="mt-0.5 text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <Users size={11} />
                {o.openings ? `${o.openings} positions` : "Multiple"}
              </p>
            </div>
          </div>

          {/* Verified Skills Match Section */}
          <div className="rounded-xl border border-neutral-200/90 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#FF6A00] dark:text-sb-cyan" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Verified Skills Match
                </span>
              </div>
              <span className="text-xs font-semibold text-[#FF6A00] dark:text-sb-cyan">
                {matchedSkills.length} of {o.skills.length} skills matched
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {matchedSkills.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                    <Check size={12} className="stroke-[3]" /> Your verified skills that match:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-xs font-semibold text-[#FF6A00] dark:border-sb-cyan/40 dark:bg-sb-cyan/15 dark:text-sb-cyan"
                      >
                        <Check size={11} className="stroke-[3]" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missingSkills.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {matchedSkills.length > 0 ? "Additional skills needed:" : "Required skills:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100/70 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Role Overview & Responsibilities
            </h5>
            <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {o.description}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-neutral-200/80 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-neutral-400">
            {o.sample ? (
              <p>
                ℹ️ <strong>Sample Opportunity:</strong> This listing is for demonstration and profile testing. Applying registers an application in your student account dashboard.
              </p>
            ) : (
              <p>
                ✓ <strong>Verified Employer Listing:</strong> This opportunity is published directly by a partner organization registered on SkillBridge.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}