import { respond, readJson, ApiError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readDb } from "@/lib/server/db";
import type { StudentAcademicSharingPrefs } from "@/lib/academia/learning-sync-types";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student record not found.");

    const institutionName = rec.profile?.college || "Unassigned Academic Institution";
    const prefs: StudentAcademicSharingPrefs = (rec as any).academicSharingPrefs || {
      shareCourseEnrollmentAndProgress: true,
      shareSkillDevelopment: true,
      shareCertificates: true,
      shareProjectsAndPracticalWork: true,
      shareActivityTimeline: true,
      lastSyncTimestamp: new Date().toISOString(),
    };

    return {
      institutionName,
      sharingPreferences: prefs,
      lastSyncTimestamp: prefs.lastSyncTimestamp,
      recordsCount: {
        enrolledCourses: Object.keys(rec.learning || {}).length,
        profileSkills: (rec.skills || []).length,
        certificates: (rec.certifications || []).length,
        projects: (rec.projects || []).length,
        tasks: (rec.tasks || []).length,
      },
    };
  });
}

export async function PATCH(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = (await readJson(req)) as Partial<StudentAcademicSharingPrefs>;

    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");

      const currentPrefs: StudentAcademicSharingPrefs = (rec as any).academicSharingPrefs || {
        shareCourseEnrollmentAndProgress: true,
        shareSkillDevelopment: true,
        shareCertificates: true,
        shareProjectsAndPracticalWork: true,
        shareActivityTimeline: true,
        lastSyncTimestamp: new Date().toISOString(),
      };

      const updatedPrefs: StudentAcademicSharingPrefs = {
        shareCourseEnrollmentAndProgress:
          typeof body.shareCourseEnrollmentAndProgress === "boolean"
            ? body.shareCourseEnrollmentAndProgress
            : currentPrefs.shareCourseEnrollmentAndProgress,
        shareSkillDevelopment:
          typeof body.shareSkillDevelopment === "boolean"
            ? body.shareSkillDevelopment
            : currentPrefs.shareSkillDevelopment,
        shareCertificates:
          typeof body.shareCertificates === "boolean"
            ? body.shareCertificates
            : currentPrefs.shareCertificates,
        shareProjectsAndPracticalWork:
          typeof body.shareProjectsAndPracticalWork === "boolean"
            ? body.shareProjectsAndPracticalWork
            : currentPrefs.shareProjectsAndPracticalWork,
        shareActivityTimeline:
          typeof body.shareActivityTimeline === "boolean"
            ? body.shareActivityTimeline
            : currentPrefs.shareActivityTimeline,
        lastSyncTimestamp: new Date().toISOString(),
      };

      (rec as any).academicSharingPrefs = updatedPrefs;

      return {
        sharingPreferences: updatedPrefs,
        message: "Academic sharing preferences saved and synchronized.",
      };
    });
  });
}
