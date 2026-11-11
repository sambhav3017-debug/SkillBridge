import { handle, jsonBody, ok } from "@/lib/server/http";
import { requireAcademiaUser } from "@/lib/server/auth";
import { readDb, mutateDb } from "@/lib/server/db";
import { ApiError } from "@/lib/server/http";
import {
  buildStudentLearningProfile,
  computeInstitutionalAnalytics,
} from "@/lib/academia/learning-sync-engine";
import type { VerificationStatus } from "@/lib/academia/learning-sync-types";

/**
 * GET /api/academia/learning
 * Retrieves institutional learning analytics, student learning profiles, or a specific student's profile.
 * Parameters:
 *   ?studentId=... (optional, returns detailed StudentLearningProfile)
 */
export const GET = handle(async (req: Request) => {
  const staffUser = await requireAcademiaUser();
  const db = await readDb();
  const staff = db.academiaStaff[staffUser.id];
  if (!staff) throw new ApiError(403, "Staff profile not found.");

  const institutionId = staff.institutionId;
  const institution = db.institutions[institutionId];
  if (!institution) throw new ApiError(404, "Institution not found.");

  const url = new URL(req.url);
  const targetStudentId = url.searchParams.get("studentId");

  const instNameLower = institution.name.trim().toLowerCase();

  // Find all students enrolled under this institution:
  // 1. Matched by college name in student profile
  // 2. Or matched by email in institution's academiaStudents roster
  const matchingStudentPairs: { user: (typeof db.users)[0]; rec: (typeof db.students)[string]; code?: string }[] = [];

  for (const [id, st] of Object.entries(db.students)) {
    const u = db.users.find((user) => user.id === id);
    if (!u) continue;

    const collegeLower = (st.profile?.college ?? "").trim().toLowerCase();
    const rosterItem = (db.academiaStudents || []).find(
      (r) => r.institutionId === institutionId && r.email.toLowerCase() === u.email.toLowerCase()
    );

    const matchesCollege =
      instNameLower.length >= 3 &&
      collegeLower.length >= 3 &&
      (collegeLower.includes(instNameLower) || instNameLower.includes(collegeLower));

    if (rosterItem || matchesCollege) {
      matchingStudentPairs.push({
        user: u,
        rec: st,
        code: rosterItem?.studentIdCode,
      });
    }
  }

  // If a specific student ID was requested, return that student's learning profile
  if (targetStudentId) {
    const pair = matchingStudentPairs.find((p) => p.user.id === targetStudentId);
    if (!pair) {
      throw new ApiError(
        404,
        "Student learning record not found or student is not enrolled in your institution."
      );
    }
    const profile = buildStudentLearningProfile(pair.user, pair.rec, {
      institutionId,
      studentIdCode: pair.code,
    });
    return ok({ profile });
  }

  // Otherwise, compile all student learning profiles and compute institutional analytics
  const allProfiles = matchingStudentPairs.map((p) =>
    buildStudentLearningProfile(p.user, p.rec, {
      institutionId,
      studentIdCode: p.code,
    })
  );

  const analytics = computeInstitutionalAnalytics(
    institutionId,
    institution.name,
    allProfiles
  );

  return ok({
    analytics,
    studentProfiles: allProfiles,
  });
});

/**
 * POST /api/academia/learning
 * Allows academic staff to perform authorized learning operations:
 * - Update certificate verification status ("verify_certificate")
 */
export const POST = handle(async (req: Request) => {
  const staffUser = await requireAcademiaUser();
  const body = (await jsonBody(req)) as {
    action: "verify_certificate";
    studentId: string;
    certificateId: string;
    status: VerificationStatus;
    notes?: string;
  };

  if (body.action === "verify_certificate") {
    const result = await mutateDb((db) => {
      const staff = db.academiaStaff[staffUser.id];
      if (!staff) throw new ApiError(403, "Staff profile not found.");
      if (staff.role === "Read-Only Analyst") {
        throw new ApiError(403, "Read-Only Analysts cannot verify certificates.");
      }

      const st = db.students[body.studentId];
      if (!st) throw new ApiError(404, "Student record not found.");

      const cert = (st.certifications || []).find((c) => c.id === body.certificateId);
      if (!cert) throw new ApiError(404, "Certificate not found.");

      (cert as any).verificationStatus = body.status;
      (cert as any).verifiedBy = staff.name;
      (cert as any).verifiedAt = new Date().toISOString();
      (cert as any).verificationNotes = body.notes;

      // Record audit
      if (!db.academiaAudit) db.academiaAudit = [];
      db.academiaAudit.unshift({
        id: crypto.randomUUID(),
        institutionId: staff.institutionId,
        actorName: staff.name,
        actorRole: staff.role,
        action: `${body.status} certificate: ${cert.title} for student ${body.studentId}`,
        href: `/academia/student-learning?studentId=${body.studentId}`,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        certificate: cert,
        message: `Certificate has been updated to "${body.status}".`,
      };
    });
    return ok(result);
  }

  throw new ApiError(400, "Unknown action.");
});
