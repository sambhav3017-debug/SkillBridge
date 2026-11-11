import { respond, readJson, ApiError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readDb } from "@/lib/server/db";
import { toStudentData } from "@/lib/server/student-service";
import {
  generatePersonalizedPath,
  getAssistantResponse,
} from "@/lib/student/recommendation-engine";
import type {
  PathGenerationInput,
} from "@/lib/student/personalized-path-types";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student record not found.");

    return {
      path: rec.personalizedPath ?? null,
      student: toStudentData(user, rec, db),
    };
  });
}

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = (await readJson(req)) as {
      action: "generate" | "regenerate" | "assistant_query" | "preview";
      input?: PathGenerationInput;
      query?: string;
    };

    if (!body || !body.action) {
      throw new ApiError(400, "Missing required 'action' in request body.");
    }

    if (body.action === "preview") {
      const db = await readDb();
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");

      const previewPath = generatePersonalizedPath(rec, body.input);
      return { path: previewPath };
    }

    if (body.action === "assistant_query") {
      const db = await readDb();
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");

      const path = rec.personalizedPath || generatePersonalizedPath(rec, body.input);
      const message = getAssistantResponse(path, rec, body.query || "What should I learn next?");
      return { message };
    }

    // "generate" or "regenerate"
    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");

      const newPath = generatePersonalizedPath(rec, body.input);
      rec.personalizedPath = newPath;

      return {
        path: newPath,
        student: toStudentData(user, rec, db),
      };
    });
  });
}

export async function PATCH(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = (await readJson(req)) as {
      action: "skip_skill" | "accept_skill" | "toggle_project" | "update_weekly_hours" | "update_goal";
      skillId?: string;
      projectId?: string;
      completed?: boolean;
      weeklyHours?: number;
      goal?: string;
    };

    if (!body || !body.action) {
      throw new ApiError(400, "Missing required 'action' in request body.");
    }

    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");
      if (!rec.personalizedPath) {
        throw new ApiError(404, "No personalized path found to update.");
      }

      const path = rec.personalizedPath;
      path.updatedAt = new Date().toISOString();

      if (body.action === "skip_skill" && body.skillId) {
        if (!path.customizations.skippedSkillIds.includes(body.skillId)) {
          path.customizations.skippedSkillIds.push(body.skillId);
        }
        path.customizations.acceptedSkillIds = path.customizations.acceptedSkillIds.filter(
          (id) => id !== body.skillId
        );
        for (const phase of path.phases) {
          for (const s of phase.skills) {
            if (s.skillId === body.skillId) {
              s.status = "skipped";
            }
          }
        }
      } else if (body.action === "accept_skill" && body.skillId) {
        path.customizations.skippedSkillIds = path.customizations.skippedSkillIds.filter(
          (id) => id !== body.skillId
        );
        if (!path.customizations.acceptedSkillIds.includes(body.skillId)) {
          path.customizations.acceptedSkillIds.push(body.skillId);
        }
        for (const phase of path.phases) {
          for (const s of phase.skills) {
            if (s.skillId === body.skillId) {
              s.status = "recommended";
            }
          }
        }
      } else if (body.action === "toggle_project" && body.projectId) {
        const isComp = body.completed !== false;
        if (isComp) {
          if (!path.customizations.completedProjectIds.includes(body.projectId)) {
            path.customizations.completedProjectIds.push(body.projectId);
          }
        } else {
          path.customizations.completedProjectIds = path.customizations.completedProjectIds.filter(
            (id) => id !== body.projectId
          );
        }
        for (const phase of path.phases) {
          for (const p of phase.projects) {
            if (p.id === body.projectId) {
              p.completed = isComp;
            }
          }
        }
      } else if (body.action === "update_weekly_hours" && typeof body.weeklyHours === "number") {
        const hours = Math.max(1, Math.min(60, Math.round(body.weeklyHours)));
        path.weeklyHoursTarget = hours;
        for (const phase of path.phases) {
          phase.estimatedWeeks = Math.max(1, Math.ceil(phase.estimatedHours / hours));
        }
        const totalWeeks = Math.ceil(path.progress.totalHours / hours);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + totalWeeks * 7);
        path.progress.targetCompletionDate = targetDate.toISOString();
      } else if (body.action === "update_goal" && body.goal) {
        path.targetGoal3to6m = body.goal.trim().slice(0, 200);
      }

      // Recompute overall progress
      const allSkills = path.phases.flatMap((p) => p.skills);
      const activeSkills = allSkills.filter((s) => s.status !== "skipped");
      const completedSkills = activeSkills.filter((s) => s.status === "completed").length;

      const allProjects = path.phases.flatMap((p) => p.projects);
      const completedProjects = allProjects.filter((p) => p.completed).length;

      path.progress.totalSkills = activeSkills.length;
      path.progress.completedSkills = completedSkills;
      path.progress.totalProjects = allProjects.length;
      path.progress.completedProjects = completedProjects;
      path.progress.overallPercentage = Math.min(
        100,
        Math.round(
          (completedSkills / Math.max(1, activeSkills.length)) * 40 +
          (completedProjects / Math.max(1, allProjects.length)) * 30 +
          (path.progress.completedHours / Math.max(1, path.progress.totalHours)) * 30
        )
      );

      rec.personalizedPath = path;

      return {
        path,
        student: toStudentData(user, rec, db),
      };
    });
  });
}

export async function DELETE() {
  return respond(async () => {
    const user = await requireUser();
    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");
      delete rec.personalizedPath;
      return {
        path: null,
        student: toStudentData(user, rec, db),
      };
    });
  });
}
