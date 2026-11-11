"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderKanban,
  Microscope,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAcademia } from "./AcademiaProvider";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  ACADEMIC_OPP_CATEGORIES,
  type AcademicOppCategory,
  type AcademicOpportunity,
} from "@/lib/academia/types";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";

interface OppFormState {
  id?: string;
  title: string;
  category: AcademicOppCategory;
  department: string;
  supervisorName: string;
  supervisorEmail: string;
  sponsorCompany: string;
  mode: WorkMode;
  location: string;
  requiredSkillsText: string;
  eligibility: string;
  positions: string;
  deadline: string;
  stipendOrGrant: string;
  description: string;
  publicationReference: string;
  status: AcademicOpportunity["status"];
}

export default function AcademicProjectsView({
  focus = "projects",
}: {
  focus?: "projects" | "research";
}) {
  const { data, manageOpportunities, notify } = useAcademia();
  const { academicOpportunities, departments, faculty, staff, institution } = data;
  const isReadOnly = staff.role === "Read-Only Analyst";

  const defaultCategory: AcademicOppCategory =
    focus === "research" ? "Student Research Opportunity" : "Faculty-Led Project";

  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>(
    focus === "research" ? "Research" : "All",
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emptyForm: OppFormState = {
    title: "",
    category: defaultCategory,
    department: departments[0]?.name ?? staff.department ?? "Computer Science & Engineering",
    supervisorName: faculty[0]?.name ?? staff.name,
    supervisorEmail: faculty[0]?.email ?? staff.email,
    sponsorCompany: "",
    mode: "On-site",
    location: `${institution.city || "Campus"} Research & Innovation Lab`,
    requiredSkillsText: "Python, PyTorch, Research Writing",
    eligibility: "Open to 3rd & 4th Year B.Tech / M.Tech students",
    positions: "3",
    deadline: "2026-12-20",
    stipendOrGrant: "₹15,000 / mo Fellowship Grant",
    description: "",
    publicationReference: "",
    status: "Published",
  };

  const [form, setForm] = useState<OppFormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return academicOpportunities.filter((o) => {
      if (catFilter === "Research") {
        const isRes =
          o.category === "Student Research Opportunity" ||
          o.category === "Research Collaboration Request" ||
          Boolean(o.publicationReference);
        if (!isRes) return false;
      } else if (catFilter === "Projects") {
        const isProj =
          o.category === "Faculty-Led Project" ||
          o.category === "Interdisciplinary Project" ||
          o.category === "Industry-Sponsored Academic Project" ||
          o.category === "Innovation Challenge / Hackathon";
        if (!isProj) return false;
      } else if (catFilter !== "All" && o.category !== catFilter) {
        return false;
      }
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.title.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.supervisorName.toLowerCase().includes(q) ||
        o.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [academicOpportunities, query, catFilter, statusFilter]);

  function openNew() {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(opp: AcademicOpportunity) {
    setForm({
      id: opp.id,
      title: opp.title,
      category: opp.category,
      department: opp.department,
      supervisorName: opp.supervisorName,
      supervisorEmail: opp.supervisorEmail,
      sponsorCompany: opp.sponsorCompany ?? "",
      mode: opp.mode,
      location: opp.location,
      requiredSkillsText: opp.requiredSkills.join(", "),
      eligibility: opp.eligibility,
      positions: String(opp.positions),
      deadline: opp.deadline,
      stipendOrGrant: opp.stipendOrGrant,
      description: opp.description,
      publicationReference: opp.publicationReference ?? "",
      status: opp.status,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function saveOpportunity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await manageOpportunities(
      {
        id: form.id,
        title: form.title,
        category: form.category,
        department: form.department,
        supervisorName: form.supervisorName,
        supervisorEmail: form.supervisorEmail,
        sponsorCompany: form.sponsorCompany || undefined,
        mode: form.mode,
        location: form.location,
        requiredSkills: form.requiredSkillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        eligibility: form.eligibility,
        positions: Number(form.positions) || 2,
        deadline: form.deadline,
        stipendOrGrant: form.stipendOrGrant,
        description: form.description,
        publicationReference: form.publicationReference || undefined,
        status: form.status,
      },
      form.id ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error ?? "Could not save opportunity.");
      return;
    }
    notify(
      "success",
      form.status === "Published"
        ? "Opportunity saved and synced to the Student Portal (/student/opportunities)."
        : "Opportunity saved.",
    );
    setModalOpen(false);
  }

  async function removeOpportunity(id: string) {
    const res = await manageOpportunities({ opportunityId: id }, "DELETE");
    if (res.ok) notify("success", "Academic opportunity removed.");
    else notify("error", res.error ?? "Failed to remove.");
  }

  const publishedCount = academicOpportunities.filter((o) => o.status === "Published").length;
  const researchCount = academicOpportunities.filter(
    (o) =>
      o.category === "Student Research Opportunity" ||
      o.category === "Research Collaboration Request" ||
      Boolean(o.publicationReference),
  ).length;
  const industrySponsoredCount = academicOpportunities.filter((o) =>
    Boolean(o.sponsorCompany),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
            {focus === "research" ? <Microscope size={12} /> : <FolderKanban size={12} />}
            {focus === "research"
              ? "Research Collaboration & Labs"
              : "Academic Projects & Innovation Hub"}
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {focus === "research"
              ? "Research Collaboration & Lab Positions"
              : "Academic Projects & Sponsored Capstones"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-sb-muted">
            Publish faculty-led projects, undergraduate research fellowships, and industry-sponsored
            capstones. Published listings sync directly to the Student Portal at{" "}
            <Link href="/student/opportunities" className="text-sb-cyan hover:underline">
              /student/opportunities
            </Link>
            .
          </p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={openNew}
            className="btn-primary px-4 py-2.5 text-xs font-semibold text-white"
          >
            <Plus size={15} />
            {focus === "research" ? "Post Research Position" : "Create Academic Project"}
          </button>
        )}
      </div>

      {/* Summary metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Total Academic Listings</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {academicOpportunities.length}
          </div>
          <div className="mt-1 text-[11px] text-sb-muted">Across all departments</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Live on Student Portal</div>
          <div className="mt-1 text-2xl font-semibold text-sb-cyan">{publishedCount}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Accepting student applications</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Research & Lab Fellowships</div>
          <div className="mt-1 text-2xl font-semibold text-sb-pink">{researchCount}</div>
          <div className="mt-1 text-[11px] text-sb-muted">Faculty & lab collaborations</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-sb-muted">Industry-Sponsored R&amp;D</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-300">
            {industrySponsoredCount}
          </div>
          <div className="mt-1 text-[11px] text-sb-muted">Backed by corporate partners</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="min-w-[240px] flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by project title, faculty supervisor, department, or skill..."
            aria-label="Search projects and research"
            portalVariant="academia"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by category"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Categories</option>
            <option value="Projects">Academic &amp; Capstone Projects</option>
            <option value="Research">Research &amp; Lab Fellowships</option>
            {ACADEMIC_OPP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field-input w-auto py-2 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Opportunity Cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Sparkles size={28} className="mx-auto text-sb-cyan" />
          <h2 className="mt-3 text-base font-semibold">No matching academic opportunities</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-sb-muted">
            Create a faculty-led project, student research opportunity, or industry-sponsored
            capstone to connect students with hands-on academic work.
          </p>
          {!isReadOnly && (
            <button
              type="button"
              onClick={openNew}
              className="btn-primary mt-4 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus size={14} /> Create Opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="glass-panel flex min-w-0 flex-col justify-between rounded-2xl p-5 transition hover:border-sb-cyan/35"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
                    {opp.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {opp.sponsorCompany && (
                      <span className="rounded-full border border-sb-pink/35 bg-sb-pink/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-pink">
                        Sponsored by {opp.sponsorCompany}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        opp.status === "Published"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : "border-white/15 bg-white/[0.04] text-sb-muted"
                      }`}
                    >
                      {opp.status}
                    </span>
                  </div>
                </div>

                <h2 className="mt-3 text-base font-semibold text-white">{opp.title}</h2>
                <div className="mt-1 text-xs text-sb-muted">
                  {opp.department} · Supervised by{" "}
                  <span className="text-white/90">{opp.supervisorName}</span> ({opp.supervisorEmail})
                </div>

                <p className="mt-3 text-xs leading-relaxed text-sb-muted line-clamp-3">
                  {opp.description}
                </p>

                {opp.publicationReference && (
                  <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-sb-muted">
                    <span className="font-semibold text-white/85">Lab / Publication Ref:</span>{" "}
                    {opp.publicationReference}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/85"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-white/[0.07] pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-sb-muted">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-white/90">
                      <Users size={13} className="text-sb-cyan" />
                      {opp.positions} positions · {opp.applicantCount} student applicant(s)
                    </span>
                    <span>{opp.stipendOrGrant}</span>
                    <span>Deadline: {opp.deadline}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/student/opportunities"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-sb-cyan hover:border-sb-cyan/40"
                    >
                      Student View <ExternalLink size={11} />
                    </Link>
                    {!isReadOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(opp)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-white"
                          aria-label={`Edit ${opp.title}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOpportunity(opp.id)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-sb-pink"
                          aria-label={`Delete ${opp.title}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
          aria-labelledby="academic-opp-modal-title"
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 id="academic-opp-modal-title" className="text-lg font-semibold">
                  {form.id ? "Edit Academic Opportunity" : "Publish Academic / Research Opportunity"}
                </h2>
                <p className="text-xs text-sb-muted">
                  Published opportunities appear in the Student Portal with an Academic badge.
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

            <form onSubmit={saveOpportunity} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="opp-title">
                    Project / Research Title *
                  </label>
                  <input
                    id="opp-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Autonomous Drone Swarm Navigation Lab Fellowship"
                    className="field-input"
                  />
                  {errors.title && <p className="field-error">{errors.title}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-cat">
                    Category
                  </label>
                  <select
                    id="opp-cat"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as AcademicOppCategory })
                    }
                    className="field-input"
                  >
                    {ACADEMIC_OPP_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-dept">
                    Department
                  </label>
                  <input
                    id="opp-dept"
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-sup-name">
                    Faculty Supervisor Name
                  </label>
                  <input
                    id="opp-sup-name"
                    type="text"
                    value={form.supervisorName}
                    onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-sup-email">
                    Supervisor Institutional Email
                  </label>
                  <input
                    id="opp-sup-email"
                    type="email"
                    value={form.supervisorEmail}
                    onChange={(e) => setForm({ ...form, supervisorEmail: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-sponsor">
                    Industry Sponsor (Optional)
                  </label>
                  <input
                    id="opp-sponsor"
                    type="text"
                    value={form.sponsorCompany}
                    onChange={(e) => setForm({ ...form, sponsorCompany: e.target.value })}
                    placeholder="e.g., Aether Cloud Systems"
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-stipend">
                    Grant / Fellowship / Academic Credit
                  </label>
                  <input
                    id="opp-stipend"
                    type="text"
                    value={form.stipendOrGrant}
                    onChange={(e) => setForm({ ...form, stipendOrGrant: e.target.value })}
                    placeholder="₹15,000 / mo or 4 Academic Credits"
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-mode">
                    Mode
                  </label>
                  <select
                    id="opp-mode"
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

                <div>
                  <label className="field-label" htmlFor="opp-loc">
                    Lab / Campus Location
                  </label>
                  <input
                    id="opp-loc"
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-positions">
                    Available Positions
                  </label>
                  <input
                    id="opp-positions"
                    type="number"
                    min={1}
                    max={50}
                    value={form.positions}
                    onChange={(e) => setForm({ ...form, positions: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-deadline">
                    Application Deadline *
                  </label>
                  <input
                    id="opp-deadline"
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="field-input"
                  />
                  {errors.deadline && <p className="field-error">{errors.deadline}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="opp-skills">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    id="opp-skills"
                    type="text"
                    value={form.requiredSkillsText}
                    onChange={(e) => setForm({ ...form, requiredSkillsText: e.target.value })}
                    placeholder="Python, PyTorch, Embedded C, Literature Review"
                    className="field-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="opp-elig">
                    Eligibility Criteria
                  </label>
                  <input
                    id="opp-elig"
                    type="text"
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    className="field-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="opp-pub">
                    Publication / Grant Reference (Optional)
                  </label>
                  <input
                    id="opp-pub"
                    type="text"
                    value={form.publicationReference}
                    onChange={(e) => setForm({ ...form, publicationReference: e.target.value })}
                    placeholder="e.g., IEEE ICRA 2026 Working Group / DST-SERB Grant #CRG/2026/0041"
                    className="field-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="opp-desc">
                    Project Scope &amp; Deliverables *
                  </label>
                  <textarea
                    id="opp-desc"
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the research objective, weekly lab commitment, and student learning outcomes..."
                    className="field-input"
                  />
                  {errors.description && <p className="field-error">{errors.description}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="opp-status">
                    Publication Status
                  </label>
                  <select
                    id="opp-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as AcademicOpportunity["status"],
                      })
                    }
                    className="field-input"
                  >
                    <option value="Published">Published (Visible to Students)</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
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
                  {busy ? "Saving..." : form.id ? "Update Opportunity" : "Publish Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
