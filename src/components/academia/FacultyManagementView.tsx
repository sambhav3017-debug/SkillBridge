"use client";

import { useState } from "react";
import { BookOpen, Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TagInput,
  TextField,
} from "@/components/student/ui";
import type { FacultyRecord } from "@/lib/academia/types";
import SearchInput from "@/components/ui/SearchInput";

export default function FacultyManagementView() {
  const { data, manageFaculty, notify } = useAcademia();
  const { staff, departments, faculty } = data;
  const canEdit = staff.role !== "Read-Only Analyst";

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(departments[0]?.name ?? "Computer Science & Engineering");
  const [designation, setDesignation] = useState("Associate Professor");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [publicationsCount, setPublicationsCount] = useState("4");
  const [responsibilities, setResponsibilities] = useState<string[]>(["Project Supervision"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FacultyRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deptOptions = departments.length
    ? departments.map((d) => d.name)
    : ["Computer Science & Engineering", "Artificial Intelligence & Data Science"];

  const filtered = faculty.filter((f) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return [f.name, f.email, f.department, f.designation, ...f.expertise, ...f.researchInterests]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setDepartment(deptOptions[0]);
    setDesignation("Associate Professor");
    setExpertise([]);
    setResearchInterests([]);
    setPublicationsCount("4");
    setResponsibilities(["Project Supervision", "Placement Faculty Coordinator"]);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (f: FacultyRecord) => {
    setEditingId(f.id);
    setName(f.name);
    setEmail(f.email);
    setDepartment(f.department);
    setDesignation(f.designation);
    setExpertise(f.expertise);
    setResearchInterests(f.researchInterests);
    setPublicationsCount(String(f.publicationsCount));
    setResponsibilities(f.responsibilities);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await manageFaculty(
      {
        id: editingId ?? undefined,
        name,
        email,
        department,
        designation,
        expertise,
        researchInterests,
        publicationsCount: Number(publicationsCount) || 0,
        responsibilities,
      },
      editingId ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    notify("success", editingId ? "Faculty profile updated." : `Added ${name} to faculty directory.`);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await manageFaculty({ facultyId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Faculty record removed.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Directory & Supervision"
        subtitle="Manage faculty profiles, research interests, publications, and academic project supervision responsibilities."
        action={
          canEdit ? (
            <button type="button" onClick={openCreate} className="btn btn-primary">
              <Plus size={16} /> Add Faculty Member
            </button>
          ) : undefined
        }
      />

      <div className="glass p-4">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search faculty by name, department, expertise, or research interest…"
          aria-label="Search faculty"
          portalVariant="academia"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No faculty members in directory yet"
          text="Add faculty coordinators and professors to assign project supervision and department responsibilities."
          action={
            canEdit ? (
              <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                <Plus size={15} /> Add First Faculty Member
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((f) => (
            <article key={f.id} className="glass flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={f.name} size={44} />
                    <div>
                      <h2 className="text-base font-bold">{f.name}</h2>
                      <p className="text-xs text-sb-muted">
                        {f.designation} · {f.department}
                      </p>
                      <p className="text-xs text-sb-cyan">
                        <a
                          href={`mailto:${f.email}`}
                          className="hover:underline transition-colors"
                          aria-label={`Email ${f.name} at ${f.email}`}
                        >
                          {f.email}
                        </a>
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-sb-muted">
                    {f.accountStatus}
                  </span>
                </div>

                {f.expertise.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.expertise.map((ex) => (
                      <span key={ex} className="chip">
                        {ex}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-sb-muted">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={13} className="text-sb-cyan" /> {f.publicationsCount} publication(s)
                  </span>
                  {f.responsibilities.length > 0 && (
                    <span>Roles: {f.responsibilities.join(", ")}</span>
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-3.5">
                  <button type="button" onClick={() => openEdit(f)} className="btn btn-glass btn-sm">
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(f)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Faculty Profile" : "Add Faculty Member"}
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Full Name"
              placeholder="Dr. Aniruddha Kulkarni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Institutional Email"
              type="email"
              placeholder="a.kulkarni@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SelectField
              label="Department"
              options={deptOptions}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <TextField
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>

          <TagInput
            label="Areas of Expertise"
            value={expertise}
            onChange={setExpertise}
            placeholder="Distributed Systems, NLP, Embedded IoT…"
          />

          <TagInput
            label="Research Interests"
            optional
            value={researchInterests}
            onChange={setResearchInterests}
            placeholder="Edge AI, Federated Learning…"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Publications Count"
              type="number"
              min={0}
              value={publicationsCount}
              onChange={(e) => setPublicationsCount(e.target.value)}
            />
          </div>

          <TagInput
            label="Assigned Academic Responsibilities"
            value={responsibilities}
            onChange={setResponsibilities}
            placeholder="Capstone Coordinator, Placement Advisor…"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Update Faculty" : "Save Faculty"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Faculty Member"
        text={`Remove ${deleteTarget?.name ?? ""} from the faculty directory?`}
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
