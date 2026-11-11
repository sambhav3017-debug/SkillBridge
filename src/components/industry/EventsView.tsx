"use client";

import { useState } from "react";
import { Calendar, GraduationCap, Loader2, MapPin, Plus, Trash2, Users } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import {
  ConfirmModal,
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
  TextField,
  ToggleGroup,
} from "@/components/student/ui";
import { EVENT_STATUSES, EVENT_TYPES, type CampusEvent, type EventStatus, type EventType } from "@/lib/industry/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

export default function EventsView() {
  const { data, saveEvent, notify } = useIndustry();
  const { recruiter, jobs, events } = data;
  const canManage = recruiter.role !== "Interviewer";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("Campus Recruitment Drive");
  const [institution, setInstitution] = useState("MIT ADT University");
  const [defaultDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:30");
  const [mode, setMode] = useState<WorkMode>("On-site");
  const [venueOrLink, setVenueOrLink] = useState("Main Placement Auditorium / Online Meet");
  const [capacity, setCapacity] = useState("150");
  const [status, setStatus] = useState<EventStatus>("Upcoming");
  const [linkedJobTitles, setLinkedJobTitles] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [requestApproval, setRequestApproval] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CampusEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const jobTitles = jobs.map((j) => j.title);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setType("Campus Recruitment Drive");
    setInstitution("MIT ADT University");
    setDate(defaultDate);
    setTime("10:30");
    setMode("On-site");
    setVenueOrLink("Placement Cell Auditorium");
    setCapacity("150");
    setStatus("Upcoming");
    setLinkedJobTitles([]);
    setDescription("");
    setRequestApproval(true);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (ev: CampusEvent) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setType(ev.type);
    setInstitution(ev.institution);
    setDate(ev.date);
    setTime(ev.time);
    setMode(ev.mode);
    setVenueOrLink(ev.venueOrLink);
    setCapacity(String(ev.capacity));
    setStatus(ev.status);
    setLinkedJobTitles(
      ev.linkedJobIds
        .map((id) => jobs.find((j) => j.id === id)?.title)
        .filter((t): t is string => !!t),
    );
    setDescription(ev.description);
    setRequestApproval(ev.institutionApproval === "Pending institution approval");
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const linkedJobIds = jobs.filter((j) => linkedJobTitles.includes(j.title)).map((j) => j.id);
    const res = await saveEvent(
      {
        id: editingId ?? undefined,
        title,
        type,
        institution,
        date,
        time,
        mode,
        venueOrLink,
        capacity: Number(capacity) || 100,
        status,
        linkedJobIds,
        description,
        requestApproval,
      },
      editingId ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    notify("success", editingId ? "Campus event updated." : "Campus event created.");
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await saveEvent({ eventId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Campus event deleted.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Recruitment & Events"
        subtitle="Organize campus drives, pre-placement talks, career fairs, and technical workshops with partner institutions."
        action={
          canManage ? (
            <button type="button" onClick={openCreate} className="btn btn-primary">
              <Plus size={16} /> Create Campus Event
            </button>
          ) : undefined
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={22} />}
          title="No campus recruitment events scheduled"
          text="Plan a campus recruitment drive, virtual hiring session, or technical workshop and link your open job listings."
          action={
            canManage ? (
              <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                <Plus size={15} /> Create First Event
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => (
            <article key={ev.id} className="glass flex flex-col justify-between p-5">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                        {ev.type}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-xs text-sb-muted">
                        {ev.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold">{ev.title}</h2>
                  </div>

                  <span className="rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
                    {ev.institutionApproval}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-sb-muted">
                  <p className="flex items-center gap-1.5 text-white">
                    <GraduationCap size={13} className="text-sb-cyan" /> {ev.institution}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-sb-cyan" /> {ev.date} at {ev.time} ({ev.mode})
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-sb-cyan" /> {ev.venueOrLink}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users size={13} className="text-sb-cyan" /> Capacity: {ev.capacity} students
                  </p>
                </div>

                {ev.description && (
                  <p className="mt-3 text-xs leading-relaxed text-sb-muted">{ev.description}</p>
                )}
              </div>

              {canManage && (
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3.5">
                  <button type="button" onClick={() => openEdit(ev)} className="btn btn-glass btn-sm">
                    Edit Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ev)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Campus Event" : "Create Campus Recruitment Event"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Event Title"
              placeholder="2027 Campus Placement & Pre-Placement Talk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <SelectField
              label="Event Type"
              options={EVENT_TYPES}
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
            />
            <TextField
              label="Target College / University"
              placeholder="MIT ADT University"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
            <SelectField
              label="Event Status"
              options={EVENT_STATUSES}
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextField
              label="Start Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <SelectField
              label="Mode"
              options={WORK_MODES}
              value={mode}
              onChange={(e) => setMode(e.target.value as WorkMode)}
            />
            <TextField
              label="Student Capacity"
              type="number"
              min={5}
              max={5000}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <TextField
            label="Venue or Virtual Session Link"
            placeholder="Main Placement Auditorium or https://meet.example.com/drive"
            value={venueOrLink}
            onChange={(e) => setVenueOrLink(e.target.value)}
            required
          />

          {jobTitles.length > 0 && (
            <ToggleGroup
              legend="Link Open Job Listings to This Event"
              options={jobTitles}
              value={linkedJobTitles}
              onChange={setLinkedJobTitles}
            />
          )}

          <TextAreaField
            label="Event Agenda & Student Instructions"
            rows={3}
            optional
            placeholder="10:30 AM — Pre-placement talk · 11:30 AM — Online coding assessment · 2:00 PM — Technical interviews"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
            <div className="pr-2">
              <strong className="text-white block">Request Institution Placement Cell Coordination</strong>
              <span className="mt-0.5 block text-sb-muted">
                Marks the event as “Pending institution approval” until the partner university confirms the schedule in the Academia portal.
              </span>
            </div>
            <SkillBridgeToggle
              checked={requestApproval}
              onChange={setRequestApproval}
              aria-label="Request Institution Placement Cell Coordination"
              accent="cyan"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Campus Event"
        text={`Delete “${deleteTarget?.title ?? ""}”?`}
        confirmLabel="Delete Event"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
