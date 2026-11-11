import crypto from "crypto";
import { cache } from "react";
import { ApiError } from "./http";
import { mutateDb, readDb, type DB, type UserRecord } from "./db";
import {
  addSession,
  clearThrottle,
  getAcademiaSessionUser,
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
  ACADEMIA_EVENT_STATUSES,
  ACADEMIA_EVENT_TYPES,
  ACADEMIA_ROLES,
  ACADEMIC_OPP_CATEGORIES,
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_PRIORITIES,
  DRIVE_STATUSES,
  INSTITUTION_TYPES,
  PARTNERSHIP_STATUSES,
  PLACEMENT_STATUSES,
  type AcademiaEvent,
  type AcademiaEventStatus,
  type AcademiaEventType,
  type AcademiaRole,
  type AcademiaWorkspaceData,
  type AcademicOppCategory,
  type AcademicOpportunity,
  type AnnouncementAudience,
  type AnnouncementPriority,
  type DepartmentRecord,
  type DriveStatus,
  type FacultyRecord,
  type IndustryPartnership,
  type InstitutionAnnouncement,
  type InstitutionStudentRecord,
  type InstitutionType,
  type PartnershipStatus,
  type PlacementDrive,
  type PlacementStatus,
} from "@/lib/academia/types";

const uid = () => crypto.randomUUID();
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function fail(fieldErrors: Record<string, string>): never {
  const first = Object.values(fieldErrors)[0];
  throw new ApiError(422, first, fieldErrors);
}

function stringList(v: unknown, maxItems = 25, maxLen = 60): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const t = str(item, maxLen);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, maxItems);
}

function assertCanWrite(role: AcademiaRole, allowedRoles?: readonly AcademiaRole[]) {
  if (role === "Read-Only Analyst") {
    throw new ApiError(403, "Read-Only Analysts cannot modify institutional records.");
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ApiError(403, `Your role (${role}) is not permitted to perform this action.`);
  }
}

function recordAudit(db: DB, institutionId: string, actorName: string, actorRole: AcademiaRole, action: string, href: string) {
  db.academiaAudit.unshift({
    id: uid(),
    institutionId,
    actorName,
    actorRole,
    action,
    href,
    createdAt: new Date().toISOString(),
  });
}

function computeStudentCompletion(st: DB["students"][string]): number {
  let pts = 0;
  if (st.profile.college && st.profile.degree) pts += 25;
  if (st.profile.bio) pts += 15;
  if (st.skills.length > 0) pts += 25;
  if (st.projects.length > 0) pts += 20;
  if (st.certifications.length > 0 || st.resume) pts += 15;
  return Math.min(100, pts);
}

export function assembleAcademiaWorkspace(user: UserRecord, db: DB): AcademiaWorkspaceData {
  const staff = db.academiaStaff[user.id];
  if (!staff) throw new ApiError(404, "Institution staff profile not found.");
  const institution = db.institutions[staff.institutionId];
  if (!institution) throw new ApiError(404, "Institution profile not found.");

  const instId = institution.id;
  const instNameLower = institution.name.trim().toLowerCase();

  // Merge stored institution student roster with real registered Student Portal accounts belonging to this institution
  const roster = db.academiaStudents
    .filter((s) => s.institutionId === instId)
    .map((s) => ({ ...s }));
  const byEmail = new Map(roster.map((r) => [r.email.toLowerCase(), r]));

  for (const u of db.users) {
    if ((u.role ?? "student") !== "student") continue;
    const st = db.students[u.id];
    if (!st) continue;
    const collegeLower = (st.profile.college ?? "").trim().toLowerCase();
    const existingRoster = byEmail.get(u.email.toLowerCase());
    const matchesCollege =
      instNameLower.length >= 3 &&
      collegeLower.length >= 3 &&
      (collegeLower.includes(instNameLower) || instNameLower.includes(collegeLower));

    if (!existingRoster && !matchesCollege) continue;

    // Inspect student's applications & ATS stages
    const stages = st.applications.map((a) => db.atsMeta[a.id]?.stage ?? a.status);
    const hiredOrOffer = stages.includes("Hired") || stages.includes("Offer");
    const inProcess = stages.some((s) => ["Applied", "Under Review", "Shortlisted", "Interview"].includes(s));

    const derivedStatus: PlacementStatus = hiredOrOffer
      ? "Placed"
      : inProcess
        ? "In Process"
        : existingRoster?.placementStatus ?? "Eligible";

    const completion = computeStudentCompletion(st);

    if (existingRoster) {
      existingRoster.linkedUserId = u.id;
      existingRoster.name = u.name || existingRoster.name;
      existingRoster.department = st.profile.branch || existingRoster.department;
      existingRoster.program = st.profile.degree || existingRoster.program;
      existingRoster.year = st.profile.year || existingRoster.year;
      existingRoster.gradYear = st.profile.gradYear || existingRoster.gradYear;
      existingRoster.invitationStatus = "Registered on SkillBridge";
      existingRoster.skills = st.skills;
      existingRoster.projects = st.projects;
      existingRoster.certifications = st.certifications;
      existingRoster.profileCompletion = completion;
      existingRoster.applicationsCount = st.applications.length;
      existingRoster.latestStage = stages[0];
      if (hiredOrOffer && existingRoster.placementStatus === "Eligible") {
        existingRoster.placementStatus = "Placed";
      }
    } else {
      roster.unshift({
        id: `linked-${u.id}`,
        institutionId: instId,
        studentIdCode: `SB-${u.id.slice(0, 6).toUpperCase()}`,
        linkedUserId: u.id,
        name: u.name,
        email: u.email,
        department: st.profile.branch || "Computer Science",
        program: st.profile.degree || "B.Tech / B.E.",
        year: st.profile.year || "Final Year",
        gradYear: st.profile.gradYear || "2027",
        placementEligible: true,
        placementStatus: derivedStatus,
        invitationStatus: "Registered on SkillBridge",
        skills: st.skills,
        projects: st.projects,
        certifications: st.certifications,
        profileCompletion: completion,
        applicationsCount: st.applications.length,
        latestStage: stages[0],
        createdAt: u.createdAt,
      });
    }
  }

  // Count real student applications to academic opportunities
  const oppAppCounts = new Map<string, number>();
  for (const st of Object.values(db.students)) {
    for (const app of st.applications) {
      oppAppCounts.set(app.opportunityId, (oppAppCounts.get(app.opportunityId) ?? 0) + 1);
    }
  }

  const academicOpportunities = db.academicOpportunities
    .filter((o) => o.institutionId === instId)
    .map((o) => ({
      ...o,
      applicantCount: Math.max(o.applicantCount, oppAppCounts.get(o.id) ?? 0),
    }));

  // Industry campus events targeting this institution or open
  const industryCampusEvents = db.events.filter((ev) => {
    const targetLower = ev.institution.trim().toLowerCase();
    return (
      !targetLower ||
      targetLower.includes(instNameLower) ||
      instNameLower.includes(targetLower) ||
      ev.institutionApproval === "Pending institution approval"
    );
  });

  return {
    staff,
    institution,
    departments: db.academiaDepartments.filter((d) => d.institutionId === instId),
    faculty: db.academiaFaculty.filter((f) => f.institutionId === instId),
    students: roster,
    drives: db.placementDrives.filter((d) => d.institutionId === instId),
    partnerships: db.industryPartnerships.filter((p) => p.institutionId === instId),
    academicOpportunities,
    events: db.academiaEvents.filter((e) => e.institutionId === instId),
    announcements: db.academiaAnnouncements.filter((a) => a.institutionId === instId),
    team: db.academiaTeam.filter((t) => t.institutionId === instId),
    auditLog: db.academiaAudit.filter((a) => a.institutionId === instId).slice(0, 40),
    industryJobs: db.jobs.filter((j) => j.status === "Published"),
    sharedJobEndorsements: db.sharedJobEndorsements.filter((s) => s.institutionId === instId),
    industryCampusEvents,
    industryCompanies: Object.values(db.companies),
  };
}

export const getCurrentAcademia = cache(async (): Promise<AcademiaWorkspaceData | null> => {
  const user = await getAcademiaSessionUser();
  if (!user) return null;
  const db = await readDb();
  if (!db.academiaStaff[user.id]) return null;
  return assembleAcademiaWorkspace(user, db);
});

/* ------------------------------ Auth ------------------------------ */

export async function registerAcademia(input: Record<string, unknown>) {
  const institutionName = str(input.institutionName, 140);
  const typeRaw = str(input.type, 60);
  const type: InstitutionType = (INSTITUTION_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as InstitutionType)
    : "University";
  const website = str(input.website, 300);
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const repName = str(input.repName, 80);
  const designation = str(input.designation, 80);
  const city = str(input.city, 80);
  const state = str(input.state, 80);

  const errors: Record<string, string> = {};
  const checks: [string, string | null][] = [
    ["institutionName", validateRequired(institutionName, "Official institution name", 140)],
    ["website", validateUrl(website, "Official website", true)],
    ["email", validateEmail(email)],
    ["password", validatePassword(password)],
    ["repName", validateRequired(repName, "Authorized representative name", 80)],
    ["designation", validateRequired(designation, "Designation / role", 80)],
    ["city", validateRequired(city, "City", 80)],
    ["state", validateRequired(state, "State", 80)],
  ];
  for (const [k, e] of checks) if (e) errors[k] = e;
  if (input.confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  if (input.acceptTerms !== true) errors.acceptTerms = "You must accept the terms and privacy policy.";
  if (Object.keys(errors).length) fail(errors);

  const passwordHash = hashPassword(password);
  return mutateDb((db) => {
    if (db.users.some((u) => u.email === email)) {
      throw new ApiError(409, "An account with this institutional email already exists.", {
        email: "An account with this email already exists.",
      });
    }
    const now = new Date().toISOString();
    const userId = uid();
    const institutionId = uid();

    db.users.push({
      id: userId,
      email,
      name: repName,
      passwordHash,
      role: "academia",
      createdAt: now,
    });

    db.institutions[institutionId] = {
      id: institutionId,
      name: institutionName,
      type,
      logo: "",
      website,
      institutionalEmail: email,
      country: str(input.country, 60) || "India",
      state,
      city,
      address: str(input.address, 240),
      description: "",
      specializations: ["Computer Science", "Artificial Intelligence", "Electronics"],
      programsOffered: ["B.Tech / B.E.", "M.Tech", "MCA"],
      accreditation: str(input.accreditation, 120),
      affiliation: str(input.affiliation, 120),
      contactPersonName: repName,
      contactPersonTitle: designation,
      placementOfficeEmail: email,
      placementOfficePhone: str(input.phone, 30),
      academicYearLabel: "2026–2027",
      placementPolicyNote: "Students with active placement eligibility may register for campus drives.",
      shareCgpaWithRecruiters: false,
      verificationStatus: "Draft",
      createdAt: now,
    };

    db.academiaStaff[userId] = {
      userId,
      institutionId,
      name: repName,
      email,
      designation,
      department: "Administration & Placement Cell",
      role: "Institution Owner",
      notifications: {
        studentRegistrations: true,
        placementDrives: true,
        industryCollaborations: true,
        researchApplications: true,
        teamAndAuditAlerts: true,
      },
      onboarded: false,
    };

    // Seed 2 starter departments so the institution can immediately assign students/faculty
    db.academiaDepartments.push(
      {
        id: uid(),
        institutionId,
        name: "Computer Science & Engineering",
        code: "CSE",
        programs: ["B.Tech / B.E.", "M.Tech"],
        academicYears: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        coordinatorName: repName,
        coordinatorEmail: email,
        createdAt: now,
      },
      {
        id: uid(),
        institutionId,
        name: "Artificial Intelligence & Data Science",
        code: "AIDS",
        programs: ["B.Tech / B.E."],
        academicYears: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        coordinatorName: repName,
        coordinatorEmail: email,
        createdAt: now,
      },
    );

    db.academiaTeam.push({
      id: uid(),
      institutionId,
      name: repName,
      email,
      designation,
      department: "Administration & Placement Cell",
      role: "Institution Owner",
      status: "Active",
      joinedAt: now,
      isOwner: true,
    });

    recordAudit(
      db,
      institutionId,
      repName,
      "Institution Owner",
      `Registered institution workspace for ${institutionName}.`,
      "/academia/institution",
    );

    return { token: addSession(db, userId), onboarded: false };
  });
}

export async function loginAcademia(input: Record<string, unknown>) {
  const email = str(input.email, 254).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const errors: Record<string, string> = {};
  const e1 = validateEmail(email);
  if (e1) errors.email = e1;
  if (!password) errors.password = "Password is required.";
  if (Object.keys(errors).length) fail(errors);
  throttle("acad:" + email);

  const db0 = await readDb();
  const user = db0.users.find((u) => u.email === email && u.role === "academia");
  const bad = new ApiError(401, "Incorrect institutional email or password.");
  if (!user) {
    hashPassword(password);
    throw bad;
  }
  if (!verifyPassword(password, user.passwordHash)) throw bad;
  clearThrottle("acad:" + email);

  return mutateDb((db) => ({
    token: addSession(db, user.id),
    onboarded: db.academiaStaff[user.id]?.onboarded ?? false,
  }));
}

/* --------------------- Institution & Staff Profile --------------------- */

export async function updateAcademiaMe(
  user: UserRecord,
  body: Record<string, unknown>,
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    const u = db.users.find((x) => x.id === user.id);
    if (!staff || !u) throw new ApiError(404, "Staff account not found.");
    const inst = db.institutions[staff.institutionId];
    if (!inst) throw new ApiError(404, "Institution not found.");

    const errors: Record<string, string> = {};

    if (body.institution && typeof body.institution === "object") {
      assertCanWrite(staff.role, ["Institution Owner", "Institution Administrator", "Placement Officer"]);
      const c = body.institution as Record<string, unknown>;
      if ("name" in c) {
        const name = str(c.name, 140);
        const e = validateRequired(name, "Institution name", 140);
        if (e) errors.institutionName = e;
        inst.name = name;
        for (const ao of db.academicOpportunities) {
          if (ao.institutionId === inst.id) ao.institutionName = name;
        }
      }
      if ("type" in c) {
        const t = str(c.type, 60);
        if ((INSTITUTION_TYPES as readonly string[]).includes(t)) inst.type = t as InstitutionType;
      }
      if ("website" in c) {
        const w = str(c.website, 300);
        const e = validateUrl(w, "Official website", true);
        if (e) errors.website = e;
        inst.website = w;
      }
      if ("institutionalEmail" in c) inst.institutionalEmail = str(c.institutionalEmail, 254);
      if ("country" in c) inst.country = str(c.country, 60) || inst.country;
      if ("state" in c) inst.state = str(c.state, 80);
      if ("city" in c) inst.city = str(c.city, 80);
      if ("address" in c) inst.address = str(c.address, 240);
      if ("description" in c) inst.description = str(c.description, 1500);
      if ("specializations" in c) inst.specializations = stringList(c.specializations, 20, 50);
      if ("programsOffered" in c) inst.programsOffered = stringList(c.programsOffered, 20, 50);
      if ("accreditation" in c) inst.accreditation = str(c.accreditation, 160);
      if ("affiliation" in c) inst.affiliation = str(c.affiliation, 160);
      if ("contactPersonName" in c) inst.contactPersonName = str(c.contactPersonName, 80);
      if ("contactPersonTitle" in c) inst.contactPersonTitle = str(c.contactPersonTitle, 80);
      if ("placementOfficeEmail" in c) inst.placementOfficeEmail = str(c.placementOfficeEmail, 254);
      if ("placementOfficePhone" in c) inst.placementOfficePhone = str(c.placementOfficePhone, 30);
      if ("academicYearLabel" in c) inst.academicYearLabel = str(c.academicYearLabel, 30) || inst.academicYearLabel;
      if ("placementPolicyNote" in c) inst.placementPolicyNote = str(c.placementPolicyNote, 600);
      if ("shareCgpaWithRecruiters" in c) inst.shareCgpaWithRecruiters = c.shareCgpaWithRecruiters === true;
      if ("logo" in c) {
        const a = typeof c.logo === "string" ? c.logo : "";
        if (a && (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(a) || a.length > 300_000)) {
          errors.logo = "Logo must be a PNG, JPEG, or WebP image.";
        }
        inst.logo = a;
      }
      if (c.submitForVerification === true && inst.verificationStatus === "Draft") {
        inst.verificationStatus = "Pending Verification";
        inst.verificationSubmittedAt = new Date().toISOString();
        inst.verificationNote =
          "Submitted in demo mode. Verification is never falsely auto-granted without an external accreditation review.";
        recordAudit(
          db,
          inst.id,
          staff.name,
          staff.role,
          `Submitted ${inst.name} profile for institutional verification review.`,
          "/academia/institution",
        );
      }
    }

    if (body.staff && typeof body.staff === "object") {
      const s = body.staff as Record<string, unknown>;
      if ("name" in s) {
        const n = str(s.name, 80);
        const e = validateRequired(n, "Full name", 80);
        if (e) errors.name = e;
        staff.name = n;
        u.name = n;
      }
      if ("designation" in s) staff.designation = str(s.designation, 80) || staff.designation;
      if ("department" in s) staff.department = str(s.department, 80) || staff.department;
      if (s.notifications && typeof s.notifications === "object") {
        const n = s.notifications as Record<string, unknown>;
        staff.notifications = {
          studentRegistrations: n.studentRegistrations !== false,
          placementDrives: n.placementDrives !== false,
          industryCollaborations: n.industryCollaborations !== false,
          researchApplications: n.researchApplications !== false,
          teamAndAuditAlerts: n.teamAndAuditAlerts !== false,
        };
      }
      if (s.onboarded === true) staff.onboarded = true;
    }

    if (Object.keys(errors).length) fail(errors);
    return assembleAcademiaWorkspace(u, db);
  });
}

/* --------------------- Student Directory & CSV Import --------------------- */

export async function manageAcademiaStudents(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role);

    if (method === "DELETE") {
      const id = str(body.studentId, 80);
      db.academiaStudents = db.academiaStudents.filter(
        (s) => !(s.id === id && s.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    if (method === "PATCH") {
      const id = str(body.studentId, 80);
      const rec = db.academiaStudents.find((s) => s.id === id && s.institutionId === staff.institutionId);
      if (!rec) {
        // If updating a linked real student who wasn't yet in db.academiaStudents, create their roster entry
        const linkedUser = db.users.find((u) => `linked-${u.id}` === id);
        if (!linkedUser) throw new ApiError(404, "Student record not found.");
        const st = db.students[linkedUser.id];
        const statusRaw = str(body.placementStatus, 40);
        const placementStatus: PlacementStatus = (PLACEMENT_STATUSES as readonly string[]).includes(statusRaw)
          ? (statusRaw as PlacementStatus)
          : "Eligible";
        db.academiaStudents.unshift({
          id: uid(),
          institutionId: staff.institutionId,
          studentIdCode: str(body.studentIdCode, 40) || `SB-${linkedUser.id.slice(0, 6).toUpperCase()}`,
          linkedUserId: linkedUser.id,
          name: linkedUser.name,
          email: linkedUser.email,
          department: st?.profile.branch || "Computer Science",
          program: st?.profile.degree || "B.Tech / B.E.",
          year: st?.profile.year || "Final Year",
          gradYear: st?.profile.gradYear || "2027",
          cgpa: str(body.cgpa, 10) || undefined,
          placementEligible: body.placementEligible !== false,
          placementStatus,
          placedCompany: str(body.placedCompany, 80) || undefined,
          placedRole: str(body.placedRole, 80) || undefined,
          invitationStatus: "Registered on SkillBridge",
          skills: st?.skills ?? [],
          projects: st?.projects ?? [],
          certifications: st?.certifications ?? [],
          profileCompletion: st ? computeStudentCompletion(st) : 40,
          applicationsCount: st?.applications.length ?? 0,
          createdAt: new Date().toISOString(),
        });
        return assembleAcademiaWorkspace(user, db);
      }

      if ("placementEligible" in body) rec.placementEligible = body.placementEligible === true;
      if (typeof body.placementStatus === "string" && (PLACEMENT_STATUSES as readonly string[]).includes(body.placementStatus)) {
        rec.placementStatus = body.placementStatus as PlacementStatus;
      }
      if ("placedCompany" in body) rec.placedCompany = str(body.placedCompany, 80) || undefined;
      if ("placedRole" in body) rec.placedRole = str(body.placedRole, 80) || undefined;
      if ("cgpa" in body) rec.cgpa = str(body.cgpa, 10) || undefined;
      if (body.sendInvite === true && rec.invitationStatus === "Roster Record") {
        rec.invitationStatus = "Invited (Demo — email not sent)";
      }
      return assembleAcademiaWorkspace(user, db);
    }

    // POST: Single student creation OR bulk CSV import (`rows` array)
    const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : [body];
    if (rows.length === 0) throw new ApiError(400, "No student records provided.");

    const existingEmails = new Set(
      db.academiaStudents
        .filter((s) => s.institutionId === staff.institutionId)
        .map((s) => s.email.toLowerCase()),
    );
    const existingCodes = new Set(
      db.academiaStudents
        .filter((s) => s.institutionId === staff.institutionId)
        .map((s) => s.studentIdCode.toLowerCase()),
    );

    const now = new Date().toISOString();
    let importedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = str(r.name, 80);
      const email = str(r.email, 254).toLowerCase();
      const studentIdCode = str(r.studentIdCode, 40) || `STU-${Date.now().toString().slice(-4)}-${i + 1}`;
      const department = str(r.department, 80) || "Computer Science & Engineering";
      const program = str(r.program, 60) || "B.Tech / B.E.";
      const year = str(r.year, 30) || "3rd Year";
      const gradYear = str(r.gradYear, 10) || "2027";
      const cgpa = str(r.cgpa, 10) || undefined;
      const placementEligible = r.placementEligible !== false;
      const skillNames = stringList(r.skills, 15, 40);

      const eName = validateRequired(name, "Student name", 80);
      const eEmail = validateEmail(email);
      if (eName || eEmail) {
        if (rows.length === 1) fail({ name: eName ?? "", email: eEmail ?? "" });
        continue;
      }
      if (existingEmails.has(email) || existingCodes.has(studentIdCode.toLowerCase())) {
        if (rows.length === 1) {
          throw new ApiError(409, "A student with this email or student ID already exists in your directory.");
        }
        continue;
      }

      existingEmails.add(email);
      existingCodes.add(studentIdCode.toLowerCase());

      // Check if an existing Student Portal user matches this email
      const linkedUser = db.users.find((u) => u.email === email && (u.role ?? "student") === "student");
      const linkedSt = linkedUser ? db.students[linkedUser.id] : undefined;

      const rec: InstitutionStudentRecord = {
        id: uid(),
        institutionId: staff.institutionId,
        studentIdCode,
        linkedUserId: linkedUser?.id,
        name,
        email,
        department,
        program,
        year,
        gradYear,
        cgpa,
        placementEligible,
        placementStatus: "Eligible",
        invitationStatus: linkedUser
          ? "Registered on SkillBridge"
          : r.sendInvite === true
            ? "Invited (Demo — email not sent)"
            : "Roster Record",
        skills: linkedSt?.skills.length
          ? linkedSt.skills
          : skillNames.map((sk, idx) => ({ id: `sk-${idx}`, name: sk, level: "Intermediate" })),
        projects: linkedSt?.projects ?? [],
        certifications: linkedSt?.certifications ?? [],
        profileCompletion: linkedSt ? computeStudentCompletion(linkedSt) : skillNames.length > 0 ? 45 : 25,
        applicationsCount: linkedSt?.applications.length ?? 0,
        createdAt: now,
      };
      db.academiaStudents.unshift(rec);
      importedCount++;
    }

    recordAudit(
      db,
      staff.institutionId,
      staff.name,
      staff.role,
      `Added ${importedCount} student record(s) to the institutional directory.`,
      "/academia/students",
    );

    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Faculty & Departments --------------------- */

export async function saveOrDeleteDepartment(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role, ["Institution Owner", "Institution Administrator", "Department Coordinator"]);

    if (method === "DELETE") {
      const id = str(body.departmentId, 80);
      db.academiaDepartments = db.academiaDepartments.filter(
        (d) => !(d.id === id && d.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const name = str(body.name, 100);
    const code = str(body.code, 20).toUpperCase();
    const programs = stringList(body.programs, 15, 50);
    const academicYears = stringList(body.academicYears, 10, 30);
    const coordinatorName = str(body.coordinatorName, 80) || staff.name;
    const coordinatorEmail = str(body.coordinatorEmail, 254).toLowerCase() || staff.email;

    const e1 = validateRequired(name, "Department name", 100);
    const e2 = validateRequired(code, "Department code", 20);
    if (e1 || e2) fail({ name: e1 ?? "", code: e2 ?? "" });

    const existing = typeof body.id === "string"
      ? db.academiaDepartments.find((d) => d.id === body.id && d.institutionId === staff.institutionId)
      : undefined;

    const record: DepartmentRecord = {
      id: existing?.id ?? uid(),
      institutionId: staff.institutionId,
      name,
      code,
      programs: programs.length ? programs : ["B.Tech / B.E."],
      academicYears: academicYears.length ? academicYears : ["1st Year", "2nd Year", "3rd Year", "4th Year"],
      coordinatorName,
      coordinatorEmail,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      const idx = db.academiaDepartments.findIndex((d) => d.id === existing.id);
      db.academiaDepartments[idx] = record;
    } else {
      db.academiaDepartments.push(record);
      recordAudit(db, staff.institutionId, staff.name, staff.role, `Created department ${name} (${code}).`, "/academia/departments");
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

export async function saveOrDeleteFaculty(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role, ["Institution Owner", "Institution Administrator", "Department Coordinator", "Faculty Member"]);

    if (method === "DELETE") {
      const id = str(body.facultyId, 80);
      db.academiaFaculty = db.academiaFaculty.filter(
        (f) => !(f.id === id && f.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const name = str(body.name, 80);
    const email = str(body.email, 254).toLowerCase();
    const department = str(body.department, 100);
    const designation = str(body.designation, 80) || "Assistant Professor";
    const expertise = stringList(body.expertise, 15, 50);
    const researchInterests = stringList(body.researchInterests, 15, 50);
    const publicationsCount = Math.max(0, Number(body.publicationsCount) || 0);
    const mentoringAvailable = body.mentoringAvailable !== false;
    const SupervisedProjectsCount = Math.max(0, Number(body.SupervisedProjectsCount) || 0);
    const responsibilities = stringList(body.responsibilities, 10, 60);

    const e1 = validateRequired(name, "Faculty name", 80);
    const e2 = validateEmail(email);
    const e3 = validateRequired(department, "Department", 100);
    if (e1 || e2 || e3) fail({ name: e1 ?? "", email: e2 ?? "", department: e3 ?? "" });

    const existing = typeof body.id === "string"
      ? db.academiaFaculty.find((f) => f.id === body.id && f.institutionId === staff.institutionId)
      : undefined;

    const record: FacultyRecord = {
      id: existing?.id ?? uid(),
      institutionId: staff.institutionId,
      name,
      email,
      department,
      designation,
      expertise,
      researchInterests,
      publicationsCount,
      mentoringAvailable,
      SupervisedProjectsCount,
      responsibilities,
      accountStatus: existing?.accountStatus ?? "Invited (Demo — email not sent)",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      const idx = db.academiaFaculty.findIndex((f) => f.id === existing.id);
      db.academiaFaculty[idx] = record;
    } else {
      db.academiaFaculty.unshift(record);
      recordAudit(db, staff.institutionId, staff.name, staff.role, `Added faculty member ${name} (${department}).`, "/academia/faculty");
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Placement Cell & Industry Sync --------------------- */

export async function managePlacements(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role, [
      "Institution Owner",
      "Institution Administrator",
      "Placement Officer",
      "Department Coordinator",
    ]);

    // Action 1: Approve an Industry Portal campus event (`approveIndustryEventId`)
    if (typeof body.approveIndustryEventId === "string") {
      const ev = db.events.find((x) => x.id === body.approveIndustryEventId);
      if (!ev) throw new ApiError(404, "Industry campus event not found.");
      ev.institutionApproval = "Approved";
      recordAudit(
        db,
        staff.institutionId,
        staff.name,
        staff.role,
        `Approved industry campus event “${ev.title}”.`,
        "/academia/placements",
      );
      return assembleAcademiaWorkspace(user, db);
    }

    // Action 2: Share / Endorse an Industry job listing with institution departments (`endorseJobId`)
    if (typeof body.endorseJobId === "string") {
      const job = db.jobs.find((j) => j.id === body.endorseJobId);
      if (!job) throw new ApiError(404, "Job listing not found.");
      const targetDepartments = stringList(body.targetDepartments, 15, 80);
      const existingIdx = db.sharedJobEndorsements.findIndex(
        (s) => s.jobId === job.id && s.institutionId === staff.institutionId,
      );
      const item = {
        jobId: job.id,
        institutionId: staff.institutionId,
        sharedBy: staff.name,
        targetDepartments: targetDepartments.length ? targetDepartments : ["All Eligible Departments"],
        sharedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) db.sharedJobEndorsements[existingIdx] = item;
      else db.sharedJobEndorsements.unshift(item);
      recordAudit(
        db,
        staff.institutionId,
        staff.name,
        staff.role,
        `Shared employer listing “${job.title}” (${job.companyName}) with eligible students.`,
        "/academia/opportunities",
      );
      return assembleAcademiaWorkspace(user, db);
    }

    if (method === "DELETE") {
      const id = str(body.driveId, 80);
      db.placementDrives = db.placementDrives.filter(
        (d) => !(d.id === id && d.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    // Create or update a PlacementDrive
    const existing = typeof body.id === "string"
      ? db.placementDrives.find((d) => d.id === body.id && d.institutionId === staff.institutionId)
      : undefined;

    const title = str(body.title, 120);
    const companyName = str(body.companyName, 120);
    const roleTitle = str(body.roleTitle, 100);
    const packageOrStipend = str(body.packageOrStipend, 80);
    const driveDate = str(body.driveDate, 20);
    const modeRaw = str(body.mode, 20);
    const mode: WorkMode = (WORK_MODES as readonly string[]).includes(modeRaw) ? (modeRaw as WorkMode) : "On-site";
    const venueOrLink = str(body.venueOrLink, 240);
    const eligibleDepartments = stringList(body.eligibleDepartments, 15, 80);
    const eligibleGradYears = stringList(body.eligibleGradYears, 8, 15);
    const minSkills = stringList(body.minSkills, 15, 40);
    const coordinatorName = str(body.coordinatorName, 80) || staff.name;
    const statusRaw = str(body.status, 30);
    const status: DriveStatus = (DRIVE_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as DriveStatus)
      : existing?.status ?? "Registration Open";

    const e1 = validateRequired(title, "Drive title", 120);
    const e2 = validateRequired(companyName, "Company name", 120);
    const e3 = validateRequired(roleTitle, "Role title", 100);
    const e4 = validateRequired(driveDate, "Drive date", 20);
    if (e1 || e2 || e3 || e4) fail({ title: e1 ?? "", companyName: e2 ?? "", roleTitle: e3 ?? "", driveDate: e4 ?? "" });

    const record: PlacementDrive = {
      id: existing?.id ?? uid(),
      institutionId: staff.institutionId,
      title,
      companyName,
      companyId: str(body.companyId, 80) || undefined,
      roleTitle,
      packageOrStipend,
      driveDate,
      mode,
      venueOrLink: venueOrLink || "Campus Placement Auditorium",
      eligibleDepartments: eligibleDepartments.length ? eligibleDepartments : ["All Engineering Branches"],
      eligibleGradYears: eligibleGradYears.length ? eligibleGradYears : ["2027"],
      minSkills,
      coordinatorName,
      status,
      registeredCount: Math.max(0, Number(body.registeredCount ?? existing?.registeredCount ?? 0)),
      shortlistedCount: Math.max(0, Number(body.shortlistedCount ?? existing?.shortlistedCount ?? 0)),
      interviewedCount: Math.max(0, Number(body.interviewedCount ?? existing?.interviewedCount ?? 0)),
      offersCount: Math.max(0, Number(body.offersCount ?? existing?.offersCount ?? 0)),
      confirmedPlacementsCount: Math.max(
        0,
        Number(body.confirmedPlacementsCount ?? existing?.confirmedPlacementsCount ?? 0),
      ),
      notes: str(body.notes, 800),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      const idx = db.placementDrives.findIndex((d) => d.id === existing.id);
      db.placementDrives[idx] = record;
    } else {
      db.placementDrives.unshift(record);
      recordAudit(
        db,
        staff.institutionId,
        staff.name,
        staff.role,
        `Scheduled placement drive “${title}” with ${companyName}.`,
        "/academia/placements",
      );
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Industry Partnerships & MoUs --------------------- */

export async function saveOrDeletePartnership(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role);

    if (method === "DELETE") {
      const id = str(body.partnershipId, 80);
      db.industryPartnerships = db.industryPartnerships.filter(
        (p) => !(p.id === id && p.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const existing = typeof body.id === "string"
      ? db.industryPartnerships.find((p) => p.id === body.id && p.institutionId === staff.institutionId)
      : undefined;

    const companyName = str(body.companyName, 120);
    const industry = str(body.industry, 80) || "Software & Cloud";
    const website = str(body.website, 300);
    const contactName = str(body.contactName, 80);
    const contactEmail = str(body.contactEmail, 254).toLowerCase();
    const collaborationTypes = stringList(body.collaborationTypes, 10, 50);
    const statusRaw = str(body.status, 30);
    const status: PartnershipStatus = (PARTNERSHIP_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as PartnershipStatus)
      : existing?.status ?? "Requested";
    const mouSigned = body.mouSigned === true;
    const mouReference = str(body.mouReference, 80) || undefined;
    const mouValidUntil = str(body.mouValidUntil, 20) || undefined;
    const nextVisitDate = str(body.nextVisitDate, 20) || undefined;
    const notes = str(body.notes, 800);

    const e1 = validateRequired(companyName, "Company name", 120);
    const e2 = validateRequired(contactName, "Contact person", 80);
    const e3 = validateEmail(contactEmail);
    if (e1 || e2 || e3) fail({ companyName: e1 ?? "", contactName: e2 ?? "", contactEmail: e3 ?? "" });

    const record: IndustryPartnership = {
      id: existing?.id ?? uid(),
      institutionId: staff.institutionId,
      companyId: str(body.companyId, 80) || undefined,
      companyName,
      industry,
      website,
      contactName,
      contactEmail,
      collaborationTypes: collaborationTypes.length ? collaborationTypes : ["Campus Hiring"],
      status,
      mouSigned,
      mouReference,
      mouValidUntil,
      nextVisitDate,
      notes,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      const idx = db.industryPartnerships.findIndex((p) => p.id === existing.id);
      db.industryPartnerships[idx] = record;
    } else {
      db.industryPartnerships.unshift(record);
      recordAudit(
        db,
        staff.institutionId,
        staff.name,
        staff.role,
        `Logged industry partnership with ${companyName} (${status}).`,
        "/academia/industry-partners",
      );
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Academic Projects & Research --------------------- */

export async function saveOrDeleteAcademicOpportunity(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role);
    const inst = db.institutions[staff.institutionId];
    if (!inst) throw new ApiError(404, "Institution not found.");

    if (method === "DELETE") {
      const id = str(body.opportunityId, 80);
      db.academicOpportunities = db.academicOpportunities.filter(
        (o) => !(o.id === id && o.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const existing = typeof body.id === "string"
      ? db.academicOpportunities.find((o) => o.id === body.id && o.institutionId === staff.institutionId)
      : undefined;

    const title = str(body.title, 140);
    const catRaw = str(body.category, 60);
    const category: AcademicOppCategory = (ACADEMIC_OPP_CATEGORIES as readonly string[]).includes(catRaw)
      ? (catRaw as AcademicOppCategory)
      : existing?.category ?? "Faculty-Led Project";
    const department = str(body.department, 100) || staff.department;
    const supervisorName = str(body.supervisorName, 80) || staff.name;
    const supervisorEmail = str(body.supervisorEmail, 254).toLowerCase() || staff.email;
    const sponsorCompany = str(body.sponsorCompany, 100) || undefined;
    const modeRaw = str(body.mode, 20);
    const mode: WorkMode = (WORK_MODES as readonly string[]).includes(modeRaw) ? (modeRaw as WorkMode) : "On-site";
    const location = str(body.location, 120) || `${inst.city || "Campus"} Research Lab`;
    const requiredSkills = stringList(body.requiredSkills, 15, 40);
    const eligibility = str(body.eligibility, 300) || "Open to 3rd & 4th year students";
    const positions = Math.max(1, Math.min(100, Number(body.positions) || 2));
    const deadline = str(body.deadline, 30);
    const stipendOrGrant = str(body.stipendOrGrant, 80);
    const description = str(body.description, 2000);
    const publicationReference = str(body.publicationReference, 200) || undefined;
    const statusRaw = str(body.status, 20);
    const status: AcademicOpportunity["status"] =
      statusRaw === "Published" || statusRaw === "Archived" || statusRaw === "Draft"
        ? statusRaw
        : existing?.status ?? "Published";

    const e1 = validateRequired(title, "Title", 140);
    const e2 = validateRequired(deadline, "Application deadline", 30);
    const e3 = validateRequired(description, "Description", 2000);
    if (e1 || e2 || e3) fail({ title: e1 ?? "", deadline: e2 ?? "", description: e3 ?? "" });

    const record: AcademicOpportunity = {
      id: existing?.id ?? uid(),
      institutionId: inst.id,
      institutionName: inst.name,
      title,
      category,
      department,
      supervisorName,
      supervisorEmail,
      sponsorCompany,
      mode,
      location,
      requiredSkills,
      eligibility,
      positions,
      deadline,
      stipendOrGrant,
      description,
      publicationReference,
      status,
      applicantCount: existing?.applicantCount ?? 0,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      const idx = db.academicOpportunities.findIndex((o) => o.id === existing.id);
      db.academicOpportunities[idx] = record;
    } else {
      db.academicOpportunities.unshift(record);
      recordAudit(
        db,
        inst.id,
        staff.name,
        staff.role,
        `Published ${category}: “${title}”.`,
        "/academia/projects",
      );
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Campus Events --------------------- */

export async function saveOrDeleteAcademiaEvent(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role);

    if (method === "DELETE") {
      const id = str(body.eventId, 80);
      db.academiaEvents = db.academiaEvents.filter(
        (e) => !(e.id === id && e.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const existing = typeof body.id === "string"
      ? db.academiaEvents.find((e) => e.id === body.id && e.institutionId === staff.institutionId)
      : undefined;

    const title = str(body.title, 140);
    const typeRaw = str(body.type, 50);
    const type: AcademiaEventType = (ACADEMIA_EVENT_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as AcademiaEventType)
      : existing?.type ?? "Workshop & Seminar";
    const organizer = str(body.organizer, 100) || staff.department;
    const targetAudience = str(body.targetAudience, 100) || "All Students";
    const department = str(body.department, 100) || "All Departments";
    const date = str(body.date, 20);
    const time = str(body.time, 20) || "10:00";
    const registrationDeadline = str(body.registrationDeadline, 20) || date;
    const modeRaw = str(body.mode, 20);
    const mode: WorkMode = (WORK_MODES as readonly string[]).includes(modeRaw) ? (modeRaw as WorkMode) : "On-site";
    const location = str(body.location, 160);
    const capacity = Math.max(5, Math.min(10000, Number(body.capacity) || 150));
    const registeredCount = Math.max(0, Number(body.registeredCount ?? existing?.registeredCount ?? 0));
    const attendedCount = Math.max(0, Number(body.attendedCount ?? existing?.attendedCount ?? 0));
    const statusRaw = str(body.status, 30);
    const status: AcademiaEventStatus = (ACADEMIA_EVENT_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as AcademiaEventStatus)
      : existing?.status ?? "Registration Open";
    const description = str(body.description, 1200);

    const e1 = validateRequired(title, "Event title", 140);
    const e2 = validateRequired(date, "Event date", 20);
    const e3 = validateRequired(location, "Location or meeting link", 160);
    if (e1 || e2 || e3) fail({ title: e1 ?? "", date: e2 ?? "", location: e3 ?? "" });

    const record: AcademiaEvent = {
      id: existing?.id ?? uid(),
      institutionId: staff.institutionId,
      title,
      type,
      organizer,
      targetAudience,
      department,
      date,
      time,
      registrationDeadline,
      mode,
      location,
      capacity,
      registeredCount,
      attendedCount,
      status,
      description,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      const idx = db.academiaEvents.findIndex((e) => e.id === existing.id);
      db.academiaEvents[idx] = record;
    } else {
      db.academiaEvents.unshift(record);
      recordAudit(db, staff.institutionId, staff.name, staff.role, `Created campus event “${title}”.`, "/academia/events");
    }
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Announcements --------------------- */

export async function saveOrDeleteAnnouncement(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role);

    if (method === "DELETE") {
      const id = str(body.announcementId, 80);
      db.academiaAnnouncements = db.academiaAnnouncements.filter(
        (a) => !(a.id === id && a.institutionId === staff.institutionId),
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const title = str(body.title, 140);
    const text = str(body.body, 2000);
    const audRaw = str(body.audience, 50);
    const audience: AnnouncementAudience = (ANNOUNCEMENT_AUDIENCES as readonly string[]).includes(audRaw)
      ? (audRaw as AnnouncementAudience)
      : "All Students";
    const priRaw = str(body.priority, 20);
    const priority: AnnouncementPriority = (ANNOUNCEMENT_PRIORITIES as readonly string[]).includes(priRaw)
      ? (priRaw as AnnouncementPriority)
      : "Normal";
    const statusRaw = str(body.status, 20);
    const status: InstitutionAnnouncement["status"] =
      statusRaw === "Draft" || statusRaw === "Scheduled" || statusRaw === "Published" ? statusRaw : "Published";

    const e1 = validateRequired(title, "Announcement title", 140);
    const e2 = validateRequired(text, "Announcement message", 2000);
    if (e1 || e2) fail({ title: e1 ?? "", body: e2 ?? "" });

    const record: InstitutionAnnouncement = {
      id: uid(),
      institutionId: staff.institutionId,
      title,
      body: text,
      audience,
      targetDepartment: str(body.targetDepartment, 80) || undefined,
      targetYear: str(body.targetYear, 30) || undefined,
      priority,
      status,
      scheduledFor: str(body.scheduledFor, 30) || undefined,
      authorName: staff.name,
      authorRole: staff.role,
      createdAt: new Date().toISOString(),
    };

    db.academiaAnnouncements.unshift(record);
    recordAudit(
      db,
      staff.institutionId,
      staff.name,
      staff.role,
      `Published announcement “${title}” for ${audience}.`,
      "/academia/announcements",
    );
    return assembleAcademiaWorkspace(user, db);
  });
}

/* --------------------- Team Management & RBAC --------------------- */

export async function manageAcademiaTeam(
  user: UserRecord,
  body: Record<string, unknown>,
  method: "POST" | "PATCH" | "DELETE",
): Promise<AcademiaWorkspaceData> {
  return mutateDb((db) => {
    const staff = db.academiaStaff[user.id];
    if (!staff) throw new ApiError(403, "Academia access required.");
    assertCanWrite(staff.role, ["Institution Owner", "Institution Administrator"]);

    if (method === "POST") {
      const name = str(body.name, 80);
      const email = str(body.email, 254).toLowerCase();
      const designation = str(body.designation, 80);
      const department = str(body.department, 100) || "Placement & Academics";
      const roleRaw = str(body.role, 40);
      const role: AcademiaRole = (ACADEMIA_ROLES as readonly string[]).includes(roleRaw)
        ? (roleRaw as AcademiaRole)
        : "Faculty Member";

      const e1 = validateRequired(name, "Full name", 80);
      const e2 = validateEmail(email);
      const e3 = validateRequired(designation, "Designation", 80);
      if (e1 || e2 || e3) fail({ name: e1 ?? "", email: e2 ?? "", designation: e3 ?? "" });
      if (db.academiaTeam.some((t) => t.institutionId === staff.institutionId && t.email === email)) {
        fail({ email: "This staff member is already in your institution team." });
      }

      db.academiaTeam.push({
        id: uid(),
        institutionId: staff.institutionId,
        name,
        email,
        designation,
        department,
        role,
        status: "Invited (Demo — email not sent)",
        joinedAt: new Date().toISOString(),
      });

      recordAudit(
        db,
        staff.institutionId,
        staff.name,
        staff.role,
        `Invited ${name} as ${role}.`,
        "/academia/team",
      );
      return assembleAcademiaWorkspace(user, db);
    }

    const memberId = str(body.memberId, 80);
    const member = db.academiaTeam.find((t) => t.id === memberId && t.institutionId === staff.institutionId);
    if (!member) throw new ApiError(404, "Team member not found.");
    if (member.isOwner) throw new ApiError(400, "The Institution Owner account cannot be deactivated or removed.");

    if (method === "DELETE") {
      db.academiaTeam = db.academiaTeam.filter((t) => t.id !== member.id);
      return assembleAcademiaWorkspace(user, db);
    }

    if (typeof body.role === "string" && (ACADEMIA_ROLES as readonly string[]).includes(body.role)) {
      member.role = body.role as AcademiaRole;
    }
    if (typeof body.status === "string" && (body.status === "Active" || body.status === "Deactivated")) {
      member.status = body.status;
    }
    return assembleAcademiaWorkspace(user, db);
  });
}
