"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Columns3,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutList,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { StagePill } from "./IndustryDashboardView";
import SearchInput from "@/components/ui/SearchInput";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
  TextField,
  formatDate,
} from "@/components/student/ui";
import { ATS_STAGES, INTERVIEW_TYPES, type AtsApplicant, type AtsStage, type InterviewType } from "@/lib/industry/types";

export default function ApplicantsView({
  initialJobId = "All",
  initialStage = "All",
  initialAppId = "",
}: {
  initialJobId?: string;
  initialStage?: string;
  initialAppId?: string;
}) {
  const { data, updateApplicants, saveInterview, sendMessage, notify } = useIndustry();
  const { recruiter, jobs, applicants } = data;
  const canMoveStage = recruiter.role !== "Interviewer";

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [q, setQ] = useState("");
  const [jobFilter, setJobFilter] = useState<string>(initialJobId);
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [gradYearFilter, setGradYearFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "name">("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState<AtsStage>("Shortlisted");
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [busyBulk, setBusyBulk] = useState(false);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);

  const [activeAppId, setActiveAppId] = useState<string | null>(initialAppId || null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Quick Schedule Interview modal state
  const [scheduleTarget, setScheduleTarget] = useState<AtsApplicant | null>(null);
  const [defaultInterviewTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [ivDate, setIvDate] = useState(defaultInterviewTime);
  const [ivDuration, setIvDuration] = useState("45");
  const [ivType, setIvType] = useState<InterviewType>("Online");
  const [ivLink, setIvLink] = useState("https://meet.example.com/skillbridge-interview");
  const [ivRound, setIvRound] = useState("Technical Round 1");
  const [ivNotes, setIvNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Quick Message modal state
  const [messageTarget, setMessageTarget] = useState<AtsApplicant | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const gradYears = useMemo(() => {
    const set = new Set<string>();
    for (const a of applicants) if (a.candidate.gradYear) set.add(a.candidate.gradYear);
    return Array.from(set).sort();
  }, [applicants]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const skillQ = skillFilter.trim().toLowerCase();
    const list = applicants.filter((a) => {
      if (jobFilter !== "All" && a.jobId !== jobFilter) return false;
      if (stageFilter !== "All" && a.stage !== stageFilter) return false;
      if (gradYearFilter !== "All" && a.candidate.gradYear !== gradYearFilter) return false;
      if (skillQ && !a.candidate.skills.some((s) => s.name.toLowerCase().includes(skillQ))) return false;
      if (query) {
        const hay = [
          a.candidate.name,
          a.candidate.college,
          a.candidate.degree,
          a.candidate.branch,
          a.jobTitle,
          ...a.candidate.skills.map((s) => s.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "name") return a.candidate.name.localeCompare(b.candidate.name);
      return +new Date(b.appliedAt) - +new Date(a.appliedAt);
    });
    return list;
  }, [applicants, jobFilter, stageFilter, gradYearFilter, skillFilter, q, sortBy]);

  const activeApp = useMemo(
    () => (activeAppId ? applicants.find((a) => a.applicationId === activeAppId) ?? null : null),
    [applicants, activeAppId],
  );

  const handleSingleStageChange = async (applicationId: string, stage: AtsStage) => {
    setBusyAppId(applicationId);
    const res = await updateApplicants({ applicationId, stage });
    setBusyAppId(null);
    if (res.ok) notify("success", `Applicant moved to ${stage}.`);
    else notify("error", res.error);
  };

  const handleBulkStageConfirm = async () => {
    if (selectedIds.length === 0) return;
    setBusyBulk(true);
    const res = await updateApplicants({ applicationIds: selectedIds, stage: bulkStage });
    setBusyBulk(false);
    setConfirmBulkOpen(false);
    if (res.ok) {
      notify("success", `Moved ${selectedIds.length} applicant(s) to ${bulkStage}.`);
      setSelectedIds([]);
    } else {
      notify("error", res.error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !noteDraft.trim()) return;
    setSavingNote(true);
    const res = await updateApplicants({ applicationId: activeApp.applicationId, note: noteDraft });
    setSavingNote(false);
    if (res.ok) {
      setNoteDraft("");
      notify("success", "Evaluation note saved.");
    } else {
      notify("error", res.error);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTarget) return;
    setScheduling(true);
    const res = await saveInterview({
      applicationId: scheduleTarget.applicationId,
      candidateId: scheduleTarget.candidateId,
      jobId: scheduleTarget.jobId,
      scheduledAt: ivDate,
      durationMinutes: Number(ivDuration) || 45,
      timezone: "IST (UTC+05:30)",
      type: ivType,
      locationOrLink: ivLink,
      interviewer: recruiter.name,
      round: ivRound,
      notes: ivNotes,
    });
    setScheduling(false);
    if (res.ok) {
      notify("success", `Interview scheduled with ${scheduleTarget.candidate.name}.`);
      setScheduleTarget(null);
    } else {
      notify("error", res.error);
    }
  };

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTarget || !messageText.trim()) return;
    setSendingMsg(true);
    const res = await sendMessage({
      candidateId: messageTarget.candidateId,
      jobId: messageTarget.jobId,
      body: messageText,
    });
    setSendingMsg(false);
    if (res.ok) {
      notify("success", `Message sent to ${messageTarget.candidate.name}.`);
      setMessageText("");
      setMessageTarget(null);
    } else {
      notify("error", res.error);
    }
  };

  const exportCsv = () => {
    const headers = ["Candidate Name", "College", "Degree", "Branch", "Grad Year", "Job Title", "Stage", "Applied Date", "Skills"];
    const rows = filtered.map((a) => [
      a.candidate.name,
      a.candidate.college || "-",
      a.candidate.degree || "-",
      a.candidate.branch || "-",
      a.candidate.gradYear || "-",
      a.jobTitle,
      a.stage,
      a.appliedAt.slice(0, 10),
      a.candidate.skills.map((s) => s.name).join("; "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skillbridge-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.applicationId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicant Tracking System (ATS)"
        subtitle="Review student applications, move candidates across hiring stages, record evaluation notes, and schedule interviews."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "table" ? "bg-sb-blue/25 text-white" : "text-sb-muted hover:text-white"
                }`}
              >
                <LayoutList size={14} /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                aria-pressed={viewMode === "kanban"}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "kanban" ? "bg-sb-blue/25 text-white" : "text-sb-muted hover:text-white"
                }`}
              >
                <Columns3 size={14} /> Pipeline Board
              </button>
            </div>
            {filtered.length > 0 && (
              <button type="button" onClick={exportCsv} className="btn btn-glass btn-sm">
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="glass space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search candidate, college, degree, or job…"
              aria-label="Search applicants"
              portalVariant="industry"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by job listing"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="field"
            >
              <option value="All">All Job Listings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="field"
            >
              <option value="All">All Stages</option>
              {ATS_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <SearchInput
              value={skillFilter}
              onChange={setSkillFilter}
              placeholder="Filter by skill (e.g. React)…"
              aria-label="Filter by skill"
              portalVariant="industry"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-sb-muted">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5">
              <span>Grad year:</span>
              <select
                value={gradYearFilter}
                onChange={(e) => setGradYearFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#101318] px-2 py-1 text-xs text-white"
              >
                <option value="All">All</option>
                {gradYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-white/10 bg-[#101318] px-2 py-1 text-xs text-white"
              >
                <option value="newest">Newest Applied</option>
                <option value="name">Candidate Name</option>
              </select>
            </label>
          </div>

          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of {applicants.length} applicant
            {applicants.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Bulk Action Bar */}
        {canMoveStage && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sb-cyan/40 bg-sb-blue/15 px-4 py-2.5 text-xs">
            <span>
              <strong className="text-white">{selectedIds.length}</strong> candidate
              {selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Bulk target stage"
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value as AtsStage)}
                className="rounded-lg border border-white/20 bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white"
              >
                {ATS_STAGES.map((s) => (
                  <option key={s} value={s}>
                    Move to: {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setConfirmBulkOpen(true)}
                className="btn btn-primary btn-sm"
              >
                Apply Stage Change
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="btn btn-ghost btn-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title={applicants.length === 0 ? "No applicants in your pipeline yet" : "No applicants match your filters"}
          text={
            applicants.length === 0
              ? "Publish a job listing so students can apply, or browse Talent Discovery to add promising candidates directly to a job pipeline."
              : "Try clearing your stage, job, or skill filters."
          }
          action={
            applicants.length === 0 ? (
              <div className="flex flex-wrap justify-center gap-2.5">
                <Link href="/industry/jobs/new" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Post a Job
                </Link>
                <Link href="/industry/talent" className="btn btn-glass btn-sm">
                  Discover Student Talent
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => {
                  setQ("");
                  setJobFilter("All");
                  setStageFilter("All");
                  setSkillFilter("");
                  setGradYearFilter("All");
                }}
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-sb-muted">
                <tr>
                  {canMoveStage && (
                    <th className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Select all applicants"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-white/25 accent-sb-blue"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Education & Skills</th>
                  <th className="px-4 py-3.5">Role Applied</th>
                  <th className="px-4 py-3.5">Hiring Stage</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((app) => {
                  const checked = selectedIds.includes(app.applicationId);
                  return (
                    <tr key={app.applicationId} className="hover:bg-white/[0.02]">
                      {canMoveStage && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            aria-label={`Select ${app.candidate.name}`}
                            checked={checked}
                            onChange={() =>
                              setSelectedIds((prev) =>
                                checked
                                  ? prev.filter((id) => id !== app.applicationId)
                                  : [...prev, app.applicationId],
                              )
                            }
                            className="h-4 w-4 rounded border-white/25 accent-sb-blue"
                          />
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.candidate.name} src={app.candidate.avatar} size={38} />
                          <div>
                            <button
                              type="button"
                              onClick={() => setActiveAppId(app.applicationId)}
                              className="font-semibold text-white hover:text-sb-cyan"
                            >
                              {app.candidate.name}
                            </button>
                            <p className="text-xs text-sb-muted">
                              Applied {formatDate(app.appliedAt)}
                              {app.isDemoRecord ? " · Demo" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-white">
                          {app.candidate.degree || "Degree not listed"}
                          {app.candidate.branch ? ` · ${app.candidate.branch}` : ""}
                        </p>
                        <p className="text-xs text-sb-muted">
                          {app.candidate.college || "College not listed"}
                          {app.candidate.gradYear ? ` (${app.candidate.gradYear})` : ""}
                        </p>
                        {app.candidate.skills.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {app.candidate.skills.slice(0, 4).map((s) => (
                              <span
                                key={s.id}
                                className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-sb-muted"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-white">{app.jobTitle}</p>
                        <p className="text-xs text-sb-muted">{app.jobType}</p>
                      </td>
                      <td className="px-4 py-4">
                        {canMoveStage ? (
                          <select
                            aria-label={`Change stage for ${app.candidate.name}`}
                            disabled={busyAppId === app.applicationId}
                            value={app.stage}
                            onChange={(e) => handleSingleStageChange(app.applicationId, e.target.value as AtsStage)}
                            className="rounded-lg border border-white/15 bg-[#101318] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-sb-cyan"
                          >
                            {ATS_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StagePill stage={app.stage} />
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveAppId(app.applicationId)}
                            className="btn btn-glass btn-sm"
                          >
                            Evaluate
                          </button>
                          <button
                            type="button"
                            onClick={() => setScheduleTarget(app)}
                            className="btn btn-ghost btn-sm"
                            title="Schedule Interview"
                          >
                            <Calendar size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageTarget(app)}
                            className="btn btn-ghost btn-sm"
                            title="Message Candidate"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline Board View */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ATS_STAGES.map((stage) => {
            const items = filtered.filter((a) => a.stage === stage);
            return (
              <div key={stage} className="glass flex flex-col p-4">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
                  <StagePill stage={stage} />
                  <span className="text-xs font-bold text-sb-muted">{items.length}</span>
                </div>

                {items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-sb-muted">No candidates in {stage}</p>
                ) : (
                  <div className="space-y-2.5">
                    {items.map((app) => (
                      <div
                        key={app.applicationId}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveAppId(app.applicationId)}
                            className="text-left text-sm font-semibold hover:text-sb-cyan"
                          >
                            {app.candidate.name}
                          </button>
                          {app.notes.length > 0 && (
                            <span className="rounded bg-sb-blue/20 px-1.5 py-0.5 text-[10px] text-sb-cyan">
                              {app.notes.length} note{app.notes.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-sb-muted">{app.jobTitle}</p>
                        {app.candidate.college && (
                          <p className="mt-1 text-[11px] text-sb-muted">{app.candidate.college}</p>
                        )}
                        {canMoveStage && (
                          <div className="mt-2.5 pt-2 border-t border-white/10">
                            <select
                              aria-label={`Move ${app.candidate.name} stage`}
                              value={app.stage}
                              onChange={(e) => handleSingleStageChange(app.applicationId, e.target.value as AtsStage)}
                              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-2 py-1 text-xs text-white"
                            >
                              {ATS_STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Move to: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Evaluation Detail Modal */}
      <Modal
        open={!!activeApp}
        onClose={() => setActiveAppId(null)}
        title={activeApp ? `Candidate Review — ${activeApp.candidate.name}` : "Candidate Review"}
        footer={
          activeApp ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const target = activeApp;
                  setActiveAppId(null);
                  setMessageTarget(target);
                }}
                className="btn btn-glass btn-sm"
              >
                <MessageSquare size={14} /> Message
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = activeApp;
                  setActiveAppId(null);
                  setScheduleTarget(target);
                }}
                className="btn btn-primary btn-sm"
              >
                <Calendar size={14} /> Schedule Interview
              </button>
            </>
          ) : undefined
        }
      >
        {activeApp && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <Avatar name={activeApp.candidate.name} src={activeApp.candidate.avatar} size={52} />
                <div>
                  <h3 className="text-base font-bold">{activeApp.candidate.name}</h3>
                  <p className="text-xs text-sb-muted">{activeApp.candidate.headline}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-sb-cyan">
                    <GraduationCap size={13} />
                    {activeApp.candidate.college || "College not specified"} · {activeApp.candidate.degree}{" "}
                    {activeApp.candidate.branch} ({activeApp.candidate.gradYear || "N/A"})
                  </p>
                </div>
              </div>

              {canMoveStage && (
                <div>
                  <label className="block text-[11px] text-sb-muted">Current Stage</label>
                  <select
                    value={activeApp.stage}
                    onChange={(e) => handleSingleStageChange(activeApp.applicationId, e.target.value as AtsStage)}
                    className="mt-1 rounded-xl border border-sb-cyan/40 bg-[#101318] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {ATS_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeApp.candidate.bio && (
              <p className="text-xs leading-relaxed text-sb-muted">{activeApp.candidate.bio}</p>
            )}

            {/* Resume & External Links */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
                <FileText size={13} className="text-sb-cyan" />
                {activeApp.candidate.hasResume
                  ? `Resume uploaded (${activeApp.candidate.resumeName ?? "PDF"})`
                  : "No resume file uploaded yet"}
              </span>
              {activeApp.candidate.github && (
                <a
                  href={activeApp.candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sb-cyan hover:border-sb-cyan/40"
                >
                  GitHub <ExternalLink size={12} />
                </a>
              )}
              {activeApp.candidate.linkedin && (
                <a
                  href={activeApp.candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sb-cyan hover:border-sb-cyan/40"
                >
                  LinkedIn <ExternalLink size={12} />
                </a>
              )}
              {activeApp.candidate.portfolio && (
                <a
                  href={activeApp.candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sb-cyan hover:border-sb-cyan/40"
                >
                  Portfolio <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Verified & Listed Skills</h4>
              {activeApp.candidate.skills.length === 0 ? (
                <p className="mt-1 text-xs text-sb-muted">No skills listed yet.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeApp.candidate.skills.map((s) => (
                    <span key={s.id} className="chip">
                      {s.name} · <span className="text-sb-muted">{s.level}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            {activeApp.candidate.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Student Projects</h4>
                <div className="mt-2 space-y-2">
                  {activeApp.candidate.projects.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-xs font-semibold text-white">{p.title}</p>
                      <p className="mt-1 text-xs text-sb-muted">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Evaluation Notes */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
                Internal Recruiter Evaluation Notes
              </h4>
              <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add an internal evaluation note for your hiring team…"
                  className="field text-xs"
                />
                <button type="submit" disabled={savingNote || !noteDraft.trim()} className="btn btn-glass btn-sm">
                  {savingNote ? <Loader2 size={14} className="animate-spin" /> : "Add Note"}
                </button>
              </form>

              {activeApp.notes.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {activeApp.notes.map((n) => (
                    <li key={n.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                      <p className="text-white">{n.content}</p>
                      <p className="mt-1 text-[11px] text-sb-muted">
                        {n.authorName} · {formatDate(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stage History Timeline */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Stage History</h4>
              <ol className="mt-2 space-y-1.5 text-xs text-sb-muted">
                {activeApp.history.map((h, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>
                      Moved to <strong className="text-white">{h.stage}</strong> by {h.changedBy}
                    </span>
                    <span>{formatDate(h.changedAt)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Schedule Interview Modal */}
      <Modal
        open={!!scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        title={scheduleTarget ? `Schedule Interview — ${scheduleTarget.candidate.name}` : "Schedule Interview"}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="rounded-xl border border-sb-cyan/30 bg-sb-blue/10 px-3.5 py-2.5 text-xs text-sb-muted">
            Scheduling an interview automatically moves the applicant to the <strong className="text-white">Interview</strong> stage and displays the session on the student’s Applications page.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Interview Round"
              value={ivRound}
              onChange={(e) => setIvRound(e.target.value)}
              required
            />
            <SelectField
              label="Interview Format"
              options={INTERVIEW_TYPES}
              value={ivType}
              onChange={(e) => setIvType(e.target.value as InterviewType)}
            />
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={ivDate}
              onChange={(e) => setIvDate(e.target.value)}
              required
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              min={15}
              max={240}
              value={ivDuration}
              onChange={(e) => setIvDuration(e.target.value)}
            />
          </div>
          <TextField
            label={ivType === "Online" ? "Meeting Link" : "Location / Phone Details"}
            value={ivLink}
            onChange={(e) => setIvLink(e.target.value)}
            required
          />
          <TextAreaField
            label="Candidate Preparation Notes"
            rows={2}
            optional
            value={ivNotes}
            onChange={(e) => setIvNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setScheduleTarget(null)}>
              Cancel
            </button>
            <button type="submit" disabled={scheduling} className="btn btn-primary btn-sm">
              {scheduling && <Loader2 size={14} className="animate-spin" />}
              Confirm Interview
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Message Modal */}
      <Modal
        open={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        title={messageTarget ? `Message ${messageTarget.candidate.name}` : "Message Candidate"}
      >
        <form onSubmit={handleSendMessageSubmit} className="space-y-4">
          <TextAreaField
            label="Message"
            rows={4}
            placeholder="Hi! Thank you for applying. We reviewed your project portfolio and would love to discuss next steps…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMessageTarget(null)}>
              Cancel
            </button>
            <button type="submit" disabled={sendingMsg || !messageText.trim()} className="btn btn-primary btn-sm">
              {sendingMsg && <Loader2 size={14} className="animate-spin" />}
              Send Message
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Confirmation Modal */}
      <ConfirmModal
        open={confirmBulkOpen}
        onClose={() => setConfirmBulkOpen(false)}
        title="Confirm Bulk Stage Update"
        text={`Move ${selectedIds.length} selected applicant(s) to “${bulkStage}”?`}
        confirmLabel={`Move to ${bulkStage}`}
        busy={busyBulk}
        onConfirm={handleBulkStageConfirm}
      />
    </div>
  );
}
