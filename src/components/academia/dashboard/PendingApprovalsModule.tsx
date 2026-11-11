"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type {
  AcademicOpportunity,
  AcademiaRole,
  IndustryPartnership,
  InstitutionProfile,
  InstitutionStudentRecord,
} from "@/lib/academia/types";
import type { CampusEvent } from "@/lib/industry/types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

interface PendingApprovalsProps {
  industryCampusEvents: CampusEvent[];
  institution: InstitutionProfile;
  students: InstitutionStudentRecord[];
  partnerships: IndustryPartnership[];
  academicOpportunities: AcademicOpportunity[];
  role: AcademiaRole;
  onApproveEvent: (eventId: string, title: string) => Promise<void>;
}

export default function PendingApprovalsModule({
  industryCampusEvents,
  institution,
  students,
  partnerships,
  academicOpportunities,
  role,
  onApproveEvent,
}: PendingApprovalsProps) {
  const [tab, setTab] = useState<"all" | "drives" | "partnerships" | "governance">("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingDrives = useMemo(
    () => industryCampusEvents.filter((ev) => ev.institutionApproval === "Pending institution approval"),
    [industryCampusEvents],
  );

  const pendingPartnerships = useMemo(
    () => partnerships.filter((p) => p.status === "Requested" || p.status === "In Discussion"),
    [partnerships],
  );

  const inProcessStudents = useMemo(
    () => students.filter((s) => s.placementStatus === "In Process"),
    [students],
  );

  const draftOpportunities = useMemo(
    () => academicOpportunities.filter((o) => o.status === "Draft"),
    [academicOpportunities],
  );

  const isVerificationPending =
    institution.verificationStatus === "Pending Verification" ||
    institution.verificationStatus === "Action Required";

  const totalPendingCount =
    pendingDrives.length +
    pendingPartnerships.length +
    (isVerificationPending ? 1 : 0) +
    draftOpportunities.length;

  const handleApprove = async (eventId: string, title: string) => {
    setApprovingId(eventId);
    try {
      await onApproveEvent(eventId, title);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section aria-labelledby="pending-approvals-title" className="glass relative flex flex-col justify-between p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-xs">
            <Clock size={17} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="pending-approvals-title" className="text-base font-bold tracking-tight text-[var(--color-text)]">
                Institutional Approvals &amp; Governance Center
              </h2>
              {totalPendingCount > 0 ? (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <SpinningCounter value={totalPendingCount} /> Action Item{totalPendingCount === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  All Clear
                </span>
              )}
            </div>
            <p className="text-xs text-sb-muted light:text-[#686868]">
              Corporate drive authorizations, partnership MoUs, and academic clearances
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="inline-flex rounded-xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/90 dark:bg-[var(--field-bg)] p-1 text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              tab === "all"
                ? "bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] shadow-xs"
                : "text-sb-muted light:text-[#686868] hover:text-[var(--color-text)]"
            }`}
          >
            All (<SpinningCounter value={totalPendingCount} />)
          </button>
          <button
            type="button"
            onClick={() => setTab("drives")}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              tab === "drives"
                ? "bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] shadow-xs"
                : "text-sb-muted light:text-[#686868] hover:text-[var(--color-text)]"
            }`}
          >
            Campus Drives (<SpinningCounter value={pendingDrives.length} />)
          </button>
          <button
            type="button"
            onClick={() => setTab("partnerships")}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              tab === "partnerships"
                ? "bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-[#0B101D] shadow-xs"
                : "text-sb-muted light:text-[#686868] hover:text-[var(--color-text)]"
            }`}
          >
            Partnerships (<SpinningCounter value={pendingPartnerships.length} />)
          </button>
        </div>
      </div>

      {/* Item List / Action Cards */}
      <div className="mt-5 space-y-3">
        {totalPendingCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--glass-border)] p-6 text-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
            <h3 className="mt-2 text-sm font-semibold text-[var(--color-text)]">
              All Administrative Approvals Are Up to Date
            </h3>
            <p className="mt-1 text-xs text-sb-muted">
              No campus recruitment drives, partnership requests, or verification flags require immediate sign-off.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Pending Industry Campus Drives */}
            {(tab === "all" || tab === "drives") &&
              pendingDrives.map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sb-cyan/35 bg-sb-blue/10 p-3.5 transition-all hover:border-sb-cyan/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-text)]">{ev.title}</span>
                      <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        Pending Drive Approval
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-sb-muted">
                      {ev.type} · {ev.date} at {ev.time} ({ev.mode})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/academia/placements"
                      className="btn btn-ghost btn-sm text-xs text-sb-muted hover:text-white"
                    >
                      Inspect Details
                    </Link>
                    {role !== "Read-Only Analyst" && (
                      <button
                        type="button"
                        disabled={approvingId === ev.id}
                        onClick={() => handleApprove(ev.id, ev.title)}
                        className="btn btn-primary btn-sm text-xs font-semibold"
                      >
                        {approvingId === ev.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Approving…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} /> Approve Drive
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {/* 2. Institution Accreditation Review */}
            {(tab === "all" || tab === "governance") && isVerificationPending && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/35 bg-amber-400/[0.06] p-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-text)]">
                      Institution Verification: {institution.verificationStatus}
                    </span>
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Accreditation
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-sb-muted">
                    {institution.verificationNote ||
                      "Verification packet submitted for official SkillBridge institutional partner accreditation."}
                  </p>
                </div>
                <Link href="/academia/institution" className="btn btn-glass btn-sm text-xs">
                  Review Submission <ExternalLink size={12} />
                </Link>
              </div>
            )}

            {/* 3. Industry Partnerships awaiting MoU sign-off */}
            {(tab === "all" || tab === "partnerships") &&
              pendingPartnerships.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5 transition-colors hover:border-sb-cyan/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-text)]">{p.companyName}</span>
                      <span className="rounded-full border border-sb-pink/40 bg-sb-pink/15 px-2 py-0.5 text-[10px] font-bold text-sb-pink">
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-sb-muted">
                      {p.industry} · Collaborations: {p.collaborationTypes?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <Link href="/academia/industry-partners" className="btn btn-ghost btn-sm text-xs text-sb-cyan">
                    Review Partner MoU <ArrowRight size={12} />
                  </Link>
                </div>
              ))}

            {/* 4. In-Process Placement Candidates */}
            {(tab === "all" || tab === "drives") && inProcessStudents.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--field-bg)] p-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-text)]">
                      {inProcessStudents.length} Students in Active Interview Rounds
                    </span>
                    <span className="rounded-full border border-sb-cyan/35 bg-sb-blue/15 px-2 py-0.5 text-[10px] font-bold text-sb-cyan">
                      T&amp;P Pipeline
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-sb-muted">
                    Candidates currently at Shortlisted or Interview stages with industry hiring partners.
                  </p>
                </div>
                <Link href="/academia/students" className="btn btn-ghost btn-sm text-xs text-sb-cyan">
                  Review Candidates <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--glass-border)] pt-3 text-xs text-sb-muted">
        <span>Placement cell and corporate partnership actions</span>
        <Link href="/academia/placements" className="font-semibold text-sb-cyan hover:underline">
          Go to Placement Cell Hub →
        </Link>
      </div>
    </section>
  );
}
