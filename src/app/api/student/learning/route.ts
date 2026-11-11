import { respond, readJson, ApiError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readDb } from "@/lib/server/db";
import { toStudentData } from "@/lib/server/student-service";
import type { StudentSkillProgress } from "@/lib/student/skills-types";
import type { Skill, Proficiency, StudentTask } from "@/lib/student/types";
import { getSkillById } from "@/lib/student/skills-catalog";
import {
  generateInitialCourseTasks,
  activateNextLessonTask,
  getEnrolledCoursesSummary,
  toIsoDate,
} from "@/lib/student/course-planner-engine";
import crypto from "crypto";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student record not found.");
    return {
      learning: rec.learning ?? {},
      enrolledCourses: getEnrolledCoursesSummary(rec),
      profileSkills: rec.skills ?? [],
      tasks: rec.tasks ?? [],
    };
  });
}

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = (await readJson(req)) as {
      action:
        | "enroll"
        | "pause_course"
        | "resume_course"
        | "toggle_lesson"
        | "toggle_project"
        | "record_quiz"
        | "add_to_profile"
        | "reschedule_task"
        | "complete_learning_task";
      skillId: string;
      lessonId?: string;
      projectId?: string;
      taskId?: string;
      newDate?: string;
      completed?: boolean;
      score?: number;
      level?: Proficiency;
      weeklyTargetHours?: number;
      hoursSpent?: number;
    };

    if (!body || !body.action) {
      throw new ApiError(400, "Missing required parameters.");
    }

    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student record not found.");
      if (!rec.learning) rec.learning = {};
      if (!rec.tasks) rec.tasks = [];

      let skillId = body.skillId;
      if (!skillId && body.taskId) {
        const matched = rec.tasks.find((t) => t.id === body.taskId);
        if (matched?.courseId) skillId = matched.courseId;
      }

      if (!skillId && body.action !== "reschedule_task") {
        throw new ApiError(400, "Missing required skillId parameter.");
      }

      const skillDef = skillId ? getSkillById(skillId) : null;
      if (skillId && !skillDef) {
        throw new ApiError(404, `Skill "${skillId}" not found in catalog.`);
      }

      if (body.action !== "reschedule_task" && !skillDef) {
        throw new ApiError(400, "A valid skill definition is required for this action.");
      }

      const safeSkillDef = skillDef!;

      const now = new Date().toISOString();
      const existingProgress = skillId ? rec.learning[skillId] : undefined;
      const isAlreadyEnrolled = !!existingProgress;

      const currentProgress: StudentSkillProgress = existingProgress || {
        skillId: skillId || "",
        enrolledAt: now,
        lastAccessedAt: now,
        completedLessonIds: [],
        completedProjectIds: [],
        status: "In Progress",
        hoursSpent: 0,
        weeklyTargetHours: body.weeklyTargetHours || 8,
        currentDay: 1,
        totalDays: Math.max(7, Math.ceil((skillDef?.lessons?.length || 5) * 1.5)),
      };

      currentProgress.lastAccessedAt = now;

      // 1. ENROLL IN COURSE
      if (body.action === "enroll") {
        currentProgress.status = "In Progress";
        currentProgress.weeklyTargetHours = body.weeklyTargetHours || currentProgress.weeklyTargetHours || 8;

        // Auto-generate initial smart learning schedule if not already created
        const initialTasks = generateInitialCourseTasks(safeSkillDef, rec.tasks, toIsoDate(new Date()));
        if (initialTasks.length > 0) {
          rec.tasks = [...rec.tasks, ...initialTasks];
        }

        // Record notification/activity
        if (!db.activities) db.activities = [];
        db.activities.unshift({
          id: crypto.randomUUID(),
          companyId: "system",
          text: `${user.name} enrolled in ${safeSkillDef.name} (${safeSkillDef.difficulty} level, ${safeSkillDef.estimatedHours} hrs).`,
          href: `/student/skills?skill=${safeSkillDef.id}`,
          createdAt: now,
        });
      }

      // 2. PAUSE COURSE
      else if (body.action === "pause_course") {
        currentProgress.status = "Paused";
      }

      // 3. RESUME COURSE
      else if (body.action === "resume_course") {
        currentProgress.status = "In Progress";
      }

      // 4. TOGGLE LESSON PROGRESS & AUTO-SCHEDULE NEXT TASK
      else if (body.action === "toggle_lesson" && body.lessonId) {
        const isCompleted = body.completed !== false;
        const matchingLesson = safeSkillDef.lessons.find((l) => l.id === body.lessonId);

        if (isCompleted) {
          if (!currentProgress.completedLessonIds.includes(body.lessonId)) {
            currentProgress.completedLessonIds.push(body.lessonId);
            currentProgress.hoursSpent += Math.round(((matchingLesson?.durationMinutes || 30) / 60) * 10) / 10;
            currentProgress.lastActivityTitle = matchingLesson?.title;
          }

          // Mark corresponding task as completed if present
          const linkedTask = rec.tasks.find(
            (t) => t.courseId === body.skillId && t.lessonId === body.lessonId && !t.completed
          );
          if (linkedTask) {
            linkedTask.completed = true;
            linkedTask.completedAt = now;
            linkedTask.updatedAt = now;
          }

          // Automatically schedule the next incomplete lesson task for tomorrow
          const nextTask = activateNextLessonTask(
            body.skillId,
            currentProgress.completedLessonIds,
            rec.tasks
          );
          if (nextTask) {
            rec.tasks.push(nextTask);
          }
        } else {
          currentProgress.completedLessonIds = currentProgress.completedLessonIds.filter(
            (id) => id !== body.lessonId
          );
        }

        // Check if all lessons are completed
        if (
          safeSkillDef.lessons.length > 0 &&
          currentProgress.completedLessonIds.length >= safeSkillDef.lessons.length
        ) {
          currentProgress.status = "Completed";
          currentProgress.completedAt = now;
        } else if (currentProgress.status === "Completed") {
          currentProgress.status = "In Progress";
        }
      }

      // 5. COMPLETE LEARNING TASK (FROM DASHBOARD)
      else if (body.action === "complete_learning_task" && body.taskId) {
        const targetTask = rec.tasks.find((t) => t.id === body.taskId);
        if (targetTask) {
          targetTask.completed = body.completed !== false;
          targetTask.completedAt = targetTask.completed ? now : undefined;
          targetTask.updatedAt = now;

          // If linked to a lesson, mark lesson completed
          if (targetTask.lessonId && targetTask.completed) {
            if (!currentProgress.completedLessonIds.includes(targetTask.lessonId)) {
              currentProgress.completedLessonIds.push(targetTask.lessonId);
              currentProgress.hoursSpent += Math.round(((targetTask.estimatedMinutes || 30) / 60) * 10) / 10;
            }
          }

          // Auto-schedule next task if this was completed
          if (targetTask.completed) {
            const effectiveSkillId = skillId || targetTask.courseId || "";
            const nextTask = activateNextLessonTask(
              effectiveSkillId,
              currentProgress.completedLessonIds,
              rec.tasks
            );
            if (nextTask) {
              rec.tasks.push(nextTask);
            }
          }
        }
      }

      // 6. RESCHEDULE TASK
      else if (body.action === "reschedule_task" && body.taskId && body.newDate) {
        const targetTask = rec.tasks.find((t) => t.id === body.taskId);
        if (targetTask) {
          targetTask.date = body.newDate;
          targetTask.updatedAt = now;
        }
      }

      // 7. TOGGLE PROJECT
      else if (body.action === "toggle_project" && body.projectId) {
        const isCompleted = body.completed !== false;
        if (isCompleted) {
          if (!currentProgress.completedProjectIds.includes(body.projectId)) {
            currentProgress.completedProjectIds.push(body.projectId);
            currentProgress.hoursSpent += 1.5;
          }
        } else {
          currentProgress.completedProjectIds = currentProgress.completedProjectIds.filter(
            (id) => id !== body.projectId
          );
        }
      }

      // 8. RECORD QUIZ
      else if (body.action === "record_quiz" && typeof body.score === "number") {
        currentProgress.quizScore = Math.max(0, Math.min(100, Math.round(body.score)));
      }

      // 9. ADD TO PROFILE
      else if (body.action === "add_to_profile" && skillDef) {
        const level: Proficiency = body.level || skillDef.difficulty;
        if (!rec.skills) rec.skills = [];

        const existingIndex = rec.skills.findIndex(
          (s) => s.name.toLowerCase() === skillDef.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          rec.skills[existingIndex] = {
            ...rec.skills[existingIndex],
            level,
          };
        } else {
          const newSkill: Skill = {
            id: crypto.randomUUID(),
            name: skillDef.name,
            level,
          };
          rec.skills.push(newSkill);
        }
      }

      // Save updated progress
      if (skillId) {
        rec.learning[skillId] = currentProgress;
      }

      return {
        alreadyEnrolled: isAlreadyEnrolled,
        progress: currentProgress,
        enrolledCourses: getEnrolledCoursesSummary(rec),
        tasks: rec.tasks,
        student: toStudentData(user, rec, db),
      };
    });
  });
}
