"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Megaphone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_PRIORITIES,
  type AnnouncementAudience,
  type AnnouncementPriority,
  type InstitutionAnnouncement,
} from "@/lib/academia/types";

export default function AnnouncementsView() {
  const { data, manageAnnouncements, notify } = useAcademia();
  const { announcements, departments, staff } = data;
  const isReadOnly = staff.role === "Read-Only Analyst";

  const [query, setQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("All Students");
  const [targetDepartment, setTargetDepartment] = useState(
    departments[0]?.name ?? "Computer Science & Engineering",
  );
  const [targetYear, setTargetYear] = useState("4th Year (2027 Batch)");
  const [priority, setPriority] = useState<AnnouncementPriority>("Important");
  const [status, setStatus] = useState<InstitutionAnnouncement["status"]>("Published");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((a) => {
      if (audienceFilter !== "All" && a.audience !== audienceFilter) return false;
      if (priorityFilter !== "All" && a.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q)
      );
    });
  }, [announcements, query, audienceFilter, priorityFilter]);

  async function publishAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await manageAnnouncements(
      {
        title,
        body,
        audience,
        targetDepartment: audience === "Specific Department" ? targetDepartment : undefined,
        targetYear: audience === "Specific Academic Year" ? targetYear : undefined,
        priority,
        status,
      },
      "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error ?? "Failed to post announcement.");
      return;
    }
    notify("success", "Institutional announcement published.");
    setTitle("");
    setBody("");
    setModalOpen(false);
  }

  async function removeAnnouncement(id: string) {
    const res = await manageAnnouncements({ announcementId: id }, "DELETE");
    if (res.ok) notify("success", "Announcement removed.");
    else notify("error", res.error ?? "Failed to remove announcement.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
            <Megaphone size={12} /> Campus Communication Center
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Institutional Announcements &amp; Broadcasts
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-sb-muted">
            Send targeted circulars, placement eligibility notices, and academic deadlines to
            specific departments, graduation cohorts, or faculty members.
          </p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setModalOpen(true);
            }}
            className="btn-primary px-4 py-2.5 text-xs font-semibold text-white"
          >
            <Plus size={15} /> New Broadcast
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="min-w-[230px] flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search announcements by subject, body, or author..."
            aria-label="Search announcements"
            portalVariant="academia"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by audience"
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Audiences</option>
            {ANNOUNCEMENT_AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Priorities</option>
            {ANNOUNCEMENT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Bell size={28} className="mx-auto text-sb-cyan" />
          <h2 className="mt-3 text-base font-semibold">No announcements found</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-sb-muted">
            Broadcast placement schedules, semester project guidelines, or institutional notices to
            keep students and faculty aligned.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="glass-panel rounded-2xl p-5 transition hover:border-sb-cyan/35"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      a.priority === "Urgent"
                        ? "border-sb-pink/45 bg-sb-pink/15 text-sb-pink"
                        : a.priority === "Important"
                          ? "border-sb-cyan/35 bg-sb-cyan/10 text-sb-cyan"
                          : "border-white/15 bg-white/[0.04] text-sb-muted"
                    }`}
                  >
                    {a.priority === "Urgent" && <AlertTriangle size={11} />}
                    {a.priority}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-white/85">
                    Audience: {a.audience}
                    {a.targetDepartment ? ` (${a.targetDepartment})` : ""}
                    {a.targetYear ? ` (${a.targetYear})` : ""}
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] text-emerald-300">
                    {a.status}
                  </span>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeAnnouncement(a.id)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-sb-pink"
                    aria-label={`Delete ${a.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <h2 className="mt-3 text-base font-semibold text-white">{a.title}</h2>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-sb-muted">
                {a.body}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3 text-[11px] text-sb-muted">
                <span>
                  Posted by <strong className="text-white/90">{a.authorName}</strong> ({a.authorRole}
                  )
                </span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ann-modal-title"
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 id="ann-modal-title" className="text-lg font-semibold">
                  Publish Campus Announcement
                </h2>
                <p className="text-xs text-sb-muted">
                  Deliver targeted notices to students, placement cohorts, or faculty.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-sb-muted hover:bg-white/5 hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={publishAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="ann-title">
                  Subject / Title *
                </label>
                <input
                  id="ann-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pre-Placement Talk & Resume Verification Deadline for 2027 Batch"
                  className="field-input"
                />
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="ann-audience">
                    Target Audience
                  </label>
                  <select
                    id="ann-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                    className="field-input"
                  >
                    {ANNOUNCEMENT_AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="ann-priority">
                    Priority Level
                  </label>
                  <select
                    id="ann-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="field-input"
                  >
                    {ANNOUNCEMENT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {audience === "Specific Department" && (
                <div>
                  <label className="field-label" htmlFor="ann-dept">
                    Select Department
                  </label>
                  <input
                    id="ann-dept"
                    type="text"
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="field-input"
                  />
                </div>
              )}

              {audience === "Specific Academic Year" && (
                <div>
                  <label className="field-label" htmlFor="ann-year">
                    Academic Year / Batch
                  </label>
                  <input
                    id="ann-year"
                    type="text"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="field-input"
                  />
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="ann-body">
                  Announcement Message *
                </label>
                <textarea
                  id="ann-body"
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write clear instructions, venue details, or links for recipients..."
                  className="field-input"
                />
                {errors.body && <p className="field-error">{errors.body}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="ann-status">
                  Delivery Status
                </label>
                <select
                  id="ann-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as InstitutionAnnouncement["status"])
                  }
                  className="field-input"
                >
                  <option value="Published">Publish Immediately</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary px-5 py-2 text-xs font-semibold text-white"
                >
                  <CheckCircle2 size={14} />
                  {busy ? "Publishing..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
