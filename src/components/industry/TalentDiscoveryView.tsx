"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Bookmark,
  Briefcase,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import {
  Avatar,
  EmptyState,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
} from "@/components/student/ui";
import SearchInput from "@/components/ui/SearchInput";
import { ATS_STAGES, type AtsStage, type CandidateSummary } from "@/lib/industry/types";
import { WORK_MODES } from "@/lib/student/types";
import { TRIndicator } from "@/components/ui/TRIndicator";

export default function TalentDiscoveryView({ initialQuery = "" }: { initialQuery?: string }) {
  const { data, setSavedCandidate, updateApplicants, sendMessage, notify } = useIndustry();
  const { recruiter, company, jobs, candidates } = data;

  const [q, setQ] = useState(initialQuery);
  const [skillFilter, setSkillFilter] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("All");
  const [gradYearFilter, setGradYearFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [onlyWithProjects, setOnlyWithProjects] = useState(false);
  const [onlyWithCerts, setOnlyWithCerts] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);

  const [busySaveId, setBusySaveId] = useState<string | null>(null);
  const [profileTarget, setProfileTarget] = useState<CandidateSummary | null>(null);

  // Add to Job Pipeline Modal
  const [pipelineTarget, setPipelineTarget] = useState<CandidateSummary | null>(null);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? "");
  const [selectedStage, setSelectedStage] = useState<AtsStage>("Shortlisted");
  const [addingToJob, setAddingToJob] = useState(false);

  // Message Candidate Modal
  const [msgTarget, setMsgTarget] = useState<CandidateSummary | null>(null);
  const [msgBody, setMsgBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const savedSet = useMemo(() => new Set(recruiter.savedCandidateIds), [recruiter.savedCandidateIds]);

  const targetSkillsLower = useMemo(() => {
    const s = new Set<string>();
    for (const sk of company.hiringPreferences.skills) s.add(sk.toLowerCase());
    for (const j of jobs) for (const sk of j.requiredSkills) s.add(sk.toLowerCase());
    return s;
  }, [company.hiringPreferences.skills, jobs]);

  const degrees = useMemo(() => {
    const s = new Set<string>();
    for (const c of candidates) if (c.degree) s.add(c.degree);
    return Array.from(s);
  }, [candidates]);

  const gradYears = useMemo(() => {
    const s = new Set<string>();
    for (const c of candidates) if (c.gradYear) s.add(c.gradYear);
    return Array.from(s).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const skQ = skillFilter.trim().toLowerCase();
    return candidates.filter((c) => {
      if (onlySaved && !savedSet.has(c.id)) return false;
      if (onlyWithProjects && c.projects.length === 0) return false;
      if (onlyWithCerts && c.certifications.length === 0) return false;
      if (degreeFilter !== "All" && c.degree !== degreeFilter) return false;
      if (gradYearFilter !== "All" && c.gradYear !== gradYearFilter) return false;
      if (modeFilter !== "All" && !c.preferredModes.includes(modeFilter as never)) return false;
      if (skQ && !c.skills.some((s) => s.name.toLowerCase().includes(skQ))) return false;
      if (query) {
        const hay = [
          c.name,
          c.headline,
          c.bio,
          c.college,
          c.degree,
          c.branch,
          ...c.skills.map((s) => s.name),
          ...c.projects.map((p) => p.title),
          ...c.interestedRoles,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [
    candidates,
    onlySaved,
    savedSet,
    onlyWithProjects,
    onlyWithCerts,
    degreeFilter,
    gradYearFilter,
    modeFilter,
    skillFilter,
    q,
  ]);

  const handleToggleSave = async (cand: CandidateSummary) => {
    const next = !savedSet.has(cand.id);
    setBusySaveId(cand.id);
    const res = await setSavedCandidate(cand.id, next);
    setBusySaveId(null);
    if (res.ok) {
      notify("success", next ? `Saved ${cand.name} to your talent pool.` : `Removed ${cand.name} from saved talent.`);
    } else {
      notify("error", res.error);
    }
  };

  const handleAddToPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineTarget || !selectedJobId) return;
    setAddingToJob(true);
    const res = await updateApplicants({
      createForCandidateId: pipelineTarget.id,
      jobId: selectedJobId,
      stage: selectedStage,
    });
    setAddingToJob(false);
    if (res.ok) {
      notify("success", `Added ${pipelineTarget.name} to job pipeline (${selectedStage}).`);
      setPipelineTarget(null);
    } else {
      notify("error", res.error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTarget || !msgBody.trim()) return;
    setSendingMsg(true);
    const res = await sendMessage({
      candidateId: msgTarget.id,
      body: msgBody,
    });
    setSendingMsg(false);
    if (res.ok) {
      notify("success", `Message sent to ${msgTarget.name}.`);
      setMsgBody("");
      setMsgTarget(null);
    } else {
      notify("error", res.error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent Discovery & Search"
        subtitle="Discover onboarded SkillBridge students by skills, projects, degree, and graduation year. Transparent skill overlap is shown without black-box AI scores."
        action={
          <button
            type="button"
            onClick={() => setOnlySaved((v) => !v)}
            aria-pressed={onlySaved}
            className={`btn btn-sm ${onlySaved ? "btn-primary" : "btn-glass"}`}
          >
            <Bookmark size={14} /> Saved Candidates ({recruiter.savedCandidateIds.length})
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="glass space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search by student name, college, branch, project, or role interest…"
              aria-label="Search candidates"
              portalVariant="industry"
            />
          </div>

          <div className="md:col-span-3">
            <SearchInput
              value={skillFilter}
              onChange={setSkillFilter}
              placeholder="Filter by skill (React, Python, Figma)…"
              aria-label="Filter by skill"
              portalVariant="industry"
            />
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by degree"
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              className="field"
            >
              <option value="All">All Degrees</option>
              {degrees.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by graduation year"
              value={gradYearFilter}
              onChange={(e) => setGradYearFilter(e.target.value)}
              className="field"
            >
              <option value="All">All Grad Years</option>
              {gradYears.map((y) => (
                <option key={y} value={y}>
                  Class of {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-sb-muted">
          <div className="flex flex-wrap items-center gap-2">
            <span>Work mode:</span>
            {["All", ...WORK_MODES].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModeFilter(m)}
                className={`rounded-full border px-2.5 py-0.5 ${
                  modeFilter === m
                    ? "border-sb-cyan/50 bg-sb-blue/20 text-white"
                    : "border-white/10 bg-white/[0.02] text-sb-muted hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setOnlyWithProjects((v) => !v)}
              aria-pressed={onlyWithProjects}
              className={`ml-2 rounded-full border px-2.5 py-0.5 ${
                onlyWithProjects
                  ? "border-sb-cyan/50 bg-sb-blue/20 text-white"
                  : "border-white/10 bg-white/[0.02] text-sb-muted hover:text-white"
              }`}
            >
              Has Projects
            </button>

            <button
              type="button"
              onClick={() => setOnlyWithCerts((v) => !v)}
              aria-pressed={onlyWithCerts}
              className={`rounded-full border px-2.5 py-0.5 ${
                onlyWithCerts
                  ? "border-sb-cyan/50 bg-sb-blue/20 text-white"
                  : "border-white/10 bg-white/[0.02] text-sb-muted hover:text-white"
              }`}
            >
              Has Certifications
            </button>
          </div>

          <span>
            Showing <strong className="text-white">{filtered.length}</strong> candidate
            {filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Candidate Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No candidates match your filters"
          text="Try broadening your skill, degree, or graduation year filters."
          action={
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => {
                setQ("");
                setSkillFilter("");
                setDegreeFilter("All");
                setGradYearFilter("All");
                setModeFilter("All");
                setOnlyWithProjects(false);
                setOnlyWithCerts(false);
                setOnlySaved(false);
              }}
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((cand) => {
            const isSaved = savedSet.has(cand.id);
            const matchedSkills = cand.skills.filter((s) => targetSkillsLower.has(s.name.toLowerCase()));
            return (
              <article key={cand.id} className="glass flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <Avatar name={cand.name} src={cand.avatar} size={46} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setProfileTarget(cand)}
                            className="truncate text-base font-bold hover:text-sb-cyan"
                          >
                            {cand.name}
                          </button>
                          {cand.isDemoCandidate ? (
                            <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-sb-muted">
                              Demo Candidate
                            </span>
                          ) : (
                            <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2 py-0.5 text-[10px] font-semibold text-sb-cyan">
                              Student Member
                            </span>
                          )}
                          <TRIndicator
                            variant="compact"
                            skillsCount={cand.skills.length}
                            projectsCount={cand.projects.length}
                          />
                        </div>
                        <p className="truncate text-xs text-sb-muted">{cand.headline}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-sb-muted">
                          <GraduationCap size={12} className="text-sb-cyan" />
                          {cand.college || "University Student"}
                          {cand.gradYear ? ` · Class of ${cand.gradYear}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busySaveId === cand.id}
                      onClick={() => handleToggleSave(cand)}
                      aria-label={isSaved ? `Remove ${cand.name} from saved` : `Save ${cand.name}`}
                      aria-pressed={isSaved}
                      className={`grid h-9 w-9 flex-none place-items-center rounded-xl border transition-colors ${
                        isSaved
                          ? "border-sb-pink/50 bg-sb-pink/20 text-[#ff82be]"
                          : "border-white/10 bg-white/[0.03] text-sb-muted hover:text-white"
                      }`}
                    >
                      <Bookmark size={16} />
                    </button>
                  </div>

                  {/* Transparent Match Explanation */}
                  {matchedSkills.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-sb-cyan/30 bg-sb-blue/10 px-3 py-1.5 text-xs text-sb-cyan">
                      <Sparkles size={13} />
                      <span>
                        Matches your target skills:{" "}
                        <strong>{matchedSkills.map((s) => s.name).join(", ")}</strong>
                      </span>
                    </div>
                  )}

                  {/* Skills */}
                  {cand.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cand.skills.slice(0, 6).map((s) => (
                        <span key={s.id} className="chip">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Portfolio / Projects Summary */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-sb-muted">
                    <span className="inline-flex items-center gap-1">
                      <FolderGit2 size={13} className="text-sb-cyan" /> {cand.projects.length} project
                      {cand.projects.length === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award size={13} className="text-sb-cyan" /> {cand.certifications.length} certification
                      {cand.certifications.length === 1 ? "" : "s"}
                    </span>
                    {cand.preferredModes.length > 0 && (
                      <span>Prefers: {cand.preferredModes.join(", ")}</span>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5">
                  <button
                    type="button"
                    onClick={() => setProfileTarget(cand)}
                    className="btn btn-ghost btn-sm"
                  >
                    View Profile
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMsgTarget(cand)}
                      className="btn btn-glass btn-sm"
                    >
                      <MessageSquare size={14} /> Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJobId(jobs[0]?.id ?? "");
                        setPipelineTarget(cand);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <UserPlus size={14} /> Add to Job
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Candidate Full Profile Modal */}
      <Modal
        open={!!profileTarget}
        onClose={() => setProfileTarget(null)}
        title={profileTarget ? `${profileTarget.name} — Student Profile` : "Student Profile"}
        footer={
          profileTarget ? (
            <>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => {
                  const t = profileTarget;
                  setProfileTarget(null);
                  setMsgTarget(t);
                }}
              >
                <MessageSquare size={14} /> Contact Candidate
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const t = profileTarget;
                  setProfileTarget(null);
                  setSelectedJobId(jobs[0]?.id ?? "");
                  setPipelineTarget(t);
                }}
              >
                <UserPlus size={14} /> Add to Job Pipeline
              </button>
            </>
          ) : undefined
        }
      >
        {profileTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <Avatar name={profileTarget.name} src={profileTarget.avatar} size={56} />
              <div>
                <h3 className="text-lg font-bold">{profileTarget.name}</h3>
                <p className="text-xs text-sb-muted">{profileTarget.headline}</p>
                <p className="mt-1 text-xs text-sb-cyan">
                  {profileTarget.college} · {profileTarget.degree} ({profileTarget.branch}) · Class of{" "}
                  {profileTarget.gradYear || "N/A"}
                </p>
              </div>
            </div>

            {profileTarget.bio && <p className="text-sm text-sb-text">{profileTarget.bio}</p>}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Skills</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profileTarget.skills.map((s) => (
                  <span key={s.id} className="chip">
                    {s.name} · <span className="text-sb-muted">{s.level}</span>
                  </span>
                ))}
              </div>
            </div>

            {profileTarget.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Projects Portfolio</h4>
                <div className="mt-2 space-y-2.5">
                  {profileTarget.projects.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{p.title}</span>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sb-cyan"
                          >
                            Link <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-sb-muted">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTarget.certifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Certifications</h4>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {profileTarget.certifications.map((c) => (
                    <li key={c.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                      <strong className="text-white">{c.title}</strong> · <span className="text-sb-muted">{c.issuer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add to Job Pipeline Modal */}
      <Modal
        open={!!pipelineTarget}
        onClose={() => setPipelineTarget(null)}
        title={pipelineTarget ? `Add ${pipelineTarget.name} to Job Pipeline` : "Add to Pipeline"}
      >
        {jobs.length === 0 ? (
          <div className="space-y-3 text-center">
            <Briefcase size={24} className="mx-auto text-sb-cyan" />
            <p className="text-sm font-semibold">Create a job listing first</p>
            <p className="text-xs text-sb-muted">
              You need at least one job or internship listing in your workspace to add a candidate to a pipeline.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddToPipeline} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Select Job / Internship</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="field"
                required
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.status})
                  </option>
                ))}
              </select>
            </div>

            <SelectField
              label="Initial Hiring Stage"
              options={ATS_STAGES}
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as AtsStage)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPipelineTarget(null)}>
                Cancel
              </button>
              <button type="submit" disabled={addingToJob} className="btn btn-primary btn-sm">
                {addingToJob && <Loader2 size={14} className="animate-spin" />}
                Add Candidate
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Contact Candidate Modal */}
      <Modal
        open={!!msgTarget}
        onClose={() => setMsgTarget(null)}
        title={msgTarget ? `Contact ${msgTarget.name}` : "Contact Candidate"}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <TextAreaField
            label="Message"
            rows={4}
            placeholder={`Hi ${msgTarget?.name.split(" ")[0] ?? "there"}, we came across your SkillBridge profile and would love to invite you to explore our open roles at ${company.name}…`}
            value={msgBody}
            onChange={(e) => setMsgBody(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMsgTarget(null)}>
              Cancel
            </button>
            <button type="submit" disabled={sendingMsg || !msgBody.trim()} className="btn btn-primary btn-sm">
              {sendingMsg && <Loader2 size={14} className="animate-spin" />}
              Send Message
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
