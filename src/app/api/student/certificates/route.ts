import { respond, readJson, ApiError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readDb } from "@/lib/server/db";
import { toStudentData } from "@/lib/server/student-service";
import { GLOBAL_CERTIFICATES } from "@/lib/student/certificate-catalog";
import { generateCertificateRecommendations } from "@/lib/student/certificate-recommender";
import type {
  StudentCertificateProgress,
  CertificationProgressStatus,
} from "@/lib/student/certificate-types";
import type { Certification, StudentTask } from "@/lib/student/types";
import crypto from "crypto";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student record not found.");

    const studentData = toStudentData(user, rec, db);

    const savedCertificates: string[] = rec.savedCertificates ?? [];
    const inProgressCertificates: StudentCertificateProgress[] = rec.inProgressCertificates ?? [];
    const recommendations = generateCertificateRecommendations(
      studentData,
      savedCertificates,
      inProgressCertificates
    );

    return {
      catalog: GLOBAL_CERTIFICATES,
      recommendations,
      savedIds: savedCertificates,
      inProgress: inProgressCertificates,
      earnedCertificates: rec.certifications ?? [],
    };
  });
}

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = (await readJson(req)) as {
      action:
        | "save"
        | "unsave"
        | "plan_to_start"
        | "start_in_progress"
        | "mark_completed"
        | "add_learning_task";
      catalogId: string;
      targetDate?: string;
      targetWeeklyHours?: number;
      notes?: string;
      credentialUrl?: string;
    };

    if (!body || !body.action || !body.catalogId) {
      throw new ApiError(400, "Missing required fields: action and catalogId.");
    }

    const cert = GLOBAL_CERTIFICATES.find((c) => c.id === body.catalogId);
    if (!cert) {
      throw new ApiError(404, `Certificate with ID ${body.catalogId} not found in catalog.`);
    }

    const updated = await mutateDb((draft) => {
      const s = draft.students[user.id];
      if (!s) throw new ApiError(404, "Student not found.");

      if (!s.savedCertificates) s.savedCertificates = [];
      if (!s.inProgressCertificates) s.inProgressCertificates = [];
      if (!s.certifications) s.certifications = [];
      if (!s.tasks) s.tasks = [];

      const today = new Date().toISOString().slice(0, 10);
      const nowIso = new Date().toISOString();

      if (body.action === "save") {
        if (!s.savedCertificates.includes(body.catalogId)) {
          s.savedCertificates.unshift(body.catalogId);
        }
      } else if (body.action === "unsave") {
        s.savedCertificates = s.savedCertificates.filter((id: string) => id !== body.catalogId);
      } else if (body.action === "plan_to_start" || body.action === "start_in_progress") {
        const status: CertificationProgressStatus =
          body.action === "plan_to_start" ? "Planning to Start" : "In Progress";

        const existingIdx = s.inProgressCertificates.findIndex(
          (p: StudentCertificateProgress) => p.catalogId === body.catalogId
        );

        const progressItem: StudentCertificateProgress = {
          catalogId: body.catalogId,
          status,
          startedAt: nowIso,
          targetCompletionDate:
            body.targetDate ||
            new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
          targetWeeklyHours: body.targetWeeklyHours || 6,
          notes: body.notes || "",
        };

        if (existingIdx >= 0) {
          s.inProgressCertificates[existingIdx] = {
            ...s.inProgressCertificates[existingIdx],
            ...progressItem,
          };
        } else {
          s.inProgressCertificates.unshift(progressItem);
        }

        // Auto-create a scheduled study task for this certification in Smart Planner
        const taskTitle = `Study & Prepare for ${cert.title}`;
        const existingTask = s.tasks.find(
          (t: StudentTask) => t.title.includes(cert.title) && !t.completed
        );

        if (!existingTask) {
          const newTask: StudentTask = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: `Review syllabus modules for ${cert.title} (${cert.issuer}) on ${cert.platform}. Target finish: ${progressItem.targetCompletionDate}.`,
            date: today,
            startTime: "18:00",
            dueTime: "19:30",
            type: "Personal Task",
            priority: "High",
            completed: false,
            reminder: "15_min",
            createdAt: nowIso,
            updatedAt: nowIso,
            topic: cert.domain,
            actionUrl: cert.officialUrl,
          };
          s.tasks.unshift(newTask);
        }
      } else if (body.action === "mark_completed") {
        // Move from in-progress to completed, and add to student.certifications
        s.inProgressCertificates = s.inProgressCertificates.filter(
          (p: StudentCertificateProgress) => p.catalogId !== body.catalogId
        );

        const alreadyInCerts = s.certifications.some(
          (c: Certification) =>
            c.title.toLowerCase() === cert.title.toLowerCase() ||
            c.id === `cert-${cert.id}`
        );

        if (!alreadyInCerts) {
          const earnedCert: Certification = {
            id: `cert-${cert.id}-${Date.now().toString(36)}`,
            title: cert.title,
            issuer: cert.issuer,
            issueDate: today,
            credentialUrl: body.credentialUrl || cert.officialUrl,
          };
          s.certifications.unshift(earnedCert);
        }
      } else if (body.action === "add_learning_task") {
        const newTask: StudentTask = {
          id: crypto.randomUUID(),
          title: `Certification Prep: ${cert.title}`,
          description: `Work through ${cert.syllabus[0]?.title || "curriculum"} for ${cert.title}. Official portal: ${cert.officialUrl}`,
          date: body.targetDate || today,
          startTime: "19:00",
          dueTime: "20:00",
          type: "Personal Task",
          priority: "High",
          completed: false,
          reminder: "15_min",
          createdAt: nowIso,
          updatedAt: nowIso,
          topic: cert.domain,
          actionUrl: cert.officialUrl,
        };
        s.tasks.unshift(newTask);
      }

      return s;
    });

    const dbAfter = await readDb();
    const studentData = toStudentData(user, updated, dbAfter);
    const savedCertificates: string[] = updated.savedCertificates ?? [];
    const inProgressCertificates: StudentCertificateProgress[] = updated.inProgressCertificates ?? [];
    const recommendations = generateCertificateRecommendations(
      studentData,
      savedCertificates,
      inProgressCertificates
    );

    return {
      success: true,
      catalog: GLOBAL_CERTIFICATES,
      recommendations,
      savedIds: savedCertificates,
      inProgress: inProgressCertificates,
      earnedCertificates: updated.certifications ?? [],
      tasks: updated.tasks ?? [],
    };
  });
}
