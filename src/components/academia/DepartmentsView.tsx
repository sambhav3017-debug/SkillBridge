"use client";

import { useState } from "react";
import { Building2, GraduationCap, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import {
  ConfirmModal,
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  TagInput,
  TextField,
} from "@/components/student/ui";
import type { DepartmentRecord } from "@/lib/academia/types";

export default function DepartmentsView() {
  const { data, manageDepartments, notify } = useAcademia();
  const { staff, departments, students, faculty } = data;
  const canEdit = ["Institution Owner", "Institution Administrator", "Department Coordinator"].includes(staff.role);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [programs, setPrograms] = useState<string[]>(["B.Tech / B.E."]);
  const [academicYears, setAcademicYears] = useState<string[]>(["1st Year", "2nd Year", "3rd Year", "4th Year"]);
  const [coordinatorName, setCoordinatorName] = useState(staff.name);
  const [coordinatorEmail, setCoordinatorEmail] = useState(staff.email);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setPrograms(["B.Tech / B.E."]);
    setAcademicYears(["1st Year", "2nd Year", "3rd Year", "4th Year"]);
    setCoordinatorName(staff.name);
    setCoordinatorEmail(staff.email);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (d: DepartmentRecord) => {
    setEditingId(d.id);
    setName(d.name);
    setCode(d.code);
    setPrograms(d.programs);
    setAcademicYears(d.academicYears);
    setCoordinatorName(d.coordinatorName);
    setCoordinatorEmail(d.coordinatorEmail);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await manageDepartments(
      {
        id: editingId ?? undefined,
        name,
        code,
        programs,
        academicYears,
        coordinatorName,
        coordinatorEmail,
      },
      editingId ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    notify("success", editingId ? "Department updated." : `Created department ${name} (${code}).`);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await manageDepartments({ departmentId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Department deleted.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Departments & Programs"
        subtitle="Manage academic departments, degree programs, department coordinators, and department-level placement metrics."
        action={
          canEdit ? (
            <button type="button" onClick={openCreate} className="btn btn-primary">
              <Plus size={16} /> Create Department
            </button>
          ) : undefined
        }
      />

      {departments.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No departments configured"
          text="Create academic departments to organize students, faculty, and placement drives."
          action={
            canEdit ? (
              <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                <Plus size={15} /> Create First Department
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {departments.map((d) => {
            const deptStudents = students.filter(
              (s) => s.department.toLowerCase() === d.name.toLowerCase() || s.department.toLowerCase() === d.code.toLowerCase(),
            );
            const deptPlaced = deptStudents.filter(
              (s) => s.placementStatus === "Placed" || s.placementStatus === "Internship Secured",
            ).length;
            const deptFaculty = faculty.filter((f) => f.department.toLowerCase() === d.name.toLowerCase()).length;

            return (
              <article key={d.id} className="glass flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                        {d.code}
                      </span>
                      <h2 className="mt-2 text-lg font-bold">{d.name}</h2>
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs text-sb-muted">
                    Coordinator: <strong className="text-white">{d.coordinatorName}</strong> ({d.coordinatorEmail})
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.programs.map((p) => (
                      <span key={p} className="chip">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center text-xs">
                    <div>
                      <p className="flex items-center justify-center gap-1 text-sb-muted">
                        <GraduationCap size={12} className="text-sb-cyan" /> Students
                      </p>
                      <p className="mt-0.5 text-base font-bold text-white">{deptStudents.length}</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-sb-muted">
                        <Users size={12} className="text-sb-cyan" /> Faculty
                      </p>
                      <p className="mt-0.5 text-base font-bold text-white">{deptFaculty}</p>
                    </div>
                    <div>
                      <p className="text-sb-muted">Placed</p>
                      <p className="mt-0.5 text-base font-bold text-sb-cyan">{deptPlaced}</p>
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-3.5">
                    <button type="button" onClick={() => openEdit(d)} className="btn btn-glass btn-sm">
                      Edit Department
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
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Department" : "Create Academic Department"}
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <TextField
                label="Department Name"
                placeholder="Electronics & Telecommunication Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <TextField
              label="Code"
              placeholder="ENTC"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <TagInput
            label="Programs Offered"
            value={programs}
            onChange={setPrograms}
            placeholder="B.Tech / B.E., M.Tech, Ph.D.…"
          />

          <TagInput
            label="Academic Years"
            value={academicYears}
            onChange={setAcademicYears}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Department Coordinator Name"
              value={coordinatorName}
              onChange={(e) => setCoordinatorName(e.target.value)}
            />
            <TextField
              label="Coordinator Email"
              type="email"
              value={coordinatorEmail}
              onChange={(e) => setCoordinatorEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save Changes" : "Create Department"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Department"
        text={`Delete department “${deleteTarget?.name ?? ""}”?`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
