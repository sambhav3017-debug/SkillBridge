"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  LayoutGrid,
  ListFilter,
  MapPin,
  Plus,
  Search,
  Table as TableIcon,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import {
  ACADEMIA_EVENT_STATUSES,
  ACADEMIA_EVENT_TYPES,
  type AcademiaEvent,
  type AcademiaEventStatus,
  type AcademiaEventType,
} from "@/lib/academia/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";
import SearchInput from "@/components/ui/SearchInput";
import SkillBridgeCalendar, {
  type CalendarAttendee,
  type CalendarEvent,
} from "@/components/ui/SkillBridgeCalendar";

interface EventForm {
  id?: string;
  title: string;
  type: AcademiaEventType;
  organizer: string;
  targetAudience: string;
  department: string;
  date: string;
  time: string;
  registrationDeadline: string;
  mode: WorkMode;
  location: string;
  capacity: string;
  registeredCount: string;
  attendedCount: string;
  status: AcademiaEventStatus;
  description: string;
}

export default function AcademiaEventsView() {
  const { data, manageEvents, notify } = useAcademia();
  const { events, departments, staff, institution } = data;
  const isReadOnly = staff.role === "Read-Only Analyst";

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"cards" | "calendar" | "timeline">("calendar");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("2026-11-28");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emptyForm: EventForm = {
    title: "",
    type: "Workshop & Seminar",
    organizer: staff.department || "Training & Placement Cell",
    targetAudience: "All Placement-Eligible Students",
    department: departments[0]?.name ?? "All Departments",
    date: "2026-11-28",
    time: "10:30",
    registrationDeadline: "2026-11-25",
    mode: "On-site",
    location: `${institution.name} Main Auditorium`,
    capacity: "250",
    registeredCount: "0",
    attendedCount: "0",
    status: "Registration Open",
    description: "",
  };

  const [form, setForm] = useState<EventForm>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => {
        if (typeFilter !== "All" && e.type !== typeFilter) return false;
        if (statusFilter !== "All" && e.status !== statusFilter) return false;
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, query, typeFilter, statusFilter]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return filtered.map((ev) => {
      const attendees: CalendarAttendee[] = [
        {
          id: `coord-${ev.organizer}`,
          name: ev.organizer,
          role: "Coordinator",
        },
        {
          id: `dept-${ev.department}`,
          name: ev.department,
          role: "Department",
        },
      ];

      const color =
        ev.type.includes("Placement") || ev.type.includes("Interview")
          ? "pink"
          : ev.type.includes("Hackathon")
          ? "purple"
          : ev.type.includes("Workshop")
          ? "cyan"
          : "blue";

      return {
        id: ev.id,
        title: ev.title,
        subtitle: `${ev.department} · Organized by ${ev.organizer}`,
        startTime: ev.time,
        date: ev.date,
        category: ev.type,
        color,
        badge: `${ev.registeredCount}/${ev.capacity} RSVP`,
        locationOrLink: `${ev.mode} · ${ev.location}`,
        attendees,
        actionLabel: isReadOnly ? "View Event" : "Edit Event",
        onAction: () => openEdit(ev),
      };
    });
  }, [filtered, isReadOnly]);

  function openNew() {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(ev: AcademiaEvent) {
    setForm({
      id: ev.id,
      title: ev.title,
      type: ev.type,
      organizer: ev.organizer,
      targetAudience: ev.targetAudience,
      department: ev.department,
      date: ev.date,
      time: ev.time,
      registrationDeadline: ev.registrationDeadline,
      mode: ev.mode,
      location: ev.location,
      capacity: String(ev.capacity),
      registeredCount: String(ev.registeredCount),
      attendedCount: String(ev.attendedCount),
      status: ev.status,
      description: ev.description,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await manageEvents(
      {
        id: form.id,
        title: form.title,
        type: form.type,
        organizer: form.organizer,
        targetAudience: form.targetAudience,
        department: form.department,
        date: form.date,
        time: form.time,
        registrationDeadline: form.registrationDeadline || form.date,
        mode: form.mode,
        location: form.location,
        capacity: Number(form.capacity) || 150,
        registeredCount: Number(form.registeredCount) || 0,
        attendedCount: Number(form.attendedCount) || 0,
        status: form.status,
        description: form.description,
      },
      form.id ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error ?? "Failed to save event.");
      return;
    }
    notify("success", form.id ? "Campus event updated." : "Campus event published.");
    setModalOpen(false);
  }

  async function deleteEvent(id: string) {
    const res = await manageEvents({ eventId: id }, "DELETE");
    if (res.ok) notify("success", "Campus event deleted.");
    else notify("error", res.error ?? "Could not delete event.");
  }

  const totalRegistered = events.reduce((acc, e) => acc + e.registeredCount, 0);
  const totalAttended = events.reduce((acc, e) => acc + e.attendedCount, 0);
  const openEvents = events.filter(
    (e) => e.status === "Registration Open" || e.status === "Published",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
            <Calendar size={12} /> Campus Events &amp; Engagement
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Campus Events, Seminars &amp; Career Fairs
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-sb-muted">
            Coordinate campus recruitment drives, guest lectures, technical workshops, and academic
            conferences with real-time registration and attendance tracking.
          </p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={openNew}
            className="btn-primary px-4 py-2.5 text-xs font-semibold text-white"
          >
            <Plus size={15} /> Schedule Campus Event
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Total Scheduled Events</div>
          <div className="mt-1 text-2xl font-semibold text-white">{events.length}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Academic year {institution.academicYearLabel}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Active / Open Registration</div>
          <div className="mt-1 text-2xl font-semibold text-sb-cyan">{openEvents}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Accepting student RSVPs</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Cumulative Registrations</div>
          <div className="mt-1 text-2xl font-semibold text-sb-pink">{totalRegistered}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Across all campus events</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Verified Attendance</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-300">{totalAttended}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Logged check-ins</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="min-w-[230px] flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search events by title, organizer, department, or venue..."
            portalVariant="academia"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by event type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Event Types</option>
            {ACADEMIA_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by event status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Statuses</option>
            {ACADEMIA_EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`t-btn-press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                viewMode === "calendar"
                  ? "bg-[#00F0FF]/20 text-white border border-[#00F0FF]/40 shadow-sm"
                  : "text-sb-muted hover:text-white"
              }`}
            >
              <Calendar size={13} className={viewMode === "calendar" ? "text-[#00F0FF]" : ""} />
              Calendar Day View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`t-btn-press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                viewMode === "cards"
                  ? "bg-[#00F0FF]/20 text-white border border-[#00F0FF]/40 shadow-sm"
                  : "text-sb-muted hover:text-white"
              }`}
            >
              <LayoutGrid size={13} className={viewMode === "cards" ? "text-[#00F0FF]" : ""} />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`t-btn-press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                viewMode === "timeline"
                  ? "bg-[#00F0FF]/20 text-white border border-[#00F0FF]/40 shadow-sm"
                  : "text-sb-muted hover:text-white"
              }`}
            >
              <TableIcon size={13} className={viewMode === "timeline" ? "text-[#00F0FF]" : ""} />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      {viewMode === "calendar" ? (
        <SkillBridgeCalendar
          selectedDate={selectedCalendarDate}
          onSelectDate={setSelectedCalendarDate}
          events={calendarEvents}
          onAddEvent={(date) => {
            if (!isReadOnly) {
              setForm({
                ...emptyForm,
                date,
              });
              setErrors({});
              setModalOpen(true);
            }
          }}
          title="Campus Calendar & Event Schedule"
          addButtonLabel="New Event"
          showAddButton={!isReadOnly}
          portalTheme="academia"
          emptyMessage="No campus workshops or drives scheduled for this date"
        />
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <ListFilter size={28} className="mx-auto text-sb-cyan" />
          <h2 className="mt-3 text-base font-semibold">No campus events match your filters</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-sb-muted">
            Schedule workshops, recruitment pre-placement talks, hackathons, or guest lectures for
            your students and faculty.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((ev) => {
            const pct = ev.capacity > 0 ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100)) : 0;
            return (
              <div
                key={ev.id}
                className="glass-panel flex min-w-0 flex-col justify-between rounded-2xl p-5 transition hover:border-sb-cyan/35"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
                      {ev.type}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        ev.status === "Registration Open" || ev.status === "Published"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : ev.status === "Completed"
                            ? "border-sb-cyan/30 bg-sb-cyan/10 text-sb-cyan"
                            : "border-white/15 bg-white/[0.04] text-sb-muted"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-semibold text-white">{ev.title}</h2>
                  <p className="mt-1 text-xs text-sb-muted">
                    Organized by <span className="text-white/90">{ev.organizer}</span> ·{" "}
                    {ev.department} · Target: {ev.targetAudience}
                  </p>

                  {ev.description && (
                    <p className="mt-2.5 text-xs leading-relaxed text-sb-muted line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-sb-muted">
                    <span className="inline-flex items-center gap-1 text-white/90">
                      <Calendar size={13} className="text-sb-cyan" />
                      {ev.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-sb-pink" />
                      {ev.time} (RSVP by {ev.registrationDeadline})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-sb-cyan" />
                      {ev.mode} · {ev.location}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/[0.07] pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-sb-muted">
                      <Users size={13} className="text-sb-cyan" />
                      <strong className="text-white">{ev.registeredCount}</strong> / {ev.capacity}{" "}
                      registered ({pct}%) ·{" "}
                      <strong className="text-emerald-300">{ev.attendedCount}</strong> attended
                    </span>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(ev)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-white"
                          aria-label={`Edit ${ev.title}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEvent(ev.id)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-sb-pink"
                          aria-label={`Delete ${ev.title}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sb-cyan to-sb-pink"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-sb-muted">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Event &amp; Type</th>
                  <th className="px-4 py-3">Organizer / Dept</th>
                  <th className="px-4 py-3">Venue / Mode</th>
                  <th className="px-4 py-3">Registrations</th>
                  <th className="px-4 py-3">Status</th>
                  {!isReadOnly && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                      <div>{ev.date}</div>
                      <div className="text-[11px] text-sb-muted">{ev.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{ev.title}</div>
                      <div className="text-[11px] text-sb-cyan">{ev.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sb-muted">
                      <div className="text-white/90">{ev.organizer}</div>
                      <div className="text-[11px]">{ev.department}</div>
                    </td>
                    <td className="px-4 py-3 text-sb-muted">
                      <div>{ev.location}</div>
                      <div className="text-[11px]">{ev.mode}</div>
                    </td>
                    <td className="px-4 py-3 text-sb-muted">
                      <span className="font-semibold text-white">{ev.registeredCount}</span> /{" "}
                      {ev.capacity} ({ev.attendedCount} attended)
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[11px]">
                        {ev.status}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(ev)}
                          className="mr-1.5 rounded-lg border border-white/10 p-1.5 text-sb-muted hover:text-white"
                          aria-label={`Edit ${ev.title}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEvent(ev.id)}
                          className="rounded-lg border border-white/10 p-1.5 text-sb-muted hover:text-sb-pink"
                          aria-label={`Delete ${ev.title}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 id="event-modal-title" className="text-lg font-semibold">
                  {form.id ? "Edit Campus Event" : "Schedule Campus Event"}
                </h2>
                <p className="text-xs text-sb-muted">
                  Manage campus workshops, guest lectures, career fairs, and attendance.
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

            <form onSubmit={saveEvent} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="ev-title">
                    Event Title *
                  </label>
                  <input
                    id="ev-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Annual AI & Systems Architecture Symposium 2026"
                    className="field-input"
                  />
                  {errors.title && <p className="field-error">{errors.title}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-type">
                    Event Type
                  </label>
                  <select
                    id="ev-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as AcademiaEventType })}
                    className="field-input"
                  >
                    {ACADEMIA_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-status">
                    Event Status
                  </label>
                  <select
                    id="ev-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as AcademiaEventStatus })
                    }
                    className="field-input"
                  >
                    {ACADEMIA_EVENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-org">
                    Organizer / Host Cell
                  </label>
                  <input
                    id="ev-org"
                    type="text"
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-dept">
                    Department
                  </label>
                  <input
                    id="ev-dept"
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-date">
                    Event Date *
                  </label>
                  <input
                    id="ev-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="field-input"
                  />
                  {errors.date && <p className="field-error">{errors.date}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-time">
                    Start Time
                  </label>
                  <input
                    id="ev-time"
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-rsvp">
                    Registration Deadline
                  </label>
                  <input
                    id="ev-rsvp"
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-mode">
                    Mode
                  </label>
                  <select
                    id="ev-mode"
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value as WorkMode })}
                    className="field-input"
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="ev-loc">
                    Venue or Virtual Stream Link *
                  </label>
                  <input
                    id="ev-loc"
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="field-input"
                  />
                  {errors.location && <p className="field-error">{errors.location}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-cap">
                    Seat Capacity
                  </label>
                  <input
                    id="ev-cap"
                    type="number"
                    min={5}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-aud">
                    Target Audience
                  </label>
                  <input
                    id="ev-aud"
                    type="text"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-reg">
                    Registered Count
                  </label>
                  <input
                    id="ev-reg"
                    type="number"
                    min={0}
                    value={form.registeredCount}
                    onChange={(e) => setForm({ ...form, registeredCount: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="ev-att">
                    Verified Attendance Count
                  </label>
                  <input
                    id="ev-att"
                    type="number"
                    min={0}
                    value={form.attendedCount}
                    onChange={(e) => setForm({ ...form, attendedCount: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="ev-desc">
                    Agenda &amp; Speaker Details
                  </label>
                  <textarea
                    id="ev-desc"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Outline the session schedule, speakers, and student preparation notes..."
                    className="field-input"
                  />
                </div>
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
                  {busy ? "Saving..." : form.id ? "Update Event" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
