"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CheckSquare,
  Download,
  GraduationCap,
  Loader2,
  Mail,
  MinusSquare,
  Plus,
  Search,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import SearchInput from "@/components/ui/SearchInput";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";
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
import { PLACEMENT_STATUSES, type InstitutionStudentRecord, type PlacementStatus } from "@/lib/academia/types";
import { TRIndicator } from "@/components/ui/TRIndicator";

interface CsvPreviewRow {
  rowNum: number;
  name: string;
  email: string;
  studentIdCode: string;
  department: string;
  program: string;
  year: string;
  gradYear: string;
  skills: string[];
  error?: string;
}

const SAMPLE_CSV = `name,email,studentIdCode,department,program,year,gradYear,skills
Siddharth Joshi,siddharth.j@university.edu,CSE-2027-101,Computer Science & Engineering,B.Tech / B.E.,4th Year,2027,React;TypeScript;Node.js
Kavya Kulkarni,kavya.k@university.edu,AIDS-2027-102,Artificial Intelligence & Data Science,B.Tech / B.E.,4th Year,2027,Python;PyTorch;SQL`;

export default function StudentsDirectoryView({ initialQuery = "" }: { initialQuery?: string }) {
  const { data, manageStudents, notify } = useAcademia();
  const { staff, departments, students } = data;
  const canEdit = staff.role !== "Read-Only Analyst";

  const [q, setQ] = useState(initialQuery);
  const [deptFilter, setDeptFilter] = useState("All");
  const [eligFilter, setEligFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [detailTarget, setDetailTarget] = useState<InstitutionStudentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstitutionStudentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add Single Student Modal
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentIdCode, setStudentIdCode] = useState("");
  const [department, setDepartment] = useState(departments[0]?.name ?? "Computer Science & Engineering");
  const [program, setProgram] = useState("B.Tech / B.E.");
  const [year] = useState("4th Year");
  const [gradYear, setGradYear] = useState("2027");
  const [skills, setSkills] = useState<string[]>([]);
  const [sendInvite, setSendInvite] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // CSV Import Modal
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [importing, setImporting] = useState(false);

  const deptNames = useMemo(() => {
    const s = new Set<string>(departments.map((d) => d.name));
    for (const st of students) if (st.department) s.add(st.department);
    return Array.from(s);
  }, [departments, students]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const skQ = skillFilter.trim().toLowerCase();
    return students.filter((s) => {
      if (deptFilter !== "All" && s.department !== deptFilter) return false;
      if (eligFilter === "Eligible" && !s.placementEligible) return false;
      if (eligFilter === "Placed" && s.placementStatus !== "Placed") return false;
      if (skQ && !s.skills.some((sk) => sk.name.toLowerCase().includes(skQ))) return false;
      if (query) {
        const hay = [
          s.name,
          s.email,
          s.studentIdCode,
          s.department,
          s.program,
          s.gradYear,
          ...s.skills.map((x) => x.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [students, deptFilter, eligFilter, skillFilter, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Parse CSV & validate rows against existing emails/IDs
  const csvPreview = useMemo<CsvPreviewRow[]>(() => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length <= 1) return [];

    const existingEmails = new Set(students.map((s) => s.email.toLowerCase()));
    const existingCodes = new Set(students.map((s) => s.studentIdCode.toLowerCase()));
    const seenEmails = new Set<string>();

    return lines.slice(1).map((line, idx) => {
      const cols = line.split(",").map((c) => c.trim());
      const [rName = "", rEmail = "", rCode = "", rDept = "", rProg = "", rYear = "", rGrad = "", rSkills = ""] = cols;
      const emailLower = rEmail.toLowerCase();
      let error: string | undefined;
      if (!rName) error = "Missing student name";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) error = "Invalid email format";
      else if (existingEmails.has(emailLower)) error = "Duplicate: email already in directory";
      else if (seenEmails.has(emailLower)) error = "Duplicate email within CSV";
      else if (rCode && existingCodes.has(rCode.toLowerCase())) error = "Duplicate student ID";

      seenEmails.add(emailLower);

      return {
        rowNum: idx + 2,
        name: rName,
        email: emailLower,
        studentIdCode: rCode || `CSV-${idx + 1}`,
        department: rDept || "Computer Science & Engineering",
        program: rProg || "B.Tech / B.E.",
        year: rYear || "4th Year",
        gradYear: rGrad || "2027",
        skills: rSkills
          .split(";")
          .map((x) => x.trim())
          .filter(Boolean),
        error,
      };
    });
  }, [csvText, students]);

  const validCsvRows = csvPreview.filter((r) => !r.error);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    const res = await manageStudents(
      {
        name,
        email,
        studentIdCode,
        department,
        program,
        year,
        gradYear,
        skills,
        sendInvite,
      },
      "POST",
    );
    setAdding(false);
    if (!res.ok) {
      setAddError(res.error);
      return;
    }
    notify("success", `Added ${name} to the institutional student directory.`);
    setName("");
    setEmail("");
    setStudentIdCode("");
    setSkills([]);
    setAddOpen(false);
  };

  const handleImportCsv = async () => {
    if (validCsvRows.length === 0) return;
    setImporting(true);
    const res = await manageStudents(
      {
        rows: validCsvRows.map((r) => ({
          name: r.name,
          email: r.email,
          studentIdCode: r.studentIdCode,
          department: r.department,
          program: r.program,
          year: r.year,
          gradYear: r.gradYear,
          skills: r.skills,
          sendInvite: true,
        })),
      },
      "POST",
    );
    setImporting(false);
    if (res.ok) {
      notify("success", `Imported ${validCsvRows.length} student record(s) from CSV.`);
      setCsvOpen(false);
    } else {
      notify("error", res.error);
    }
  };

  const handleStatusChange = async (s: InstitutionStudentRecord, placementStatus: PlacementStatus) => {
    const res = await manageStudents({ studentId: s.id, placementStatus }, "PATCH");
    if (res.ok) notify("success", `Updated ${s.name}'s placement status to ${placementStatus}.`);
    else notify("error", res.error);
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllSelected = paged.length > 0 && paged.every((s) => selectedIds.has(s.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      paged.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const exportSelectedCsv = () => {
    const targetStudents = filtered.filter((s) => selectedIds.has(s.id));
    if (targetStudents.length === 0) return;
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Department",
      "Program",
      "Grad Year",
      "Placement Status",
      "Portal Status",
      "Skills",
    ];
    const rows = targetStudents.map((s) => [
      s.studentIdCode,
      s.name,
      s.email,
      s.department,
      s.program,
      s.gradYear,
      s.placementStatus,
      s.invitationStatus,
      s.skills.map((x) => x.name).join("; "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillbridge-selected-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("success", `Exported ${targetStudents.length} selected student records.`);
  };

  const handleEligibilityToggle = async (s: InstitutionStudentRecord) => {
    const res = await manageStudents({ studentId: s.id, placementEligible: !s.placementEligible }, "PATCH");
    if (res.ok) notify("success", `Updated placement eligibility for ${s.name}.`);
    else notify("error", res.error);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await manageStudents({ studentId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Student record removed.");
    else notify("error", res.error);
  };

  const exportCsv = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Department",
      "Program",
      "Grad Year",
      "Placement Status",
      "Portal Status",
      "Skills",
    ];
    const rows = filtered.map((s) => [
      s.studentIdCode,
      s.name,
      s.email,
      s.department,
      s.program,
      s.gradYear,
      s.placementStatus,
      s.invitationStatus,
      s.skills.map((x) => x.name).join("; "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillbridge-institution-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Student Directory"
        subtitle="Manage student records across departments, import rosters via CSV with duplicate detection, and track live Student Portal profiles."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {canEdit && (
              <>
                <button type="button" onClick={() => setCsvOpen(true)} className="btn btn-glass btn-sm">
                  <Upload size={14} /> Import CSV
                </button>
                <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary btn-sm">
                  <Plus size={15} /> Add / Invite Student
                </button>
              </>
            )}
            {filtered.length > 0 && (
              <button type="button" onClick={exportCsv} className="btn btn-ghost btn-sm">
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="glass space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <SearchInput
              value={q}
              onChange={(val) => {
                setQ(val);
                setPage(1);
              }}
              placeholder="Search student name, email, roll number, or department…"
              aria-label="Search students"
              portalVariant="academia"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by department"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="All">All Departments</option>
              {deptNames.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by placement eligibility"
              value={eligFilter}
              onChange={(e) => {
                setEligFilter(e.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="All">All Statuses</option>
              <option value="Eligible">Placement Eligible</option>
              <option value="Placed">Placed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <SearchInput
              value={skillFilter}
              onChange={(val) => {
                setSkillFilter(val);
                setPage(1);
              }}
              placeholder="Skill (e.g. React)…"
              aria-label="Filter by skill"
              portalVariant="academia"
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={22} />}
          title={students.length === 0 ? "No students in your institutional directory yet" : "No students match your filters"}
          text={
            students.length === 0
              ? "Import your student roster via CSV, invite individual students, or have students register on the Student Portal with your institution name."
              : "Try clearing your search or department filters."
          }
          action={
            canEdit && (
              <div className="flex flex-wrap justify-center gap-2.5">
                <button type="button" onClick={() => setCsvOpen(true)} className="btn btn-glass btn-sm">
                  <Upload size={14} /> Import CSV Roster
                </button>
                <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Add Student
                </button>
              </div>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/40 border border-sb-cyan/30 backdrop-blur-xl animate-in fade-in-0 duration-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-sb-cyan">
                <span>{selectedIds.size} student(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSelectedCsv}
                  className="btn btn-primary btn-sm !py-1 !px-3 text-xs"
                >
                  <Download size={13} /> Export Selected CSV
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="btn btn-ghost btn-sm !py-1 !px-2.5 text-xs text-sb-muted"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-sb-muted">
                  <tr>
                    <th className="w-10 px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        aria-label="Select all students on this page"
                        className="text-sb-muted hover:text-white"
                      >
                        {isAllSelected ? (
                          <CheckSquare size={16} className="text-sb-cyan" />
                        ) : isSomeSelected ? (
                          <MinusSquare size={16} className="text-sb-cyan" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Department &amp; Batch</th>
                    <th className="px-4 py-3.5">Skills &amp; Profile</th>
                    <th className="px-4 py-3.5">Placement Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paged.map((s) => {
                    const isSelected = selectedIds.has(s.id);
                    return (
                      <tr key={s.id} className={`hover:bg-white/[0.02] ${isSelected ? "bg-cyan-950/20" : ""}`}>
                        <td className="w-10 px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleSelectRow(s.id, e)}
                            aria-label={`Select student ${s.name}`}
                            className="text-sb-muted hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-sb-cyan" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size={36} />
                        <div>
                          <button
                            type="button"
                            onClick={() => setDetailTarget(s)}
                            className="font-semibold text-white hover:text-sb-cyan"
                          >
                            {s.name}
                          </button>
                          <p className="text-xs text-sb-muted">
                            {s.studentIdCode} ·{" "}
                            <a
                              href={`mailto:${s.email}`}
                              className="hover:underline hover:text-sb-cyan transition-colors"
                              aria-label={`Email student at ${s.email}`}
                            >
                              {s.email}
                            </a>
                          </p>
                          <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-sb-cyan">
                            {s.invitationStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="font-medium text-white">{s.department}</p>
                      <p className="text-sb-muted">
                        {s.program} · {s.year} (Class of {s.gradYear})
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="text-sb-muted">
                        Completion: <strong className="text-white">{s.profileCompletion}%</strong> ·{" "}
                        {s.applicationsCount} app(s)
                      </p>
                      {s.skills.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {s.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk.id}
                              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-sb-muted"
                            >
                              {sk.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {canEdit ? (
                          <select
                            aria-label={`Placement status for ${s.name}`}
                            value={s.placementStatus}
                            onChange={(e) => handleStatusChange(s, e.target.value as PlacementStatus)}
                            className="rounded-lg border border-white/15 bg-[#101318] px-2.5 py-1.5 text-xs font-semibold text-white"
                          >
                            {PLACEMENT_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-semibold">{s.placementStatus}</span>
                        )}
                        <TRIndicator
                          variant="compact"
                          skillsCount={s.skills.length}
                          projectsCount={s.projects.length}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailTarget(s)}
                          className="btn btn-glass btn-sm"
                        >
                          Profile
                        </button>
                        {canEdit && !s.id.startsWith("linked-") && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(s)}
                            className="btn btn-danger btn-sm"
                            aria-label={`Remove ${s.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-sb-muted">
              <span>
                Page {safePage} of {totalPages} ({filtered.length} students)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-glass btn-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-glass btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

      {/* Student Detail Modal */}
      <Modal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? `Student Record — ${detailTarget.name}` : "Student Record"}
      >
        {detailTarget && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{detailTarget.name}</h3>
                <p className="text-sb-muted">
                  {detailTarget.studentIdCode} ·{" "}
                  <a
                    href={`mailto:${detailTarget.email}`}
                    className="hover:underline hover:text-sb-cyan transition-colors"
                    aria-label={`Email student at ${detailTarget.email}`}
                  >
                    {detailTarget.email}
                  </a>
                </p>
              </div>
              <span className="chip">{detailTarget.invitationStatus}</span>
            </div>

            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 sm:grid-cols-2">
              <div>
                <strong className="text-white">Department:</strong> {detailTarget.department}
              </div>
              <div>
                <strong className="text-white">Program:</strong> {detailTarget.program} ({detailTarget.year})
              </div>
              <div>
                <strong className="text-white">Graduation Year:</strong> {detailTarget.gradYear}
              </div>
              <div>
                <strong className="text-white">Placement Eligible:</strong>{" "}
                {detailTarget.placementEligible ? "Yes" : "No"}
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span>Placement Drive Eligibility</span>
                <button
                  type="button"
                  onClick={() => handleEligibilityToggle(detailTarget)}
                  className="btn btn-glass btn-sm"
                >
                  {detailTarget.placementEligible ? "Mark Ineligible" : "Mark Eligible"}
                </button>
              </div>
            )}

            <div>
              <h4 className="font-semibold uppercase tracking-wider text-sb-muted">Skills</h4>
              {detailTarget.skills.length === 0 ? (
                <p className="mt-1 text-sb-muted">No skills recorded yet.</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detailTarget.skills.map((sk) => (
                    <span key={sk.id} className="chip">
                      {sk.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Single Student Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add / Invite Student to Directory"
      >
        <form onSubmit={handleAddStudent} className="space-y-4" noValidate>
          {addError && <ErrorNote>{addError}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Student Full Name"
              placeholder="Riya Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Institutional Email"
              type="email"
              placeholder="riya.d@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Student ID / Roll Number"
              placeholder="CSE-2027-042"
              value={studentIdCode}
              onChange={(e) => setStudentIdCode(e.target.value)}
            />
            <SelectField
              label="Department"
              options={deptNames.length ? deptNames : ["Computer Science & Engineering"]}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <TextField
              label="Program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
            <TextField
              label="Graduation Year"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
            />
          </div>

          <TagInput
            label="Known Skills"
            optional
            value={skills}
            onChange={setSkills}
            placeholder="Python, React, SQL…"
          />

          <div className="flex items-center justify-between gap-3 text-xs text-sb-muted p-2 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-sb-cyan shrink-0" />
              <span>Record Student Portal invitation (links automatically on student registration)</span>
            </div>
            <SkillBridgeToggle
              checked={sendInvite}
              onChange={setSendInvite}
              aria-label="Record Student Portal invitation"
              accent="cyan"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={adding} className="btn btn-primary btn-sm">
              {adding && <Loader2 size={14} className="animate-spin" />}
              Save Student Record
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Bulk Import Modal */}
      <Modal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Import Student Roster via CSV"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCsvOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={importing || validCsvRows.length === 0}
              onClick={handleImportCsv}
              className="btn btn-primary btn-sm"
            >
              {importing && <Loader2 size={14} className="animate-spin" />}
              Import {validCsvRows.length} Valid Record(s)
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-sb-muted">
            Paste CSV rows with columns:{" "}
            <code className="text-sb-cyan">name,email,studentIdCode,department,program,year,gradYear,skills</code>{" "}
            (separate multiple skills with <code className="text-sb-cyan">;</code>). Duplicate emails or student IDs are
            automatically flagged before saving.
          </p>

          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            aria-label="CSV input data"
            className="field font-mono text-xs"
          />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Validation Preview ({validCsvRows.length} valid of {csvPreview.length} rows)
            </h4>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.03] text-sb-muted">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {csvPreview.map((r) => (
                    <tr key={r.rowNum}>
                      <td className="px-3 py-2 text-sb-muted">#{r.rowNum}</td>
                      <td className="px-3 py-2 font-medium text-white">{r.name}</td>
                      <td className="px-3 py-2 text-sb-muted">{r.email}</td>
                      <td className="px-3 py-2 text-sb-muted">{r.department}</td>
                      <td className="px-3 py-2">
                        {r.error ? (
                          <span className="text-[#ff82be]">{r.error}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sb-cyan">
                            <CheckCircle2 size={12} /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Student Record"
        text={`Remove ${deleteTarget?.name ?? ""} from the institutional roster?`}
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
