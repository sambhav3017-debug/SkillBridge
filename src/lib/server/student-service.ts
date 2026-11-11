import crypto from "crypto";
import { cache } from "react";
import { ApiError } from "./http";
import { mutateDb, readDb, type DB, type StudentRecord, type UserRecord } from "./db";
import { addSession, getSessionUser, hashPassword, verifyPassword, clearThrottle, throttle } from "./auth";
import { getAllStudentOpportunities } from "./opportunities";
import {
  EMPTY_PROFILE,
  OPP_TYPES,
  PROFICIENCY,
  WORK_MODES,
  type Certification,
  type Preferences,
  type Profile,
  type Project,
  type Skill,
  type StudentData,
  type StudentTask,
  type TaskPriority,
  type TaskType,
  type ReminderSetting,
  TASK_TYPES,
  TASK_PRIORITIES,
  REMINDER_SETTINGS,
} from "@/lib/student/types";
import {
  validateEmail,
  validateGradYear,
  validatePassword,
  validatePastDate,
  validateRequired,
  validateUrl,
} from "@/lib/student/validation";

const uid = () => crypto.randomUUID();

export function toStudentData(user: UserRecord, rec: StudentRecord, db?: DB): StudentData {
  const applications = (rec.applications ?? []).map((a) => {
    const meta = db?.atsMeta?.[a.id];
    return meta ? { ...a, status: meta.stage } : a;
  });
  const interviews = db?.interviews
    ? db.interviews
        .filter((iv) => iv.candidateId === user.id)
        .map((iv) => ({
          id: iv.id,
          jobTitle: iv.jobTitle,
          companyName: db.companies[iv.companyId]?.name ?? "Company",
          scheduledAt: iv.scheduledAt,
          durationMinutes: iv.durationMinutes,
          timezone: iv.timezone,
          type: iv.type,
          locationOrLink: iv.locationOrLink,
          round: iv.round,
          status: iv.status,
        }))
    : [];
  return {
    user: { id: user.id, email: user.email, name: user.name },
    profile: rec.profile,
    skills: rec.skills ?? [],
    certifications: rec.certifications ?? [],
    projects: rec.projects ?? [],
    saved: rec.saved ?? [],
    applications,
    resume: rec.resume ?? null,
    interviews,
    codingAccounts: rec.codingAccounts ? Object.values(rec.codingAccounts) : [],
    codingActivities: rec.codingActivities ?? [],
    codingStats: rec.codingStats,
    tasks: rec.tasks ?? [],
    learning: rec.learning ?? {},
    personalizedPath: rec.personalizedPath,
  };
}

/** Server-side lookup of the logged-in student (null if logged out). Cached per request. */
export const getCurrentStudent = cache(async (): Promise<StudentData | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const db = await readDb();
  const rec = db.students[user.id];
  return rec ? toStudentData(user, rec, db) : null;
});

/* ----------------------------- sanitizers ----------------------------- */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function fail(fieldErrors: Record<string, string>): never {
  const first = Object.values(fieldErrors)[0];
  throw new ApiError(422, first, fieldErrors);
}

function stringList(v: unknown, maxItems = 20, maxLen = 40): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const t = str(item, maxLen);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, maxItems);
}

function sanitizePreferences(v: unknown): Preferences {
  const p = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    types: (Array.isArray(p.types) ? p.types : []).filter((t): t is Preferences["types"][number] =>
      (OPP_TYPES as readonly string[]).includes(t as string),
    ),
    modes: (Array.isArray(p.modes) ? p.modes : []).filter((t): t is Preferences["modes"][number] =>
      (WORK_MODES as readonly string[]).includes(t as string),
    ),
    roles: stringList(p.roles),
    areas: stringList(p.areas),
  };
}

function sanitizeProfilePatch(input: Record<string, unknown>, current: Profile): Profile {
  const next: Profile = { ...current };
  const textKeys = { headline: 120, bio: 500, college: 120, degree: 80, branch: 80, year: 40 } as const;
  for (const [k, max] of Object.entries(textKeys)) {
    if (k in input) next[k as keyof typeof textKeys] = str(input[k], max);
  }
  const errors: Record<string, string> = {};
  for (const k of ["linkedin", "github", "portfolio"] as const) {
    if (k in input) {
      const v = str(input[k], 300);
      const err = validateUrl(v, k === "linkedin" ? "LinkedIn URL" : k === "github" ? "GitHub URL" : "Portfolio URL");
      if (err) errors[k] = err;
      next[k] = v;
    }
  }
  if ("gradYear" in input) {
    const v = str(input.gradYear, 4);
    const err = validateGradYear(v);
    if (err) errors.gradYear = err;
    next.gradYear = v;
  }
  if ("avatar" in input) {
    const a = typeof input.avatar === "string" ? input.avatar.trim() : "";
    const isDataUri =
      /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(a) && a.length <= 4_500_000;
    const isUrl = (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/")) && a.length <= 2000;
    if (a && !isDataUri && !isUrl) {
      errors.avatar = "Profile photo must be a valid image URL or a high-quality PNG, JPEG or WebP image (max 4.5 MB).";
    }
    next.avatar = a;
  }
  if ("preferences" in input) next.preferences = sanitizePreferences(input.preferences);
  if ("onboarded" in input) next.onboarded = input.onboarded === true;
  if (Object.keys(errors).length) fail(errors);
  return next;
}

function sanitizeSkills(v: unknown): Skill[] {
  if (!Array.isArray(v)) throw new ApiError(422, "Skills must be a list.");
  const out: Skill[] = [];
  for (const raw of v.slice(0, 60)) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const name = str(r.name, 40);
    if (!name) throw new ApiError(422, "Each skill needs a name.");
    if (!(PROFICIENCY as readonly string[]).includes(r.level as string)) throw new ApiError(422, `Choose a level for ${name}.`);
    if (out.some((s) => s.name.toLowerCase() === name.toLowerCase())) throw new ApiError(422, `"${name}" is already in your skills.`);
    out.push({ id: str(r.id, 60) || uid(), name, level: r.level as Skill["level"] });
  }
  return out;
}

function sanitizeCerts(v: unknown): Certification[] {
  if (!Array.isArray(v)) throw new ApiError(422, "Certifications must be a list.");
  return v.slice(0, 40).map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const c: Certification = {
      id: str(r.id, 60) || uid(),
      title: str(r.title, 120),
      issuer: str(r.issuer, 120),
      issueDate: str(r.issueDate, 10),
      credentialUrl: str(r.credentialUrl, 300) || undefined,
    };
    const errors: Record<string, string> = {};
    const e1 = validateRequired(c.title, "Certification title");
    const e2 = validateRequired(c.issuer, "Issuing organization");
    const e3 = validatePastDate(c.issueDate, "Issue date");
    const e4 = validateUrl(c.credentialUrl ?? "", "Credential URL");
    if (e1) errors.title = e1;
    if (e2) errors.issuer = e2;
    if (e3) errors.issueDate = e3;
    if (e4) errors.credentialUrl = e4;
    if (Object.keys(errors).length) fail(errors);
    return c;
  });
}

function sanitizeProjects(v: unknown): Project[] {
  if (!Array.isArray(v)) throw new ApiError(422, "Projects must be a list.");
  return v.slice(0, 40).map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const p: Project = {
      id: str(r.id, 60) || uid(),
      title: str(r.title, 100),
      description: str(r.description, 1000),
      technologies: stringList(r.technologies, 15, 30),
      url: str(r.url, 300) || undefined,
    };
    const errors: Record<string, string> = {};
    const e1 = validateRequired(p.title, "Project title", 100);
    const e2 = validateRequired(p.description, "Description", 1000);
    const e3 = validateUrl(p.url ?? "", "Project URL");
    if (e1) errors.title = e1;
    if (e2) errors.description = e2;
    if (e3) errors.url = e3;
    if (Object.keys(errors).length) fail(errors);
    return p;
  });
}

/* ------------------------------ operations ------------------------------ */

export async function signup(input: Record<string, unknown>) {
  const name = str(input.name, 80);
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const college = str(input.college, 120);
  const errors: Record<string, string> = {};
  const checks: [string, string | null][] = [
    ["name", validateRequired(name, "Full name", 80)],
    ["email", validateEmail(email)],
    ["password", validatePassword(password)],
    ["college", validateRequired(college, "College or university", 120)],
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
    const user: UserRecord = { id: uid(), email, name, passwordHash, role: "student", createdAt: new Date().toISOString() };
    db.users.push(user);
    db.students[user.id] = {
      profile: { ...EMPTY_PROFILE, college },
      skills: [],
      certifications: [],
      projects: [],
      saved: [],
      applications: [],
      resume: null,
      tasks: [],
    };
    return { token: addSession(db, user.id), onboarded: false };
  });
}

export async function login(input: Record<string, unknown>) {
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const errors: Record<string, string> = {};
  const e1 = validateEmail(email);
  if (e1) errors.email = e1;
  if (!password) errors.password = "Password is required.";
  if (Object.keys(errors).length) fail(errors);
  throttle(email);

  const db0 = await readDb();
  const user = db0.users.find((u) => u.email === email && (u.role ?? "student") === "student");
  // Same message whether the email or password is wrong (no account enumeration).
  const bad = new ApiError(401, "Incorrect email or password.");
  if (!user) {
    hashPassword(password); // equalise timing
    throw bad;
  }
  if (!verifyPassword(password, user.passwordHash)) throw bad;
  clearThrottle(email);
  return mutateDb((db) => ({
    token: addSession(db, user.id),
    onboarded: db.students[user.id]?.profile.onboarded ?? false,
  }));
}

export async function updateStudent(user: UserRecord, body: Record<string, unknown>): Promise<StudentData> {
  return mutateDb((db) => {
    const rec = db.students[user.id];
    const u = db.users.find((x) => x.id === user.id);
    if (!rec || !u) throw new ApiError(404, "Student account not found.");
    if (body.account && typeof body.account === "object") {
      const a = body.account as Record<string, unknown>;
      const name = str(a.name, 80);
      const email = str(a.email, 254).toLowerCase();
      const errors: Record<string, string> = {};
      const e1 = validateRequired(name, "Full name", 80);
      const e2 = validateEmail(email);
      if (e1) errors.name = e1;
      if (e2) errors.email = e2;
      if (!e2 && db.users.some((x) => x.id !== u.id && x.email === email)) errors.email = "That email is already in use.";
      if (Object.keys(errors).length) fail(errors);
      u.name = name;
      u.email = email;
    }
    if (body.profile && typeof body.profile === "object") {
      rec.profile = sanitizeProfilePatch(body.profile as Record<string, unknown>, rec.profile);
    }
    if ("skills" in body) rec.skills = sanitizeSkills(body.skills);
    if ("certifications" in body) rec.certifications = sanitizeCerts(body.certifications);
    if ("projects" in body) rec.projects = sanitizeProjects(body.projects);
    return toStudentData(u, rec, db);
  });
}

async function findOpportunity(id: unknown) {
  if (typeof id !== "string") throw new ApiError(404, "That opportunity could not be found.");
  const all = await getAllStudentOpportunities([id]);
  const opp = all.find((o) => o.id === id);
  if (!opp) throw new ApiError(404, "That opportunity could not be found.");
  return opp;
}

export async function setSaved(user: UserRecord, opportunityId: unknown, saved: boolean) {
  const opp = await findOpportunity(opportunityId);
  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.saved = rec.saved ?? [];
    rec.saved = saved ? Array.from(new Set([opp.id, ...rec.saved])) : rec.saved.filter((s) => s !== opp.id);
    return toStudentData(user, rec, db);
  });
}

export async function applyTo(user: UserRecord, opportunityId: unknown) {
  const opp = await findOpportunity(opportunityId);
  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.applications = rec.applications ?? [];
    if (rec.applications.some((a) => a.opportunityId === opp.id)) {
      throw new ApiError(409, "You have already applied to this opportunity.");
    }
    // Check that company job is still Published
    const companyJob = db.jobs.find((j) => j.id === opp.id);
    if (companyJob && companyJob.status !== "Published") {
      throw new ApiError(410, "This opportunity is no longer accepting applications.");
    }
    if (new Date(opp.deadline).getTime() < Date.now()) {
      throw new ApiError(410, "The deadline for this opportunity has passed.");
    }
    const appId = uid();
    const nowIso = new Date().toISOString();
    rec.applications.unshift({ id: appId, opportunityId: opp.id, appliedAt: nowIso, status: "Applied" });
    if (companyJob) {
      db.atsMeta[appId] = {
        applicationId: appId,
        jobId: companyJob.id,
        candidateId: user.id,
        stage: "Applied",
        notes: [],
        history: [{ stage: "Applied", changedBy: user.name, changedAt: nowIso }],
      };
      db.activities.unshift({
        id: uid(),
        companyId: companyJob.companyId,
        text: `${user.name} applied for ${companyJob.title}.`,
        href: `/industry/applicants?jobId=${companyJob.id}`,
        createdAt: nowIso,
      });
    }
    return toStudentData(user, rec, db);
  });
}

export async function withdraw(user: UserRecord, applicationId: unknown) {
  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.applications = rec.applications ?? [];
    const app = rec.applications.find((a) => a.id === applicationId);
    if (!app) throw new ApiError(404, "Application not found.");
    const currentStage = db.atsMeta[app.id]?.stage ?? app.status;
    if (currentStage !== "Applied") {
      throw new ApiError(409, "This application is already being reviewed and can no longer be withdrawn.");
    }
    rec.applications = rec.applications.filter((a) => a.id !== app.id);
    delete db.atsMeta[app.id];
    return toStudentData(user, rec, db);
  });
}

export async function changePassword(user: UserRecord, body: Record<string, unknown>) {
  const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const next = typeof body.newPassword === "string" ? body.newPassword : "";
  const errors: Record<string, string> = {};
  if (!current) errors.currentPassword = "Enter your current password.";
  const e = validatePassword(next);
  if (e) errors.newPassword = e;
  if (body.confirmPassword !== next) errors.confirmPassword = "Passwords do not match.";
  if (Object.keys(errors).length) fail(errors);
  throttle("pw:" + user.id, 5);
  await mutateDb((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (!u || !verifyPassword(current, u.passwordHash)) {
      throw new ApiError(422, "Your current password is incorrect.", { currentPassword: "Your current password is incorrect." });
    }
    u.passwordHash = hashPassword(next);
  });
  return { changed: true };
}

/* -------------------------- task management -------------------------- */

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeTaskInput(body: Record<string, unknown>, isUpdate = false) {
  const errors: Record<string, string> = {};

  const titleRaw = str(body.title, 120);
  if (!isUpdate || "title" in body) {
    const e = validateRequired(titleRaw, "Task title", 120);
    if (e) errors.title = e;
  }

  const dateRaw = str(body.date, 20);
  if (!isUpdate || "date" in body) {
    if (!dateRaw) {
      errors.date = "Task date is required.";
    } else if (!DATE_REGEX.test(dateRaw) || Number.isNaN(new Date(dateRaw).getTime())) {
      errors.date = "Enter a valid date in YYYY-MM-DD format.";
    }
  }

  const typeRaw = str(body.type, 40) as TaskType;
  if (!isUpdate || "type" in body) {
    if (!typeRaw || !(TASK_TYPES as readonly string[]).includes(typeRaw)) {
      errors.type = "Select a valid task type.";
    }
  }

  const priorityRaw = str(body.priority, 20) as TaskPriority;
  if (!isUpdate || "priority" in body) {
    if (!priorityRaw || !(TASK_PRIORITIES as readonly string[]).includes(priorityRaw)) {
      errors.priority = "Select a valid priority level.";
    }
  }

  const startTimeRaw = str(body.startTime, 10);
  if (startTimeRaw && !TIME_REGEX.test(startTimeRaw)) {
    errors.startTime = "Enter a valid start time (HH:mm).";
  }

  const dueTimeRaw = str(body.dueTime, 10);
  if (dueTimeRaw && !TIME_REGEX.test(dueTimeRaw)) {
    errors.dueTime = "Enter a valid due time (HH:mm).";
  }

  if (startTimeRaw && dueTimeRaw && TIME_REGEX.test(startTimeRaw) && TIME_REGEX.test(dueTimeRaw)) {
    if (dueTimeRaw < startTimeRaw) {
      errors.dueTime = "Due time cannot be earlier than start time.";
    }
  }

  const reminderRaw = (str(body.reminder, 20) || "none") as ReminderSetting;
  if (reminderRaw && !(REMINDER_SETTINGS as readonly string[]).includes(reminderRaw)) {
    errors.reminder = "Select a valid reminder notification setting.";
  }

  if (Object.keys(errors).length > 0) fail(errors);

  return {
    title: titleRaw,
    description: str(body.description, 1000) || undefined,
    date: dateRaw,
    startTime: startTimeRaw || undefined,
    dueTime: dueTimeRaw || undefined,
    type: typeRaw,
    priority: priorityRaw,
    reminder: reminderRaw || "none",
  };
}

export async function getStudentTasks(user: UserRecord): Promise<StudentTask[]> {
  const db = await readDb();
  const rec = db.students[user.id];
  if (!rec) throw new ApiError(404, "Student account not found.");
  return rec.tasks ?? [];
}

export async function createStudentTask(
  user: UserRecord,
  body: Record<string, unknown>,
): Promise<{ task: StudentTask; student: StudentData }> {
  const sanitized = sanitizeTaskInput(body, false);
  const now = new Date().toISOString();
  const newTask: StudentTask = {
    id: uid(),
    title: sanitized.title,
    description: sanitized.description,
    date: sanitized.date,
    startTime: sanitized.startTime,
    dueTime: sanitized.dueTime,
    type: sanitized.type,
    priority: sanitized.priority,
    reminder: sanitized.reminder,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.tasks = rec.tasks ?? [];
    rec.tasks.unshift(newTask);
    return {
      task: newTask,
      student: toStudentData(user, rec, db),
    };
  });
}

export async function updateStudentTask(
  user: UserRecord,
  taskId: string,
  body: Record<string, unknown>,
): Promise<{ task: StudentTask; student: StudentData }> {
  if (!taskId) throw new ApiError(400, "Task ID is required.");
  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.tasks = rec.tasks ?? [];
    const idx = rec.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new ApiError(404, "Task not found.");

    const existing = rec.tasks[idx];
    const now = new Date().toISOString();

    // Handle completed toggle separately if present
    let completed = existing.completed;
    let completedAt = existing.completedAt;
    if ("completed" in body) {
      completed = Boolean(body.completed);
      completedAt = completed ? now : undefined;
    }

    // If other fields are provided, sanitize them
    const hasCoreFields = ["title", "date", "type", "priority"].some((k) => k in body);
    if (hasCoreFields) {
      const sanitized = sanitizeTaskInput({
        title: body.title ?? existing.title,
        date: body.date ?? existing.date,
        type: body.type ?? existing.type,
        priority: body.priority ?? existing.priority,
        description: "description" in body ? body.description : existing.description,
        startTime: "startTime" in body ? body.startTime : existing.startTime,
        dueTime: "dueTime" in body ? body.dueTime : existing.dueTime,
        reminder: "reminder" in body ? body.reminder : existing.reminder,
      });

      const updated: StudentTask = {
        ...existing,
        ...sanitized,
        completed,
        completedAt,
        updatedAt: now,
      };
      rec.tasks[idx] = updated;
      return { task: updated, student: toStudentData(user, rec, db) };
    }

    const updated: StudentTask = {
      ...existing,
      completed,
      completedAt,
      updatedAt: now,
    };
    rec.tasks[idx] = updated;
    return { task: updated, student: toStudentData(user, rec, db) };
  });
}

export async function deleteStudentTask(
  user: UserRecord,
  taskId: string,
): Promise<{ deletedId: string; student: StudentData }> {
  if (!taskId) throw new ApiError(400, "Task ID is required.");
  return mutateDb((db) => {
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    rec.tasks = rec.tasks ?? [];
    const idx = rec.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new ApiError(404, "Task not found.");

    rec.tasks.splice(idx, 1);
    return {
      deletedId: taskId,
      student: toStudentData(user, rec, db),
    };
  });
}
