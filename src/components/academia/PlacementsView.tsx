"use client";

import { useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import {
  ConfirmModal,
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TagInput,
  TextAreaField,
  TextField,
} from "@/components/student/ui";
import { DRIVE_STATUSES, type DriveStatus, type PlacementDrive } from "@/lib/academia/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";

export default function PlacementsView() {
  const { data, managePlacements, notify } = useAcademia();
  const { staff, departments, students, drives, industryCampusEvents } = data;
  const canEdit = ["Institution Owner", "Institution Administrator", "Placement Officer", "Department Coordinator"].includes(
    staff.role,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [packageOrStipend, setPackageOrStipend] = useState("₹10–14 LPA");
  const [defaultDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  });
  const [driveDate, setDriveDate] = useState(defaultDate);
  const [mode, setMode] = useState<WorkMode>("On-site");
  const [venueOrLink, setVenueOrLink] = useState("Main Placement Auditorium");
  const [eligibleDepartments, setEligibleDepartments] = useState<string[]>(
    departments.map((d) => d.code).slice(0, 3),
  );
  const [eligibleGradYears, setEligibleGradYears] = useState<string[]>(["2027"]);
  const [minSkills, setMinSkills] = useState<string[]>([]);
  const [status, setStatus] = useState<DriveStatus>("Registration Open");
  const [registeredCount, setRegisteredCount] = useState("0");
  const [shortlistedCount, setShortlistedCount] = useState("0");
  const [interviewedCount, setInterviewedCount] = useState("0");
  const [offersCount, setOffersCount] = useState("0");
  const [confirmedPlacementsCount, setConfirmedPlacementsCount] = useState("0");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<PlacementDrive | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const eligibleStudents = students.filter((s) => s.placementEligible).length;
  const placedStudents = students.filter(
    (s) => s.placementStatus === "Placed" || s.placementStatus === "Internship Secured",
  ).length;
  const totalOffers = drives.reduce((acc, d) => acc + d.offersCount, 0) + placedStudents;

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setCompanyName("");
    setRoleTitle("");
    setPackageOrStipend("₹10–14 LPA");
    setDriveDate(defaultDate);
    setMode("On-site");
    setVenueOrLink("Main Placement Auditorium");
    setEligibleDepartments(departments.map((d) => d.code));
    setEligibleGradYears(["2027"]);
    setMinSkills([]);
    setStatus("Registration Open");
    setRegisteredCount("0");
    setShortlistedCount("0");
    setInterviewedCount("0");
    setOffersCount("0");
    setConfirmedPlacementsCount("0");
    setNotes("");
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (d: PlacementDrive) => {
    setEditingId(d.id);
    setTitle(d.title);
    setCompanyName(d.companyName);
    setRoleTitle(d.roleTitle);
    setPackageOrStipend(d.packageOrStipend);
    setDriveDate(d.driveDate);
    setMode(d.mode);
    setVenueOrLink(d.venueOrLink);
    setEligibleDepartments(d.eligibleDepartments);
    setEligibleGradYears(d.eligibleGradYears);
    setMinSkills(d.minSkills);
    setStatus(d.status);
    setRegisteredCount(String(d.registeredCount));
    setShortlistedCount(String(d.shortlistedCount));
    setInterviewedCount(String(d.interviewedCount));
    setOffersCount(String(d.offersCount));
    setConfirmedPlacementsCount(String(d.confirmedPlacementsCount));
    setNotes(d.notes);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await managePlacements(
      {
        id: editingId ?? undefined,
        title,
        companyName,
        roleTitle,
        packageOrStipend,
        driveDate,
        mode,
        venueOrLink,
        eligibleDepartments,
        eligibleGradYears,
        minSkills,
        status,
        registeredCount: Number(registeredCount) || 0,
        shortlistedCount: Number(shortlistedCount) || 0,
        interviewedCount: Number(interviewedCount) || 0,
        offersCount: Number(offersCount) || 0,
        confirmedPlacementsCount: Number(confirmedPlacementsCount) || 0,
        notes,
      },
      editingId ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    notify("success", editingId ? "Placement drive updated." : `Scheduled placement drive “${title}”.`);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await managePlacements({ driveId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Placement drive removed.");
    else notify("error", res.error);
  };

  const handleApproveIndustryEvent = async (eventId: string, evTitle: string) => {
    setApprovingId(eventId);
    const res = await managePlacements({ approveIndustryEventId: eventId }, "PATCH");
    setApprovingId(null);
    if (res.ok) notify("success", `Approved industry campus event “${evTitle}”.`);
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Placement Cell (T&P)"
        subtitle="Manage campus recruitment drives, define eligibility criteria, coordinate with Industry Portal recruiters, and record verified placement outcomes."
        action={
          canEdit ? (
            <button type="button" onClick={openCreate} className="btn btn-primary">
              <Plus size={16} /> Schedule Placement Drive
            </button>
          ) : undefined
        }
      />

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Placement-Eligible</span>
          <p className="mt-3 text-3xl font-extrabold">{eligibleStudents}</p>
          <p className="mt-1 text-xs text-sb-muted">Out of {students.length} total students</p>
        </div>
        <div className="glass p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Campus Drives</span>
          <p className="mt-3 text-3xl font-extrabold">{drives.length}</p>
          <p className="mt-1 text-xs text-sb-muted">
            {drives.filter((d) => d.status !== "Completed" && d.status !== "Cancelled").length} active
          </p>
        </div>
        <div className="glass p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Industry Event Requests</span>
          <p className="mt-3 text-3xl font-extrabold">{industryCampusEvents.length}</p>
          <p className="mt-1 text-xs text-sb-muted">Synced from Industry Portal</p>
        </div>
        <div className="glass p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Offers &amp; Placements</span>
          <p className="mt-3 text-3xl font-extrabold text-sb-cyan">{totalOffers}</p>
          <p className="mt-1 text-xs text-sb-muted">{placedStudents} student(s) marked Placed</p>
        </div>
      </div>

      {/* Industry Campus Event Coordination */}
      {industryCampusEvents.length > 0 && (
        <section className="glass space-y-4 p-6">
          <div>
            <h2 className="text-base font-bold">Industry Portal Campus Visit &amp; Event Requests</h2>
            <p className="text-xs text-sb-muted">
              Campus sessions created by employers in the Industry Portal. Approving a session updates its status for the
              recruiter immediately.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {industryCampusEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{ev.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        ev.institutionApproval === "Approved"
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/40 bg-amber-400/10 text-amber-200"
                      }`}
                    >
                      {ev.institutionApproval}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-sb-muted">
                    {ev.type} · {ev.date} at {ev.time} · {ev.venueOrLink}
                  </p>
                </div>

                {canEdit && ev.institutionApproval !== "Approved" && (
                  <button
                    type="button"
                    disabled={approvingId === ev.id}
                    onClick={() => handleApproveIndustryEvent(ev.id, ev.title)}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={14} /> Approve Visit
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Placement Drives List */}
      {drives.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={22} />}
          title="No campus placement drives scheduled yet"
          text="Schedule a campus recruitment drive with eligibility rules, target departments, and recruitment stage counters."
          action={
            canEdit ? (
              <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                <Plus size={15} /> Schedule First Placement Drive
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {drives.map((d) => (
            <article key={d.id} className="glass p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-bold">{d.title}</h2>
                    <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-sb-muted">
                    Employer: <strong className="text-white">{d.companyName}</strong> · Role:{" "}
                    <strong className="text-white">{d.roleTitle}</strong>
                    {d.packageOrStipend ? ` · ${d.packageOrStipend}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-sb-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-sb-cyan" /> {d.driveDate} ({d.mode})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-sb-cyan" /> {d.venueOrLink}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} className="text-sb-cyan" /> Eligible: {d.eligibleDepartments.join(", ")} (
                      {d.eligibleGradYears.join(", ")})
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEdit(d)} className="btn btn-glass btn-sm">
                      Update Stages / Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(d)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Funnel Counters */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center text-xs sm:grid-cols-5">
                <div>
                  <p className="text-sb-muted">Registered</p>
                  <p className="mt-0.5 text-base font-bold text-white">{d.registeredCount}</p>
                </div>
                <div>
                  <p className="text-sb-muted">Shortlisted</p>
                  <p className="mt-0.5 text-base font-bold text-white">{d.shortlistedCount}</p>
                </div>
                <div>
                  <p className="text-sb-muted">Interviewed</p>
                  <p className="mt-0.5 text-base font-bold text-white">{d.interviewedCount}</p>
                </div>
                <div>
                  <p className="text-sb-muted">Offers Extended</p>
                  <p className="mt-0.5 text-base font-bold text-sb-cyan">{d.offersCount}</p>
                </div>
                <div>
                  <p className="text-sb-muted">Confirmed Placed</p>
                  <p className="mt-0.5 text-base font-bold text-[#3ee08f]">{d.confirmedPlacementsCount}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Drive Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Placement Drive & Outcomes" : "Schedule Campus Placement Drive"}
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Drive Title"
              placeholder="2027 Graduate Software Engineering Drive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Hiring Company Name"
              placeholder="NebulaCloud Systems"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <TextField
              label="Role Title"
              placeholder="Software Development Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              required
            />
            <TextField
              label="CTC / Stipend Package"
              placeholder="₹12 LPA or ₹35,000 / mo"
              value={packageOrStipend}
              onChange={(e) => setPackageOrStipend(e.target.value)}
            />
            <TextField
              label="Drive Date"
              type="date"
              value={driveDate}
              onChange={(e) => setDriveDate(e.target.value)}
              required
            />
            <SelectField
              label="Drive Status"
              options={DRIVE_STATUSES}
              value={status}
              onChange={(e) => setStatus(e.target.value as DriveStatus)}
            />
            <SelectField
              label="Mode"
              options={WORK_MODES}
              value={mode}
              onChange={(e) => setMode(e.target.value as WorkMode)}
            />
            <TextField
              label="Venue / Assessment Link"
              value={venueOrLink}
              onChange={(e) => setVenueOrLink(e.target.value)}
            />
          </div>

          <TagInput
            label="Eligible Departments"
            value={eligibleDepartments}
            onChange={setEligibleDepartments}
            placeholder="CSE, AIDS, ENTC…"
          />

          <TagInput
            label="Eligible Graduation Years"
            value={eligibleGradYears}
            onChange={setEligibleGradYears}
            placeholder="2026, 2027…"
          />

          <TagInput
            label="Required Skills"
            optional
            value={minSkills}
            onChange={setMinSkills}
            placeholder="TypeScript, Python, SQL…"
          />

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3 sm:grid-cols-5">
            <TextField
              label="Registered"
              type="number"
              min={0}
              value={registeredCount}
              onChange={(e) => setRegisteredCount(e.target.value)}
            />
            <TextField
              label="Shortlisted"
              type="number"
              min={0}
              value={shortlistedCount}
              onChange={(e) => setShortlistedCount(e.target.value)}
            />
            <TextField
              label="Interviewed"
              type="number"
              min={0}
              value={interviewedCount}
              onChange={(e) => setInterviewedCount(e.target.value)}
            />
            <TextField
              label="Offers"
              type="number"
              min={0}
              value={offersCount}
              onChange={(e) => setOffersCount(e.target.value)}
            />
            <TextField
              label="Confirmed"
              type="number"
              min={0}
              value={confirmedPlacementsCount}
              onChange={(e) => setConfirmedPlacementsCount(e.target.value)}
            />
          </div>

          <TextAreaField
            label="Drive Instructions & Notes"
            rows={2}
            optional
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save Drive" : "Create Drive"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Placement Drive"
        text={`Delete placement drive “${deleteTarget?.title ?? ""}”?`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
