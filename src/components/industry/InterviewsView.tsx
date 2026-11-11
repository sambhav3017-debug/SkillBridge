"use client";

import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Clock, ExternalLink, LayoutList, Loader2, MapPin, Plus, Star, Video } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import SkillBridgeCalendar, {
  type CalendarAttendee,
  type CalendarEvent,
} from "@/components/ui/SkillBridgeCalendar";
import {
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/student/ui";
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  type InterviewFeedback,
  type InterviewRecord,
  type InterviewStatus,
  type InterviewType,
} from "@/lib/industry/types";

const RECOMMENDATIONS: readonly InterviewFeedback["recommendation"][] = [
  "Strong Hire",
  "Hire",
  "Hold",
  "No Hire",
];

export default function InterviewsView() {
  const { data, saveInterview, notify } = useIndustry();
  const { recruiter, jobs, candidates, interviews } = data;

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [candidateId, setCandidateId] = useState(candidates[0]?.id ?? "");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [defaultTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [scheduledAt, setScheduledAt] = useState(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [timezone, setTimezone] = useState("IST (UTC+05:30)");
  const [type, setType] = useState<InterviewType>("Online");
  const [locationOrLink, setLocationOrLink] = useState("https://meet.example.com/skillbridge-session");
  const [interviewer, setInterviewer] = useState(recruiter.name);
  const [round, setRound] = useState("Technical Round 1");
  const [notes, setNotes] = useState("");
  const [busySchedule, setBusySchedule] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Structured Feedback Modal
  const [feedbackTarget, setFeedbackTarget] = useState<InterviewRecord | null>(null);
  const [rating, setRating] = useState("4");
  const [recommendation, setRecommendation] = useState<InterviewFeedback["recommendation"]>("Hire");
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [busyFeedback, setBusyFeedback] = useState(false);

  // Transitions.dev Calendar Day Card State
  const [selectedDate, setSelectedDate] = useState(() => {
    if (interviews[0]?.scheduledAt) {
      return new Date(interviews[0].scheduledAt).toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  });
  const [activeViewTab, setActiveViewTab] = useState<"calendar" | "list">("calendar");

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return interviews.map((iv) => {
      const d = new Date(iv.scheduledAt);
      const isoDate = !isNaN(d.getTime())
        ? d.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const timeFormatted = !isNaN(d.getTime())
        ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "10:00 AM";

      const attendees: CalendarAttendee[] = [
        {
          id: iv.candidateId,
          name: iv.candidateName,
          role: "Candidate",
        },
        {
          id: `recruiter-${iv.interviewer}`,
          name: iv.interviewer,
          role: "Interviewer",
        },
      ];

      const color =
        iv.status === "Completed"
          ? "emerald"
          : iv.status === "Cancelled"
          ? "orange"
          : "pink";

      return {
        id: iv.id,
        title: `${iv.candidateName} — ${iv.round}`,
        subtitle: `Role: ${iv.jobTitle} · ${iv.timezone}`,
        startTime: timeFormatted,
        endTime: `${iv.durationMinutes}m`,
        date: isoDate,
        category: iv.round,
        color,
        badge: iv.status,
        locationOrLink: iv.locationOrLink,
        isOnline: iv.type === "Online",
        attendees,
        actionLabel: iv.feedback ? "Review Rubric" : "Evaluate",
        onAction: () => {
          setFeedbackTarget(iv);
          setRating(String(iv.feedback?.rating ?? 4));
          setRecommendation(iv.feedback?.recommendation ?? "Hire");
          setStrengths(iv.feedback?.strengths ?? "");
          setConcerns(iv.feedback?.concerns ?? "");
        },
      };
    });
  }, [interviews]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setBusySchedule(true);
    const res = await saveInterview({
      candidateId,
      jobId,
      scheduledAt,
      durationMinutes: Number(durationMinutes) || 45,
      timezone,
      type,
      locationOrLink,
      interviewer,
      round,
      notes,
    });
    setBusySchedule(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    notify("success", "Interview scheduled and synced to the candidate's portal.");
    setScheduleOpen(false);
  };

  const handleStatusChange = async (iv: InterviewRecord, status: InterviewStatus) => {
    const res = await saveInterview({ interviewId: iv.id, status }, true);
    if (res.ok) notify("success", `Interview marked as ${status}.`);
    else notify("error", res.error);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTarget) return;
    setBusyFeedback(true);
    const res = await saveInterview(
      {
        interviewId: feedbackTarget.id,
        feedback: {
          rating: Number(rating) || 4,
          recommendation,
          strengths,
          concerns,
        },
      },
      true,
    );
    setBusyFeedback(false);
    if (res.ok) {
      notify("success", `Structured evaluation recorded for ${feedbackTarget.candidateName}.`);
      setFeedbackTarget(null);
    } else {
      notify("error", res.error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Scheduling & Evaluation"
        subtitle="Schedule technical and HR rounds, check for time conflicts, and record structured rubric evaluations."
        action={
          <button
            type="button"
            onClick={() => {
              setCandidateId(candidates[0]?.id ?? "");
              setJobId(jobs[0]?.id ?? "");
              setFormError(null);
              setScheduleOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Schedule Interview
          </button>
        }
      />

      {/* Segmented View Switcher: Calendar Day Card vs Full List */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveViewTab("calendar")}
            className={`t-btn-press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition font-semibold ${
              activeViewTab === "calendar"
                ? "bg-[#FF2D95]/20 text-white border border-[#FF2D95]/40 shadow-sm"
                : "text-sb-muted hover:text-white"
            }`}
          >
            <Calendar size={13} className={activeViewTab === "calendar" ? "text-[#FF2D95]" : ""} />
            Calendar Day View
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab("list")}
            className={`t-btn-press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition font-semibold ${
              activeViewTab === "list"
                ? "bg-[#00F0FF]/20 text-white border border-[#00F0FF]/40 shadow-sm"
                : "text-sb-muted hover:text-white"
            }`}
          >
            <LayoutList size={13} className={activeViewTab === "list" ? "text-[#00F0FF]" : ""} />
            Full Roster List ({interviews.length})
          </button>
        </div>

        <span className="text-xs text-sb-muted hidden sm:inline">
          Transitions.dev Day Schedule · {interviews.length} sessions
        </span>
      </div>

      {activeViewTab === "calendar" ? (
        <SkillBridgeCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          events={calendarEvents}
          onAddEvent={(date) => {
            setCandidateId(candidates[0]?.id ?? "");
            setJobId(jobs[0]?.id ?? "");
            setScheduledAt(`${date}T14:00`);
            setFormError(null);
            setScheduleOpen(true);
          }}
          title="Interview Calendar & Schedule"
          addButtonLabel="Schedule Slot"
          showAddButton={true}
          portalTheme="industry"
          emptyMessage="No candidate interviews scheduled for this date"
        />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No interviews scheduled yet"
          text="Schedule an interview with an applicant or candidate. Scheduled sessions automatically appear in the Student Portal."
          action={
            <button
              type="button"
              onClick={() => {
                setCandidateId(candidates[0]?.id ?? "");
                setJobId(jobs[0]?.id ?? "");
                setScheduleOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Schedule First Interview
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <article key={iv.id} className="glass p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-bold">{iv.candidateName}</h2>
                    <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                      {iv.round}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-xs text-sb-muted">
                      {iv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-sb-muted">
                    Role: <strong className="text-white">{iv.jobTitle}</strong> · Interviewer:{" "}
                    <strong className="text-white">{iv.interviewer}</strong>
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-sb-muted">
                    <span className="inline-flex items-center gap-1.5 text-white">
                      <Clock size={13} className="text-sb-cyan" />
                      {new Date(iv.scheduledAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({iv.durationMinutes} min · {iv.timezone})
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {iv.type === "Online" ? <Video size={13} className="text-sb-cyan" /> : <MapPin size={13} className="text-sb-cyan" />}
                      {iv.type}:{" "}
                      {iv.locationOrLink.startsWith("http") ? (
                        <a
                          href={iv.locationOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sb-cyan hover:underline"
                        >
                          Join Link <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span>{iv.locationOrLink}</span>
                      )}
                    </span>
                  </div>

                  {iv.notes && (
                    <p className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-sb-muted">
                      Prep notes: {iv.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Change status for ${iv.candidateName}`}
                    value={iv.status}
                    onChange={(e) => handleStatusChange(iv, e.target.value as InterviewStatus)}
                    className="rounded-xl border border-white/15 bg-[#101318] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {INTERVIEW_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackTarget(iv);
                      setRating(String(iv.feedback?.rating ?? 4));
                      setRecommendation(iv.feedback?.recommendation ?? "Hire");
                      setStrengths(iv.feedback?.strengths ?? "");
                      setConcerns(iv.feedback?.concerns ?? "");
                    }}
                    className="btn btn-glass btn-sm"
                  >
                    <Star size={14} /> {iv.feedback ? "Edit Rubric" : "Record Feedback"}
                  </button>
                </div>
              </div>

              {iv.feedback && (
                <div className="mt-4 rounded-xl border border-sb-cyan/30 bg-sb-blue/10 p-3.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                      <CheckCircle2 size={14} className="text-sb-cyan" />
                      Rubric Recommendation: <span className="text-sb-cyan">{iv.feedback.recommendation}</span> (Rating:{" "}
                      {iv.feedback.rating}/5)
                    </span>
                    <span className="text-sb-muted">Submitted by {iv.feedback.submittedBy}</span>
                  </div>
                  {iv.feedback.strengths && (
                    <p className="mt-1.5 text-sb-text">
                      <strong>Strengths:</strong> {iv.feedback.strengths}
                    </p>
                  )}
                  {iv.feedback.concerns && (
                    <p className="mt-1 text-sb-muted">
                      <strong>Concerns:</strong> {iv.feedback.concerns}
                    </p>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Candidate Interview"
      >
        {jobs.length === 0 ? (
          <p className="text-sm text-sb-muted">
            Create at least one job listing before scheduling an interview.
          </p>
        ) : (
          <form onSubmit={handleSchedule} className="space-y-4">
            {formError && <ErrorNote>{formError}</ErrorNote>}

            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-sb-muted">
              Note: External Google/Outlook calendar invites are not connected in demo mode. Interviews are persisted in SkillBridge and displayed directly in the student’s portal.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">Candidate</label>
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="field"
                  required
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium">Job Listing</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="field"
                  required
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <TextField
                label="Interview Round"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                required
              />

              <TextField
                label="Interviewer Name"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                required
              />

              <TextField
                label="Date & Time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                min={15}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />

              <SelectField
                label="Format"
                options={INTERVIEW_TYPES}
                value={type}
                onChange={(e) => setType(e.target.value as InterviewType)}
              />

              <TextField
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>

            <TextField
              label={type === "Online" ? "Meeting Link" : "Location / Phone Number"}
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              required
            />

            <TextAreaField
              label="Preparation Notes for Candidate"
              rows={2}
              optional
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setScheduleOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={busySchedule} className="btn btn-primary btn-sm">
                {busySchedule && <Loader2 size={14} className="animate-spin" />}
                Schedule Interview
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Structured Rubric Feedback Modal */}
      <Modal
        open={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        title={feedbackTarget ? `Evaluation Rubric — ${feedbackTarget.candidateName}` : "Evaluation Rubric"}
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Overall Rating (1 to 5)"
              options={["5", "4", "3", "2", "1"]}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <SelectField
              label="Hiring Recommendation"
              options={RECOMMENDATIONS}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value as InterviewFeedback["recommendation"])}
            />
          </div>

          <TextAreaField
            label="Key Strengths Demonstrated"
            rows={3}
            placeholder="Problem decomposition, code clarity, communication…"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          />

          <TextAreaField
            label="Areas of Concern / Follow-up"
            rows={2}
            optional
            placeholder="Topics to probe in the final round…"
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFeedbackTarget(null)}>
              Cancel
            </button>
            <button type="submit" disabled={busyFeedback} className="btn btn-primary btn-sm">
              {busyFeedback && <Loader2 size={14} className="animate-spin" />}
              Save Evaluation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
