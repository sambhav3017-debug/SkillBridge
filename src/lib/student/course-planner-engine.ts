import crypto from "crypto";
import type { StudentTask, TaskType } from "./types";
import type { SkillDefinition, StudentSkillProgress } from "./skills-types";
import { getSkillById } from "./skills-catalog";
import type { DB, StudentRecord } from "@/lib/server/db";

const uid = () => crypto.randomUUID();

export interface EnrolledCourseSummary {
  skillId: string;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  instructor?: string;
  channelName?: string;
  isIndianCreator?: boolean;
  language?: string;
  percent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  remainingLessonsCount: number;
  pendingTasksCount: number;
  nextTaskTitle?: string;
  nextTaskType?: TaskType;
  nextTaskDate?: string;
  estimatedRemainingHours: number;
  totalEstimatedHours: number;
  status: "Not Started" | "In Progress" | "Paused" | "Completed";
  enrolledAt: string;
  lastAccessedAt: string;
  lastActivityTitle?: string;
  currentDay: number;
  totalDays: number;
}

/** Formats date into YYYY-MM-DD */
export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Adds N days to a date */
export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/**
 * Generates initial structured daily learning tasks for a newly enrolled course.
 * Creates Day 1 and Day 2 tasks, plus upcoming milestones, based on real course lessons.
 */
export function generateInitialCourseTasks(
  skillDef: SkillDefinition,
  existingTasks: StudentTask[] = [],
  startDateStr?: string
): StudentTask[] {
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const newTasks: StudentTask[] = [];
  const now = new Date().toISOString();

  // Check if tasks already exist for this course
  const existingCourseTaskIds = new Set(
    existingTasks
      .filter((t) => t.courseId === skillDef.id && t.lessonId)
      .map((t) => t.lessonId as string)
  );

  const lessons = skillDef.lessons || [];
  if (lessons.length === 0) return newTasks;

  // Day 1: First lesson (Lecture + Practice)
  const l1 = lessons[0];
  const day1Date = toIsoDate(startDate);

  if (!existingCourseTaskIds.has(l1.id)) {
    // 1. Lecture Task
    newTasks.push({
      id: uid(),
      title: `Day 1 Lecture — ${l1.title}`,
      description: `Watch introductory video lecture by ${l1.instructor || "SkillBridge"} and master core concepts.`,
      date: day1Date,
      startTime: "09:00",
      dueTime: "10:00",
      type: "Watch Lecture",
      priority: "High",
      completed: false,
      reminder: "30_min",
      createdAt: now,
      updatedAt: now,
      courseId: skillDef.id,
      courseName: skillDef.name,
      lessonId: l1.id,
      topic: l1.stage,
      estimatedMinutes: l1.durationMinutes || 35,
      dayNumber: 1,
      actionUrl: l1.videoUrl,
      videoUrl: l1.videoUrl,
    });

    // 2. Hands-on Practice Task
    newTasks.push({
      id: uid(),
      title: `Day 1 Hands-On — ${l1.title} Setup & Code Practice`,
      description: `Apply syntax rules from lecture 1. ${l1.summary}`,
      date: day1Date,
      startTime: "10:15",
      dueTime: "11:00",
      type: "Practice Coding",
      priority: "Medium",
      completed: false,
      reminder: "none",
      createdAt: now,
      updatedAt: now,
      courseId: skillDef.id,
      courseName: skillDef.name,
      lessonId: l1.id,
      topic: "Practical Syntax",
      estimatedMinutes: 30,
      dayNumber: 1,
    });
  }

  // Day 2: Second lesson (if available)
  if (lessons.length > 1) {
    const l2 = lessons[1];
    const day2Date = toIsoDate(addDays(startDate, 1));

    if (!existingCourseTaskIds.has(l2.id)) {
      newTasks.push({
        id: uid(),
        title: `Day 2 Lecture — ${l2.title}`,
        description: `Continue sequential progress: ${l2.summary}`,
        date: day2Date,
        startTime: "09:00",
        dueTime: "10:00",
        type: "Watch Lecture",
        priority: "High",
        completed: false,
        reminder: "30_min",
        createdAt: now,
        updatedAt: now,
        courseId: skillDef.id,
        courseName: skillDef.name,
        lessonId: l2.id,
        topic: l2.stage,
        estimatedMinutes: l2.durationMinutes || 35,
        dayNumber: 2,
        actionUrl: l2.videoUrl,
        videoUrl: l2.videoUrl,
      });

      newTasks.push({
        id: uid(),
        title: `Day 2 Checkpoint — ${l2.title} Knowledge Test`,
        description: `Verify understanding of variables, expressions, and operations before advancing.`,
        date: day2Date,
        startTime: "10:15",
        dueTime: "10:45",
        type: "Solve Quiz",
        priority: "Medium",
        completed: false,
        reminder: "none",
        createdAt: now,
        updatedAt: now,
        courseId: skillDef.id,
        courseName: skillDef.name,
        lessonId: l2.id,
        topic: "Knowledge Verification",
        estimatedMinutes: 20,
        dayNumber: 2,
      });
    }
  }

  // Day 3 Milestone (Mini Project or Lesson 3)
  if (lessons.length > 2) {
    const l3 = lessons[2];
    const day3Date = toIsoDate(addDays(startDate, 2));

    if (!existingCourseTaskIds.has(l3.id)) {
      newTasks.push({
        id: uid(),
        title: `Day 3 Lecture — ${l3.title}`,
        description: `Deepen competency: ${l3.summary}`,
        date: day3Date,
        startTime: "09:00",
        dueTime: "10:00",
        type: "Watch Lecture",
        priority: "Medium",
        completed: false,
        reminder: "none",
        createdAt: now,
        updatedAt: now,
        courseId: skillDef.id,
        courseName: skillDef.name,
        lessonId: l3.id,
        topic: l3.stage,
        estimatedMinutes: l3.durationMinutes || 40,
        dayNumber: 3,
        actionUrl: l3.videoUrl,
        videoUrl: l3.videoUrl,
      });
    }
  }

  return newTasks;
}

/**
 * Automatically assigns the next day's task after a lesson or task is completed.
 * Checks prerequisites, remaining lessons, and schedules the next activity.
 */
export function activateNextLessonTask(
  skillId: string,
  completedLessonIds: string[],
  currentTasks: StudentTask[],
  baseDate?: Date
): StudentTask | null {
  const skillDef = getSkillById(skillId);
  if (!skillDef) return null;

  const lessons = skillDef.lessons || [];
  // Find the first uncompleted lesson that does not already have an active pending task
  const assignedLessonIds = new Set(
    currentTasks
      .filter((t) => t.courseId === skillId && t.lessonId)
      .map((t) => t.lessonId as string)
  );

  const nextLesson = lessons.find(
    (l) => !completedLessonIds.includes(l.id) && !assignedLessonIds.has(l.id)
  );

  if (!nextLesson) {
    // If all lessons assigned/completed, check if there's an uncompleted practical project
    if (skillDef.projects && skillDef.projects.length > 0) {
      const proj = skillDef.projects[0];
      const hasProjTask = currentTasks.some(
        (t) => t.courseId === skillId && t.title.includes(proj.title)
      );
      if (!hasProjTask) {
        const targetDate = toIsoDate(addDays(baseDate || new Date(), 1));
        const now = new Date().toISOString();
        return {
          id: uid(),
          title: `Milestone Project — ${proj.title}`,
          description: proj.description,
          date: targetDate,
          startTime: "14:00",
          dueTime: "16:00",
          type: "Build Mini Project",
          priority: "High",
          completed: false,
          reminder: "1_day",
          createdAt: now,
          updatedAt: now,
          courseId: skillDef.id,
          courseName: skillDef.name,
          topic: proj.difficulty,
          estimatedMinutes: 90,
          dayNumber: Math.max(1, completedLessonIds.length + 1),
        };
      }
    }
    return null;
  }

  // Calculate next open study date (tomorrow or next day without high task load)
  const tomorrow = addDays(baseDate || new Date(), 1);
  const targetDateStr = toIsoDate(tomorrow);
  const now = new Date().toISOString();
  const nextLessonIndex = lessons.findIndex((l) => l.id === nextLesson.id);
  const dayNum = nextLessonIndex + 1;

  return {
    id: uid(),
    title: `Day ${dayNum} Lecture — ${nextLesson.title}`,
    description: `Next sequential topic in ${skillDef.name}: ${nextLesson.summary}`,
    date: targetDateStr,
    startTime: "09:30",
    dueTime: "10:30",
    type: "Watch Lecture",
    priority: "High",
    completed: false,
    reminder: "30_min",
    createdAt: now,
    updatedAt: now,
    courseId: skillDef.id,
    courseName: skillDef.name,
    lessonId: nextLesson.id,
    topic: nextLesson.stage,
    estimatedMinutes: nextLesson.durationMinutes || 35,
    dayNumber: dayNum,
    actionUrl: nextLesson.videoUrl,
    videoUrl: nextLesson.videoUrl,
  };
}

/**
 * Aggregates all enrolled courses for a student with detailed progress metrics,
 * pending tasks, next upcoming action, and completion status.
 */
export function getEnrolledCoursesSummary(
  studentRec: StudentRecord
): EnrolledCourseSummary[] {
  const learning = studentRec.learning || {};
  const tasks = studentRec.tasks || [];
  const summaries: EnrolledCourseSummary[] = [];

  for (const [skillId, progress] of Object.entries(learning)) {
    const skillDef = getSkillById(skillId);
    if (!skillDef) continue;

    const completedLessonIds = progress.completedLessonIds || [];
    const totalLessons = skillDef.lessons?.length || 0;
    const completedCount = completedLessonIds.length;
    const remainingCount = Math.max(0, totalLessons - completedCount);
    const percent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Course tasks
    const courseTasks = tasks.filter((t) => t.courseId === skillId);
    const pendingTasks = courseTasks.filter((t) => !t.completed);

    // Sort pending tasks by date ascending to find next task
    pendingTasks.sort((a, b) => a.date.localeCompare(b.date));
    const nextTask = pendingTasks[0];

    // Estimated remaining hours
    const estimatedHoursRemaining = Math.max(
      0,
      Math.round((skillDef.estimatedHours - (progress.hoursSpent || 0)) * 10) / 10
    );

    // Primary educator
    const firstLesson = skillDef.lessons?.[0];

    summaries.push({
      skillId,
      name: skillDef.name,
      category: skillDef.category,
      difficulty: skillDef.difficulty,
      color: skillDef.color || "#FF6A00",
      instructor: firstLesson?.instructor,
      channelName: firstLesson?.channelName,
      isIndianCreator: firstLesson?.isIndianCreator,
      language: firstLesson?.language,
      percent,
      completedLessonsCount: completedCount,
      totalLessonsCount: totalLessons,
      remainingLessonsCount: remainingCount,
      pendingTasksCount: pendingTasks.length,
      nextTaskTitle: nextTask?.title,
      nextTaskType: nextTask?.type,
      nextTaskDate: nextTask?.date,
      estimatedRemainingHours: estimatedHoursRemaining,
      totalEstimatedHours: skillDef.estimatedHours,
      status: progress.status || (percent === 100 ? "Completed" : "In Progress"),
      enrolledAt: progress.enrolledAt,
      lastAccessedAt: progress.lastAccessedAt,
      lastActivityTitle: progress.lastActivityTitle,
      currentDay: progress.currentDay || Math.min(totalLessons, completedCount + 1),
      totalDays: progress.totalDays || Math.max(7, Math.ceil(totalLessons * 1.5)),
    });
  }

  // Sort by last accessed date descending
  summaries.sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt));
  return summaries;
}
