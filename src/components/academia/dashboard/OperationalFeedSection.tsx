"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/components/student/ui";
import type { AcademiaAuditItem, InstitutionAnnouncement } from "@/lib/academia/types";

interface OperationalFeedProps {
  announcements: InstitutionAnnouncement[];
  auditLog: AcademiaAuditItem[];
}

export default function OperationalFeedSection({
  announcements,
  auditLog,
}: OperationalFeedProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* 1. Campus Announcements (6 cols) */}
      <section aria-labelledby="announcements-title" className="glass min-w-0 p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md lg:col-span-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#007BA7]/30 bg-[#007BA7]/10 text-[#007BA7] dark:border-sb-cyan/35 dark:bg-sb-blue/15 dark:text-sb-cyan shadow-xs">
              <Megaphone size={17} />
            </span>
            <div>
              <h2 id="announcements-title" className="text-base font-bold text-[var(--color-text)]">
                Campus Notices &amp; Announcements
              </h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">
                Official broadcasts to departments, students, and placement cohorts
              </p>
            </div>
          </div>
          <Link
            href="/academia/announcements"
            className="btn-bounce-sm inline-flex items-center gap-1.5 rounded-xl border border-[#E3E3E3] dark:border-white/10 bg-white/90 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#007BA7] dark:text-sb-cyan hover:border-[#007BA7]/40 dark:hover:border-sb-cyan/40 shadow-xs transition-all"
          >
            Publish <ArrowRight size={14} />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/80 dark:bg-[var(--field-bg)] p-6 text-center text-xs text-sb-muted light:text-[#686868]">
            <Megaphone size={20} className="mx-auto text-[#007BA7]/70" />
            <p className="mt-2 font-semibold text-[var(--color-text)]">No campus announcements published</p>
            <p className="mt-0.5">Broadcast placement drives, academic deadlines, or workshops.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="rounded-2xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/80 dark:bg-[var(--field-bg)] p-4 transition-all duration-200 hover:border-[#007BA7]/40 hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">{ann.title}</span>
                  <div className="flex items-center gap-1.5 flex-none">
                    {ann.priority === "Urgent" && (
                      <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        Urgent
                      </span>
                    )}
                    <span className="rounded-full border border-[#007BA7]/35 bg-[#007BA7]/15 px-2 py-0.5 text-[10px] font-semibold text-[#007BA7] dark:text-sb-cyan">
                      {ann.audience}
                    </span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-sb-muted light:text-[#686868]">{ann.body}</p>
                <p className="mt-2 text-[11px] text-sb-muted light:text-[#686868]">
                  {ann.authorName} · {formatDate(ann.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Institutional Audit Trail (6 cols) */}
      <section aria-labelledby="audit-trail-title" className="glass min-w-0 p-6 rounded-3xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs transition-all duration-300 hover:shadow-md lg:col-span-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#007BA7]/30 bg-[#007BA7]/10 text-[#007BA7] dark:border-sb-cyan/35 dark:bg-sb-blue/15 dark:text-sb-cyan shadow-xs">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h2 id="audit-trail-title" className="text-base font-bold text-[var(--color-text)]">
                Institutional Audit Trail
              </h2>
              <p className="text-xs text-sb-muted light:text-[#686868]">
                Immutable activity log of administrative, placement, and academic updates
              </p>
            </div>
          </div>
          <Calendar size={16} className="text-[#007BA7] dark:text-sb-cyan" />
        </div>

        {auditLog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/80 dark:bg-[var(--field-bg)] p-6 text-center text-xs text-sb-muted light:text-[#686868]">
            No audit events recorded yet.
          </div>
        ) : (
          <ol className="space-y-2.5">
            {auditLog.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/80 dark:bg-[var(--field-bg)] px-4 py-3 text-xs transition-all duration-200 hover:border-[#007BA7]/40 hover:shadow-xs"
              >
                <CheckCircle2 size={14} className="mt-0.5 flex-none text-[#007BA7] dark:text-sb-cyan" />
                <div className="min-w-0 flex-1">
                  <Link href={item.href} className="text-[var(--color-text)] hover:text-[#007BA7] dark:hover:text-sb-cyan font-medium transition-colors">
                    <strong>{item.actorName}</strong> ({item.actorRole}): {item.action}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-sb-muted light:text-[#686868]">
                    <Clock size={10} /> {formatDate(item.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
