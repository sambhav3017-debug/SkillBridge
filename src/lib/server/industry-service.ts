import crypto from "crypto";
import { cache } from "react";
import { ApiError } from "./http";
import { mutateDb, readDb, type DB, type StudentRecord, type UserRecord } from "./db";
import {
  addSession,
  clearThrottle,
  getIndustrySessionUser,
  hashPassword,
  throttle,
  verifyPassword,
} from "./auth";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateUrl,
} from "@/lib/student/validation";
import { WORK_MODES, type WorkMode } from "@/lib/student/types";
import {
  ATS_STAGES,
  EVENT_STATUSES,
  EVENT_TYPES,
  INDUSTRY_CATEGORIES,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  JOB_TYPES,
  TEAM_ROLES,
  type AtsApplicant,
  type AtsStage,
  type CampusEvent,
  type CandidateSummary,
  type CompanyProfile,
  type EventStatus,
  type EventType,
  type IndustryWorkspaceData,
  type InterviewFeedback,
  type InterviewRecord,
  type InterviewStatus,
  type InterviewType,
  type JobListing,
  type JobType,
  type TeamRole,
} from "@/lib/industry/types";

const uid = () => crypto.randomUUID();
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function fail(fieldErrors: Record<string, string>): never {
  const first = Object.values(fieldErrors)[0];
  throw new ApiError(422, first, fieldErrors);
}

function stringList(v: unknown, maxItems = 25, maxLen = 50): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const t = str(item, maxLen);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, maxItems);
}

/**
 * DEMO CANDIDATES — clearly flagged with `isDemoCandidate: true`.
 * Included alongside real onboarded students so talent search and filters can be tested immediately.
 */
const DEMO_CANDIDATES: CandidateSummary[] = [
  {
    id: "demo-cand-01",
    name: "Ananya Deshmukh",
    avatar: "",
    headline: "Final-year B.Tech CS · Full-Stack & Cloud Enthusiast",
    bio: "Building distributed web services and developer tools. Mentored 40+ juniors in React and TypeScript workshops.",
    college: "MIT ADT University",
    degree: "B.Tech / B.E.",
    branch: "Computer Science",
    year: "4th Year",
    gradYear: "2027",
    skills: [
      { id: "dc1-s1", name: "React", level: "Advanced" },
      { id: "dc1-s2", name: "TypeScript", level: "Advanced" },
      { id: "dc1-s3", name: "Node.js", level: "Intermediate" },
      { id: "dc1-s4", name: "PostgreSQL", level: "Intermediate" },
    ],
    projects: [
      {
        id: "dc1-p1",
        title: "EdgeDeploy — Zero-config preview server",
        description: "Container runner that spins up ephemeral branch previews with automatic TLS and build logs.",
        technologies: ["TypeScript", "Node.js", "Docker"],
        url: "https://github.com/example/edgedeploy",
      },
    ],
    certifications: [
      {
        id: "dc1-c1",
        title: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issueDate: "2025-11-15",
      },
    ],
    linkedin: "https://linkedin.com/in/ananya-demo",
    github: "https://github.com/ananya-demo",
    portfolio: "https://ananya-demo.example.com",
    preferredTypes: ["Internship", "Full-time Job"],
    preferredModes: ["Hybrid", "Remote"],
    interestedRoles: ["Frontend Engineer", "Full-Stack Developer"],
    hasResume: false,
    isDemoCandidate: true,
  },
  {
    id: "demo-cand-02",
    name: "Rohan Kulkarni",
    avatar: "",
    headline: "3rd Year AI & Data Science · PyTorch & NLP",
    bio: "Focused on applied NLP, retrieval-augmented pipelines, and clean evaluation benchmarks.",
    college: "COEP Technological University",
    degree: "B.Tech / B.E.",
    branch: "Artificial Intelligence & Data Science",
    year: "3rd Year",
    gradYear: "2028",
    skills: [
      { id: "dc2-s1", name: "Python", level: "Advanced" },
      { id: "dc2-s2", name: "PyTorch", level: "Intermediate" },
      { id: "dc2-s3", name: "SQL", level: "Advanced" },
      { id: "dc2-s4", name: "Machine Learning", level: "Intermediate" },
    ],
    projects: [
      {
        id: "dc2-p1",
        title: "IndicEval — Multilingual QA Benchmark",
        description: "Evaluation harness and curated dataset for question-answering across 6 Indian languages.",
        technologies: ["Python", "PyTorch", "Pandas"],
        url: "https://github.com/example/indiceval",
      },
    ],
    certifications: [
      {
        id: "dc2-c1",
        title: "Deep Learning Specialization",
        issuer: "DeepLearning.AI",
        issueDate: "2026-01-20",
      },
    ],
    linkedin: "https://linkedin.com/in/rohan-demo",
    github: "https://github.com/rohan-demo",
    portfolio: "",
    preferredTypes: ["Internship", "Project", "Hackathon"],
    preferredModes: ["Remote", "Hybrid"],
    interestedRoles: ["Machine Learning Intern", "Data Analyst"],
    hasResume: false,
    isDemoCandidate: true,
  },
  {
    id: "demo-cand-03",
    name: "Meera Nair",
    avatar: "",
    headline: "Product Designer & Frontend Prototyper",
    bio: "Designing accessible interfaces and design systems, bridging Figma specs with clean React components.",
    college: "IDC School of Design",
    degree: "B.Sc",
    branch: "Interaction Design",
    year: "3rd Year",
    gradYear: "2027",
    skills: [
      { id: "dc3-s1", name: "Figma", level: "Advanced" },
      { id: "dc3-s2", name: "User Research", level: "Advanced" },
      { id: "dc3-s3", name: "Prototyping", level: "Advanced" },
      { id: "dc3-s4", name: "CSS", level: "Intermediate" },
    ],
    projects: [
      {
        id: "dc3-p1",
        title: "Pulse — Campus Mental Wellness Companion",
        description: "End-to-end UX case study, usability testing with 28 students, and interactive component kit.",
        technologies: ["Figma", "Prototyping", "React"],
        url: "https://meera-demo.example.com",
      },
    ],
    certifications: [],
    linkedin: "https://linkedin.com/in/meera-demo",
    github: "",
    portfolio: "https://meera-demo.example.com",
    preferredTypes: ["Internship", "Freelance"],
    preferredModes: ["Remote", "On-site"],
    interestedRoles: ["UI/UX Designer", "Product Design Intern"],
    hasResume: false,
    isDemoCandidate: true,
  },
];

/** Converts a real StudentRecord into a privacy-safe CandidateSummary (excludes private email/password/sessions). */
export function studentToCandidateSummary(user: UserRecord, rec: StudentRecord): CandidateSummary {
  const p = rec.profile;
  return {
    id: user.id,
    name: user.name,
    avatar: p.avatar,
    headline: p.headline || [p.degree, p.branch].filter(Boolean).join(" · ") || "Student on SkillBridge",
    bio: p.bio,
    college: p.college,
    degree: p.degree,
    branch: p.branch,
    year: p.year,
    gradYear: p.gradYear,
    skills: rec.skills,
    projects: rec.projects,
    certifications: rec.certifications,
    linkedin: p.linkedin,
    github: p.github,
    portfolio: p.portfolio,
    preferredTypes: p.preferences.types,
    preferredModes: p.preferences.modes,
    interestedRoles: p.preferences.roles,
    hasResume: !!rec.resume,
    resumeName: rec.resume?.name,
    isDemoCandidate: false,
  };
}

export function buildAllCandidates(db: DB): CandidateSummary[] {
  const realStudents: CandidateSummary[] = [];
  for (const u of db.users) {
    if ((u.role ?? "student") !== "student") continue;
    const st = db.students[u.id];
    if (!st) continue;
    // Respect student onboarding completion — only share profiles that completed setup or have college/skills filled
    if (st.profile.onboarded || st.profile.college || st.skills.length > 0) {
      realStudents.push(studentToCandidateSummary(u, st));
    }
  }
  return [...realStudents, ...DEMO_CANDIDATES];
}

export function assembleWorkspace(user: UserRecord, db: DB): IndustryWorkspaceData {
  const recruiter = db.recruiters[user.id];
  if (!recruiter) throw new ApiError(404, "Recruiter profile not found.");
  const company = db.companies[recruiter.companyId];
  if (!company) throw new ApiError(404, "Company profile not found.");

  const companyId = company.id;
  const jobs = db.jobs.filter((j) => j.companyId === companyId);
  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const allCandidates = buildAllCandidates(db);
  const candMap = new Map(allCandidates.map((c) => [c.id, c]));

  // Gather real student applications to this company's jobs
  const applicants: AtsApplicant[] = [];
  for (const u of db.users) {
    const st = db.students[u.id];
    if (!st) continue;
    for (const app of st.applications) {
      const job = jobMap.get(app.opportunityId);
      if (!job) continue;
      const meta = db.atsMeta[app.id];
      const stage: AtsStage = meta?.stage ?? app.status ?? "Applied";
      const cand = candMap.get(u.id) ?? studentToCandidateSummary(u, st);
      applicants.push({
        applicationId: app.id,
        jobId: job.id,
        jobTitle: job.title,
        jobType: job.type,
        candidateId: u.id,
        candidate: cand,
        appliedAt: app.appliedAt,
        stage,
        notes: meta?.notes ?? [],
        history: meta?.history ?? [{ stage, changedBy: u.name, changedAt: app.appliedAt }],
        isDemoRecord: false,
      });
    }
  }

  // Also include any company-scoped ATS records created for demo candidates
  for (const meta of Object.values(db.atsMeta)) {
    if (applicants.some((a) => a.applicationId === meta.applicationId)) continue;
    const job = jobMap.get(meta.jobId);
    const cand = candMap.get(meta.candidateId);
    if (!job || !cand) continue;
    applicants.push({
      applicationId: meta.applicationId,
      jobId: job.id,
      jobTitle: job.title,
      jobType: job.type,
      candidateId: cand.id,
      candidate: cand,
      appliedAt: meta.history[0]?.changedAt ?? job.createdAt,
      stage: meta.stage,
      notes: meta.notes,
      history: meta.history,
      isDemoRecord: !!cand.isDemoCandidate,
    });
  }

  applicants.sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt));

  return {
    recruiter,
    company,
    jobs,
    applicants,
    candidates: allCandidates,
    interviews: db.interviews.filter((iv) => iv.companyId === companyId),
    conversations: db.conversations.filter((c) => c.companyId === companyId),
    events: db.events.filter((ev) => ev.companyId === companyId),
    team: db.team.filter((t) => t.companyId === companyId),
    activities: db.activities.filter((a) => a.companyId === companyId).slice(0, 30),
  };
}

export const getCurrentIndustry = cache(async (): Promise<IndustryWorkspaceData | null> => {
  const user = await getIndustrySessionUser();
  if (!user) return null;
  const db = await readDb();
  if (!db.recruiters[user.id]) return null;
  return assembleWorkspace(user, db);
});

/* ------------------------------ Auth ------------------------------ */

export async function signupIndustry(input: Record<string, unknown>) {
  const companyName = str(input.companyName, 120);
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const recruiterName = str(input.recruiterName, 80);
  const jobTitle = str(input.jobTitle, 80);
  const website = str(input.website, 300);
  const industry = str(input.industry, 80);

  const errors: Record<string, string> = {};
  const checks: [string, string | null][] = [
    ["companyName", validateRequired(companyName, "Company name", 120)],
    ["email", validateEmail(email)],
    ["password", validatePassword(password)],
    ["recruiterName", validateRequired(recruiterName, "Your full name", 80)],
    ["jobTitle", validateRequired(jobTitle, "Job title", 80)],
    ["website", validateUrl(website, "Company website", true)],
    ["industry", validateRequired(industry, "Industry category", 80)],
  ];
  for (const [k, e] of checks) if (e) errors[k] = e;
  if (input.confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  if (input.acceptTerms !== true) errors.acceptTerms = "You must accept the terms and privacy policy.";
  if (Object.keys(errors).length) fail(errors);

  const passwordHash = hashPassword(password);
  return mutateDb((db) => {
    if (db.users.some((u) => u.email === email)) {
      throw new ApiError(409, "An account with this email already exists. Try logging in.", {
        email: "An account with this email already exists.",
      });
    }
    const now = new Date().toISOString();
    const userId = uid();
    const companyId = uid();
    const user: UserRecord = {
      id: userId,
      email,
      name: recruiterName,
      passwordHash,
      role: "recruiter",
      createdAt: now,
    };
    db.users.push(user);

    db.companies[companyId] = {
      id: companyId,
      name: companyName,
      logo: "",
      coverImage: "",
      website,
      industry: (INDUSTRY_CATEGORIES as readonly string[]).includes(industry) ? industry : "Software & Cloud",
      size: "11–50 employees",
      headquarters: "",
      description: "",
      mission: "",
      techAreas: [],
      verificationStatus: "not_submitted",
      hiringPreferences: {
        roles: [],
        skills: [],
        hireInterns: true,
        hireGraduates: true,
        locations: [],
        modes: ["Hybrid", "Remote"],
      },
      createdAt: now,
    };

    db.recruiters[userId] = {
      userId,
      companyId,
      name: recruiterName,
      email,
      jobTitle,
      role: "Company Admin",
      contactPreference: "Both",
      notifications: {
        newApplications: true,
        stageChanges: true,
        interviewReminders: true,
        jobDeadlines: true,
        teamUpdates: true,
      },
      savedCandidateIds: [],
      onboarded: false,
    };

    db.team.push({
      id: uid(),
      companyId,
      name: recruiterName,
      email,
      jobTitle,
      role: "Company Admin",
      status: "Active",
      joinedAt: now,
      isOwner: true,
    });

    db.activities.unshift({
      id: uid(),
      companyId,
      text: `${recruiterName} created the ${companyName} workspace.`,
      href: "/industry/company-profile",
      createdAt: now,
    });

    return { token: addSession(db, userId), onboarded: false };
  });
}

export async function loginIndustry(input: Record<string, unknown>) {
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const errors: Record<string, string> = {};
  const e1 = validateEmail(email);
  if (e1) errors.email = e1;
  if (!password) errors.password = "Password is required.";
  if (Object.keys(errors).length) fail(errors);
  throttle("ind:" + email);

  const db0 = await readDb();
  const user = db0.users.find((u) => u.email === email && u.role === "recruiter");
  const bad = new ApiError(401, "Incorrect work email or password.");
  if (!user) {
    hashPassword(password);
    throw bad;
  }
  if (!verifyPassword(password, user.passwordHash)) throw bad;
  clearThrottle("ind:" + email);

  return mutateDb((db) => ({
    token: addSession(db, user.id),
    onboarded: db.recruiters[user.id]?.onboarded ?? false,
  }));
}

/* --------------------- Company & Recruiter Profile --------------------- */

export async function updateIndustryMe(user: UserRecord, body: Record<string, unknown>): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    const u = db.users.find((x) => x.id === user.id);
    if (!rec || !u) throw new ApiError(404, "Recruiter account not found.");
    const comp = db.companies[rec.companyId];
    if (!comp) throw new ApiError(404, "Company profile not found.");

    const errors: Record<string, string> = {};

    if (body.company && typeof body.company === "object") {
      const c = body.company as Record<string, unknown>;
      if ("name" in c) {
        const name = str(c.name, 120);
        const e = validateRequired(name, "Company name", 120);
        if (e) errors.companyName = e;
        comp.name = name;
        for (const j of db.jobs) if (j.companyId === comp.id) j.companyName = name;
      }
      if ("website" in c) {
        const w = str(c.website, 300);
        const e = validateUrl(w, "Company website", true);
        if (e) errors.website = e;
        comp.website = w;
      }
      if ("industry" in c) comp.industry = str(c.industry, 80) || comp.industry;
      if ("size" in c) comp.size = str(c.size, 50) || comp.size;
      if ("headquarters" in c) comp.headquarters = str(c.headquarters, 120);
      if ("description" in c) comp.description = str(c.description, 1200);
      if ("mission" in c) comp.mission = str(c.mission, 800);
      if ("techAreas" in c) comp.techAreas = stringList(c.techAreas, 20, 40);
      if ("logo" in c) {
        const a = typeof c.logo === "string" ? c.logo : "";
        if (a && (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(a) || a.length > 300_000)) {
          errors.logo = "Logo must be a small PNG, JPEG or WebP image.";
        }
        comp.logo = a;
      }
      if ("coverImage" in c) {
        const a = typeof c.coverImage === "string" ? c.coverImage : "";
        if (a && (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(a) || a.length > 400_000)) {
          errors.coverImage = "Cover image must be a PNG, JPEG or WebP image.";
        }
        comp.coverImage = a;
      }
      if (c.hiringPreferences && typeof c.hiringPreferences === "object") {
        const hp = c.hiringPreferences as Record<string, unknown>;
        comp.hiringPreferences = {
          roles: stringList(hp.roles, 20, 50),
          skills: stringList(hp.skills, 25, 40),
          hireInterns: hp.hireInterns !== false,
          hireGraduates: hp.hireGraduates !== false,
          locations: stringList(hp.locations, 15, 60),
          modes: (Array.isArray(hp.modes) ? hp.modes : []).filter((m): m is WorkMode =>
            (WORK_MODES as readonly string[]).includes(m as string),
          ),
        };
      }
      if (c.submitForVerification === true && comp.verificationStatus === "not_submitted") {
        comp.verificationStatus = "pending_review";
        comp.verificationSubmittedAt = new Date().toISOString();
        comp.verificationNote =
          "Submitted in demo mode. Production verification requires an administrative review workflow.";
        db.activities.unshift({
          id: uid(),
          companyId: comp.id,
          text: `${comp.name} submitted its company profile for verification review.`,
          href: "/industry/company-profile",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (body.recruiter && typeof body.recruiter === "object") {
      const r = body.recruiter as Record<string, unknown>;
      if ("name" in r) {
        const name = str(r.name, 80);
        const e = validateRequired(name, "Full name", 80);
        if (e) errors.name = e;
        rec.name = name;
        u.name = name;
      }
      if ("email" in r) {
        const em = str(r.email, 254).toLowerCase();
        const e = validateEmail(em);
        if (e) errors.email = e;
        else if (db.users.some((x) => x.id !== u.id && x.email === em)) errors.email = "That email is already in use.";
        rec.email = em;
        u.email = em;
      }
      if ("jobTitle" in r) {
        const jt = str(r.jobTitle, 80);
        const e = validateRequired(jt, "Job title", 80);
        if (e) errors.jobTitle = e;
        rec.jobTitle = jt;
      }
      if (
        "contactPreference" in r &&
        (r.contactPreference === "Email" || r.contactPreference === "In-app messages" || r.contactPreference === "Both")
      ) {
        rec.contactPreference = r.contactPreference;
      }
      if (r.notifications && typeof r.notifications === "object") {
        const n = r.notifications as Record<string, unknown>;
        rec.notifications = {
          newApplications: n.newApplications !== false,
          stageChanges: n.stageChanges !== false,
          interviewReminders: n.interviewReminders !== false,
          jobDeadlines: n.jobDeadlines !== false,
          teamUpdates: n.teamUpdates !== false,
        };
      }
      if ("onboarded" in r && r.onboarded === true) {
        rec.onboarded = true;
      }
      const member = db.team.find((t) => t.companyId === comp.id && t.isOwner);
      if (member && member.email === u.email) {
        member.name = rec.name;
        member.jobTitle = rec.jobTitle;
      }
    }

    if (Object.keys(errors).length) fail(errors);
    return assembleWorkspace(u, db);
  });
}

/* --------------------- Jobs & Internships CRUD --------------------- */

function sanitizeJobInput(input: Record<string, unknown>, comp: CompanyProfile, existing?: JobListing): JobListing {
  const statusRaw = str(input.status, 20);
  const status: JobListing["status"] =
    statusRaw === "Published" || statusRaw === "Paused" || statusRaw === "Closed" || statusRaw === "Draft"
      ? statusRaw
      : existing?.status ?? "Draft";

  const title = "title" in input ? str(input.title, 120) : existing?.title ?? "";
  const typeRaw = "type" in input ? str(input.type, 40) : existing?.type ?? "Internship";
  const type: JobType = (JOB_TYPES as readonly string[]).includes(typeRaw) ? (typeRaw as JobType) : "Internship";
  const department = "department" in input ? str(input.department, 80) : existing?.department ?? "Engineering";
  const description = "description" in input ? str(input.description, 2500) : existing?.description ?? "";
  const responsibilities = "responsibilities" in input ? str(input.responsibilities, 2000) : existing?.responsibilities ?? "";
  const requiredSkills = "requiredSkills" in input ? stringList(input.requiredSkills, 20, 40) : existing?.requiredSkills ?? [];
  const preferredSkills = "preferredSkills" in input ? stringList(input.preferredSkills, 20, 40) : existing?.preferredSkills ?? [];
  const eligibility = "eligibility" in input ? str(input.eligibility, 500) : existing?.eligibility ?? "";
  const degreeRequirement = "degreeRequirement" in input ? str(input.degreeRequirement, 120) : existing?.degreeRequirement ?? "";
  const gradYearEligibility = "gradYearEligibility" in input ? str(input.gradYearEligibility, 60) : existing?.gradYearEligibility ?? "";
  const experienceRequirement = "experienceRequirement" in input ? str(input.experienceRequirement, 80) : existing?.experienceRequirement ?? "Fresher / 0–1 year";
  const location = "location" in input ? str(input.location, 120) : existing?.location ?? (comp.headquarters || "Remote");
  const modeRaw = "mode" in input ? str(input.mode, 20) : existing?.mode ?? "Hybrid";
  const mode: WorkMode = (WORK_MODES as readonly string[]).includes(modeRaw) ? (modeRaw as WorkMode) : "Hybrid";
  const salaryRange = "salaryRange" in input ? str(input.salaryRange, 80) : existing?.salaryRange ?? "";
  const currency = "currency" in input ? str(input.currency, 10) : existing?.currency ?? "INR";
  const deadline = "deadline" in input ? str(input.deadline, 30) : existing?.deadline ?? "";
  const openingsNum = "openings" in input ? Number(input.openings) : existing?.openings ?? 1;
  const openings = Number.isInteger(openingsNum) && openingsNum >= 1 && openingsNum <= 500 ? openingsNum : 1;
  const duration = "duration" in input ? str(input.duration, 80) : existing?.duration ?? "";
  const requireResume = "requireResume" in input ? input.requireResume !== false : existing?.requireResume ?? true;
  const requirePortfolio = "requirePortfolio" in input ? input.requirePortfolio === true : existing?.requirePortfolio ?? false;
  const applicationQuestions =
    "applicationQuestions" in input ? stringList(input.applicationQuestions, 10, 160) : existing?.applicationQuestions ?? [];
  const hiringContact = "hiringContact" in input ? str(input.hiringContact, 120) : existing?.hiringContact ?? "";

  const errors: Record<string, string> = {};
  const eTitle = validateRequired(title, "Job title", 120);
  if (eTitle) errors.title = eTitle;

  if (status === "Published") {
    const eDesc = validateRequired(description, "Job description", 2500);
    const eLoc = validateRequired(location, "Location", 120);
    const eDl = validateRequired(deadline, "Application deadline", 30);
    if (eDesc) errors.description = eDesc;
    if (eLoc) errors.location = eLoc;
    if (eDl) errors.deadline = eDl;
    else {
      const dlTime = new Date(deadline.includes("T") ? deadline : `${deadline}T23:59:59.000Z`).getTime();
      if (Number.isNaN(dlTime) || dlTime < Date.now()) {
        errors.deadline = "Application deadline must be a future date.";
      }
    }
    if (requiredSkills.length === 0) {
      errors.requiredSkills = "Add at least one required skill before publishing.";
    }
  }

  if (Object.keys(errors).length) fail(errors);

  const now = new Date().toISOString();
  return {
    id: existing?.id ?? uid(),
    companyId: comp.id,
    companyName: comp.name,
    title,
    type,
    department,
    description,
    responsibilities,
    requiredSkills,
    preferredSkills,
    eligibility,
    degreeRequirement,
    gradYearEligibility,
    experienceRequirement,
    location,
    mode,
    salaryRange,
    currency,
    deadline,
    openings,
    duration,
    requireResume,
    requirePortfolio,
    applicationQuestions,
    hiringContact,
    status,
    createdAt: existing?.createdAt ?? now,
    publishedAt: status === "Published" ? existing?.publishedAt ?? now : existing?.publishedAt,
    updatedAt: now,
  };
}

export async function createOrDuplicateJob(user: UserRecord, input: Record<string, unknown>): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    if (rec.role === "Interviewer") throw new ApiError(403, "Interviewers cannot create or modify job listings.");
    const comp = db.companies[rec.companyId];
    if (!comp) throw new ApiError(404, "Company not found.");

    if (typeof input.duplicateFromId === "string") {
      const source = db.jobs.find((j) => j.id === input.duplicateFromId && j.companyId === comp.id);
      if (!source) throw new ApiError(404, "Original job listing not found.");
      const now = new Date().toISOString();
      const copy: JobListing = {
        ...source,
        id: uid(),
        title: `${source.title} (Copy)`.slice(0, 120),
        status: "Draft",
        createdAt: now,
        publishedAt: undefined,
        updatedAt: now,
      };
      db.jobs.unshift(copy);
      db.activities.unshift({
        id: uid(),
        companyId: comp.id,
        text: `${rec.name} duplicated “${source.title}” as a draft.`,
        href: `/industry/jobs/${copy.id}`,
        createdAt: now,
      });
      return assembleWorkspace(user, db);
    }

    const job = sanitizeJobInput(input, comp);
    db.jobs.unshift(job);
    db.activities.unshift({
      id: uid(),
      companyId: comp.id,
      text: `${rec.name} ${job.status === "Published" ? "published" : "created draft"} “${job.title}”.`,
      href: `/industry/jobs/${job.id}`,
      createdAt: job.createdAt,
    });
    return assembleWorkspace(user, db);
  });
}

export async function updateJob(user: UserRecord, jobId: string, input: Record<string, unknown>): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    if (rec.role === "Interviewer") throw new ApiError(403, "Interviewers cannot modify job listings.");
    const comp = db.companies[rec.companyId];
    const idx = db.jobs.findIndex((j) => j.id === jobId && j.companyId === rec.companyId);
    if (idx === -1 || !comp) throw new ApiError(404, "Job listing not found.");
    const prev = db.jobs[idx];
    const updated = sanitizeJobInput(input, comp, prev);
    db.jobs[idx] = updated;
    if (prev.status !== updated.status) {
      db.activities.unshift({
        id: uid(),
        companyId: comp.id,
        text: `${rec.name} changed “${updated.title}” status to ${updated.status}.`,
        href: `/industry/jobs/${updated.id}`,
        createdAt: updated.updatedAt,
      });
    }
    return assembleWorkspace(user, db);
  });
}

export async function deleteJob(user: UserRecord, jobId: string): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec || rec.role === "Interviewer") throw new ApiError(403, "Not permitted to delete job listings.");
    const target = db.jobs.find((j) => j.id === jobId && j.companyId === rec.companyId);
    if (!target) throw new ApiError(404, "Job listing not found.");
    db.jobs = db.jobs.filter((j) => j.id !== jobId);
    db.activities.unshift({
      id: uid(),
      companyId: rec.companyId,
      text: `${rec.name} deleted listing “${target.title}”.`,
      href: "/industry/jobs",
      createdAt: new Date().toISOString(),
    });
    return assembleWorkspace(user, db);
  });
}

/* --------------------- Applicant Tracking (ATS) --------------------- */

export async function updateApplicants(user: UserRecord, body: Record<string, unknown>): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    const companyJobs = new Set(db.jobs.filter((j) => j.companyId === rec.companyId).map((j) => j.id));
    const now = new Date().toISOString();

    // Helper to locate or initialise AtsMetaRecord for a company-owned application
    const getOrCreateMeta = (appId: string) => {
      const existing = db.atsMeta[appId];
      if (existing) {
        if (!companyJobs.has(existing.jobId)) throw new ApiError(403, "Unauthorized access to applicant.");
        return existing;
      }
      for (const u of db.users) {
        const st = db.students[u.id];
        const app = st?.applications.find((a) => a.id === appId);
        if (app && companyJobs.has(app.opportunityId)) {
          const created = {
            applicationId: appId,
            jobId: app.opportunityId,
            candidateId: u.id,
            stage: app.status,
            notes: [],
            history: [{ stage: app.status, changedBy: u.name, changedAt: app.appliedAt }],
          };
          db.atsMeta[appId] = created;
          return created;
        }
      }
      throw new ApiError(404, "Application record not found for your company.");
    };

    // Option A: Add candidate to a job pipeline (e.g. inviting/shortlisting a candidate from Talent Discovery)
    if (typeof body.createForCandidateId === "string" && typeof body.jobId === "string") {
      const job = db.jobs.find((j) => j.id === body.jobId && j.companyId === rec.companyId);
      if (!job) throw new ApiError(404, "Select one of your company's job listings.");
      const candId = body.createForCandidateId;
      // Prevent duplicates for the same candidate + job
      const dupMeta = Object.values(db.atsMeta).find((m) => m.jobId === job.id && m.candidateId === candId);
      const st = db.students[candId];
      const dupSt = st?.applications.find((a) => a.opportunityId === job.id);
      if (dupMeta || dupSt) {
        throw new ApiError(409, "This candidate is already in the pipeline for that job.");
      }
      const appId = uid();
      const stage: AtsStage =
        typeof body.stage === "string" && (ATS_STAGES as readonly string[]).includes(body.stage)
          ? (body.stage as AtsStage)
          : "Shortlisted";
      if (st) {
        st.applications.unshift({ id: appId, opportunityId: job.id, appliedAt: now, status: stage });
      }
      db.atsMeta[appId] = {
        applicationId: appId,
        jobId: job.id,
        candidateId: candId,
        stage,
        notes: [],
        history: [{ stage, changedBy: rec.name, changedAt: now }],
      };
      db.activities.unshift({
        id: uid(),
        companyId: rec.companyId,
        text: `${rec.name} added a candidate to “${job.title}” (${stage}).`,
        href: `/industry/applicants?jobId=${job.id}`,
        createdAt: now,
      });
      return assembleWorkspace(user, db);
    }

    // Option B: Stage transition (single or bulk)
    const ids = Array.isArray(body.applicationIds)
      ? (body.applicationIds as unknown[]).filter((x): x is string => typeof x === "string")
      : typeof body.applicationId === "string"
        ? [body.applicationId]
        : [];

    if (ids.length === 0) throw new ApiError(400, "No application selected.");

    if (typeof body.stage === "string") {
      if (rec.role === "Interviewer") {
        throw new ApiError(403, "Interviewers can record notes and feedback, but cannot change pipeline stages.");
      }
      if (!(ATS_STAGES as readonly string[]).includes(body.stage)) {
        throw new ApiError(422, "Invalid hiring stage.");
      }
      const nextStage = body.stage as AtsStage;
      for (const id of ids) {
        const meta = getOrCreateMeta(id);
        meta.stage = nextStage;
        meta.history.push({ stage: nextStage, changedBy: rec.name, changedAt: now });
        // Sync back to student record if it's a real student
        const st = db.students[meta.candidateId];
        const stApp = st?.applications.find((a) => a.id === id);
        if (stApp) stApp.status = nextStage;
      }
      db.activities.unshift({
        id: uid(),
        companyId: rec.companyId,
        text: `${rec.name} moved ${ids.length} applicant${ids.length === 1 ? "" : "s"} to ${nextStage}.`,
        href: "/industry/applicants",
        createdAt: now,
      });
    }

    // Option C: Add internal evaluation note
    if (typeof body.note === "string" && body.note.trim()) {
      const meta = getOrCreateMeta(ids[0]);
      meta.notes.unshift({
        id: uid(),
        authorName: rec.name,
        content: str(body.note, 1000),
        createdAt: now,
      });
    }

    return assembleWorkspace(user, db);
  });
}

/* --------------------- Talent Saved Candidates --------------------- */

export async function toggleSavedCandidate(
  user: UserRecord,
  candidateId: unknown,
  saved: boolean,
): Promise<IndustryWorkspaceData> {
  if (typeof candidateId !== "string" || !candidateId) throw new ApiError(400, "Invalid candidate ID.");
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    rec.savedCandidateIds = saved
      ? Array.from(new Set([candidateId, ...rec.savedCandidateIds]))
      : rec.savedCandidateIds.filter((id) => id !== candidateId);
    return assembleWorkspace(user, db);
  });
}

/* --------------------- Candidate Messaging --------------------- */

export async function sendOrStartMessage(user: UserRecord, body: Record<string, unknown>): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    const text = str(body.body, 2000);
    const err = validateRequired(text, "Message", 2000);
    if (err) fail({ body: err });
    const now = new Date().toISOString();

    let thread = typeof body.conversationId === "string"
      ? db.conversations.find((c) => c.id === body.conversationId && c.companyId === rec.companyId)
      : undefined;

    if (!thread) {
      const candidateId = str(body.candidateId, 80);
      if (!candidateId) throw new ApiError(400, "Select a candidate to message.");
      const allCands = buildAllCandidates(db);
      const cand = allCands.find((c) => c.id === candidateId);
      if (!cand) throw new ApiError(404, "Candidate not found.");
      const job = typeof body.jobId === "string"
        ? db.jobs.find((j) => j.id === body.jobId && j.companyId === rec.companyId)
        : undefined;

      thread = db.conversations.find(
        (c) => c.companyId === rec.companyId && c.candidateId === cand.id && (c.jobId ?? "") === (job?.id ?? ""),
      );
      if (!thread) {
        thread = {
          id: uid(),
          companyId: rec.companyId,
          candidateId: cand.id,
          candidateName: cand.name,
          candidateHeadline: cand.headline,
          jobId: job?.id,
          jobTitle: job?.title,
          unreadByRecruiter: false,
          updatedAt: now,
          messages: [],
        };
        db.conversations.unshift(thread);
      }
    }

    thread.messages.push({
      id: uid(),
      senderRole: "recruiter",
      senderName: rec.name,
      body: text,
      sentAt: now,
    });
    thread.updatedAt = now;
    thread.unreadByRecruiter = false;

    return assembleWorkspace(user, db);
  });
}

export async function markConversationRead(user: UserRecord, conversationId: unknown): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    const thread = db.conversations.find((c) => c.id === conversationId && c.companyId === rec.companyId);
    if (thread) thread.unreadByRecruiter = false;
    return assembleWorkspace(user, db);
  });
}

/* --------------------- Interviews & Scheduling --------------------- */

export async function scheduleOrUpdateInterview(
  user: UserRecord,
  body: Record<string, unknown>,
): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    const now = new Date().toISOString();

    // Update existing interview (status change, reschedule, or structured feedback)
    if (typeof body.interviewId === "string") {
      const iv = db.interviews.find((x) => x.id === body.interviewId && x.companyId === rec.companyId);
      if (!iv) throw new ApiError(404, "Interview not found.");

      if (typeof body.status === "string" && (INTERVIEW_STATUSES as readonly string[]).includes(body.status)) {
        iv.status = body.status as InterviewStatus;
      }
      if (typeof body.scheduledAt === "string" && body.scheduledAt) {
        const t = new Date(body.scheduledAt).getTime();
        if (Number.isNaN(t)) fail({ scheduledAt: "Enter a valid date and time." });
        iv.scheduledAt = new Date(t).toISOString();
        iv.status = "Rescheduled";
      }
      if (typeof body.locationOrLink === "string") iv.locationOrLink = str(body.locationOrLink, 300);
      if (typeof body.notes === "string") iv.notes = str(body.notes, 800);

      if (body.feedback && typeof body.feedback === "object") {
        const f = body.feedback as Record<string, unknown>;
        const rating = Number(f.rating);
        const recVal = str(f.recommendation, 30);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          fail({ rating: "Select a rating between 1 and 5." });
        }
        const validRecs = ["Strong Hire", "Hire", "Hold", "No Hire"] as const;
        const recommendation: InterviewFeedback["recommendation"] = (validRecs as readonly string[]).includes(recVal)
          ? (recVal as InterviewFeedback["recommendation"])
          : "Hire";
        iv.feedback = {
          rating,
          recommendation,
          strengths: str(f.strengths, 800),
          concerns: str(f.concerns, 800),
          submittedBy: rec.name,
          submittedAt: now,
        };
        iv.status = "Completed";
      }
      return assembleWorkspace(user, db);
    }

    // Create new interview
    const candidateId = str(body.candidateId, 80);
    const jobId = str(body.jobId, 80);
    const scheduledRaw = str(body.scheduledAt, 40);
    const durationNum = Number(body.durationMinutes ?? 45);
    const durationMinutes = Number.isInteger(durationNum) && durationNum >= 15 && durationNum <= 240 ? durationNum : 45;
    const timezone = str(body.timezone, 50) || "IST (UTC+05:30)";
    const typeRaw = str(body.type, 20);
    const type: InterviewType = (INTERVIEW_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as InterviewType)
      : "Online";
    const locationOrLink = str(body.locationOrLink, 300);
    const interviewer = str(body.interviewer, 80) || rec.name;
    const round = str(body.round, 80) || "Technical Round 1";
    const notes = str(body.notes, 800);

    const errors: Record<string, string> = {};
    if (!candidateId) errors.candidateId = "Select a candidate.";
    if (!jobId) errors.jobId = "Select a job listing.";
    if (!scheduledRaw) errors.scheduledAt = "Select an interview date and time.";
    if (!locationOrLink) errors.locationOrLink = type === "Online" ? "Enter a meeting link." : "Enter location or phone details.";
    if (Object.keys(errors).length) fail(errors);

    const startMs = new Date(scheduledRaw).getTime();
    if (Number.isNaN(startMs)) fail({ scheduledAt: "Enter a valid date and time." });
    const endMs = startMs + durationMinutes * 60000;

    // Conflict check for the same interviewer or candidate on active interviews
    const conflict = db.interviews.find((existing) => {
      if (existing.companyId !== rec.companyId) return false;
      if (existing.status === "Cancelled" || existing.status === "Completed") return false;
      const exStart = new Date(existing.scheduledAt).getTime();
      const exEnd = exStart + existing.durationMinutes * 60000;
      const overlaps = startMs < exEnd && endMs > exStart;
      if (!overlaps) return false;
      return (
        existing.candidateId === candidateId ||
        existing.interviewer.toLowerCase() === interviewer.toLowerCase()
      );
    });
    if (conflict) {
      throw new ApiError(
        409,
        `Scheduling conflict with “${conflict.candidateName}” (${conflict.round}) for ${conflict.interviewer}.`,
        { scheduledAt: "This time overlaps with another scheduled interview." },
      );
    }

    const job = db.jobs.find((j) => j.id === jobId && j.companyId === rec.companyId);
    if (!job) throw new ApiError(404, "Job listing not found.");
    const cand = buildAllCandidates(db).find((c) => c.id === candidateId);
    if (!cand) throw new ApiError(404, "Candidate not found.");

    const applicationId = str(body.applicationId, 80) || uid();
    const record: InterviewRecord = {
      id: uid(),
      companyId: rec.companyId,
      applicationId,
      jobId: job.id,
      jobTitle: job.title,
      candidateId: cand.id,
      candidateName: cand.name,
      scheduledAt: new Date(startMs).toISOString(),
      durationMinutes,
      timezone,
      type,
      locationOrLink,
      interviewer,
      round,
      notes,
      status: "Scheduled",
      createdAt: now,
    };
    db.interviews.unshift(record);

    // Move corresponding ATS stage to Interview if present
    const meta = db.atsMeta[applicationId];
    if (meta) {
      meta.stage = "Interview";
      meta.history.push({ stage: "Interview", changedBy: rec.name, changedAt: now });
      const stApp = db.students[cand.id]?.applications.find((a) => a.id === applicationId);
      if (stApp) stApp.status = "Interview";
    }

    db.activities.unshift({
      id: uid(),
      companyId: rec.companyId,
      text: `${rec.name} scheduled ${round} with ${cand.name} for “${job.title}”.`,
      href: "/industry/interviews",
      createdAt: now,
    });

    return assembleWorkspace(user, db);
  });
}

/* --------------------- Campus Recruitment Events --------------------- */

export async function saveOrDeleteEvent(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    if (rec.role === "Interviewer") throw new ApiError(403, "Interviewers cannot manage campus events.");

    if (method === "DELETE") {
      const id = str(body.eventId, 80);
      db.events = db.events.filter((ev) => !(ev.id === id && ev.companyId === rec.companyId));
      return assembleWorkspace(user, db);
    }

    if (method === "PATCH" && typeof body.toggleParticipantId === "string" && typeof body.eventId === "string") {
      const ev = db.events.find((x) => x.id === body.eventId && x.companyId === rec.companyId);
      if (!ev) throw new ApiError(404, "Event not found.");
      const p = ev.participants.find((x) => x.id === body.toggleParticipantId);
      if (p) p.attended = !p.attended;
      return assembleWorkspace(user, db);
    }

    const existing = typeof body.id === "string"
      ? db.events.find((x) => x.id === body.id && x.companyId === rec.companyId)
      : undefined;

    const title = str(body.title, 120);
    const institution = str(body.institution, 120);
    const date = str(body.date, 20);
    const time = str(body.time, 20) || "10:00";
    const venueOrLink = str(body.venueOrLink, 300);
    const typeRaw = str(body.type, 50);
    const type: EventType = (EVENT_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as EventType)
      : "Campus Recruitment Drive";
    const modeRaw = str(body.mode, 20);
    const mode: WorkMode = (WORK_MODES as readonly string[]).includes(modeRaw) ? (modeRaw as WorkMode) : "On-site";
    const statusRaw = str(body.status, 20);
    const status: EventStatus = (EVENT_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as EventStatus)
      : "Upcoming";
    const capNum = Number(body.capacity ?? 100);
    const capacity = Number.isInteger(capNum) && capNum >= 5 && capNum <= 5000 ? capNum : 100;
    const linkedJobIds = stringList(body.linkedJobIds, 10, 80);
    const description = str(body.description, 1000);
    const requestApproval = body.requestApproval === true;

    const errors: Record<string, string> = {};
    const e1 = validateRequired(title, "Event title", 120);
    const e2 = validateRequired(institution, "Target college or venue", 120);
    const e3 = validateRequired(date, "Event date", 20);
    const e4 = validateRequired(venueOrLink, "Venue or meeting link", 300);
    if (e1) errors.title = e1;
    if (e2) errors.institution = e2;
    if (e3) errors.date = e3;
    if (e4) errors.venueOrLink = e4;
    if (Object.keys(errors).length) fail(errors);

    const now = new Date().toISOString();
    const record: CampusEvent = {
      id: existing?.id ?? uid(),
      companyId: rec.companyId,
      title,
      type,
      institution,
      date,
      time,
      mode,
      venueOrLink,
      capacity,
      status,
      // Never falsely claim college approval unless the Academia portal approves it
      institutionApproval: requestApproval
        ? "Pending institution approval"
        : existing?.institutionApproval ?? "Not requested",
      linkedJobIds,
      description,
      participants: existing?.participants ?? [],
      createdAt: existing?.createdAt ?? now,
    };

    if (existing) {
      const idx = db.events.findIndex((x) => x.id === existing.id);
      db.events[idx] = record;
    } else {
      db.events.unshift(record);
      db.activities.unshift({
        id: uid(),
        companyId: rec.companyId,
        text: `${rec.name} scheduled campus event “${title}” (${institution}).`,
        href: "/industry/events",
        createdAt: now,
      });
    }
    return assembleWorkspace(user, db);
  });
}

/* --------------------- Team Members & RBAC --------------------- */

export async function manageTeamMember(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<IndustryWorkspaceData> {
  return mutateDb((db) => {
    const rec = db.recruiters[user.id];
    if (!rec) throw new ApiError(403, "Recruiter access required.");
    if (rec.role !== "Company Admin") {
      throw new ApiError(403, "Only Company Admins can invite or modify team members.");
    }

    if (method === "POST") {
      const name = str(body.name, 80);
      const email = str(body.email, 254).toLowerCase();
      const jobTitle = str(body.jobTitle, 80);
      const roleRaw = str(body.role, 30);
      const role: TeamRole = (TEAM_ROLES as readonly string[]).includes(roleRaw) ? (roleRaw as TeamRole) : "Recruiter";

      const errors: Record<string, string> = {};
      const e1 = validateRequired(name, "Full name", 80);
      const e2 = validateEmail(email);
      const e3 = validateRequired(jobTitle, "Job title", 80);
      if (e1) errors.name = e1;
      if (e2) errors.email = e2;
      if (e3) errors.jobTitle = e3;
      if (db.team.some((t) => t.companyId === rec.companyId && t.email === email)) {
        errors.email = "This team member is already in your workspace.";
      }
      if (Object.keys(errors).length) fail(errors);

      const now = new Date().toISOString();
      db.team.push({
        id: uid(),
        companyId: rec.companyId,
        name,
        email,
        jobTitle,
        role,
        status: "Invited (Demo — email not sent)",
        joinedAt: now,
      });
      db.activities.unshift({
        id: uid(),
        companyId: rec.companyId,
        text: `${rec.name} added ${name} (${role}) to the hiring team.`,
        href: "/industry/team",
        createdAt: now,
      });
      return assembleWorkspace(user, db);
    }

    const memberId = str(body.memberId, 80);
    const member = db.team.find((t) => t.id === memberId && t.companyId === rec.companyId);
    if (!member) throw new ApiError(404, "Team member not found.");
    if (member.isOwner) throw new ApiError(400, "The workspace owner cannot be deactivated or removed.");

    if (method === "DELETE") {
      db.team = db.team.filter((t) => t.id !== member.id);
      return assembleWorkspace(user, db);
    }

    if (typeof body.role === "string" && (TEAM_ROLES as readonly string[]).includes(body.role)) {
      member.role = body.role as TeamRole;
    }
    if (typeof body.status === "string" && (body.status === "Active" || body.status === "Deactivated")) {
      member.status = body.status;
    }
    return assembleWorkspace(user, db);
  });
}
