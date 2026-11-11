/**
 * Student–Academia Learning Synchronization Engine
 * Pure business logic for transforming student records into synchronized institutional profiles
 * and computing institution-wide analytics respecting granular sharing preferences.
 */

import { SKILLS_CATALOG } from "@/lib/student/skills-catalog";
import type { DB, UserRecord } from "@/lib/server/db";
import type {
  StudentLearningProfile,
  InstitutionalLearningAnalytics,
  SyncedCourseRecord,
  SyncedSkillRecord,
  SyncedCertificateRecord,
  SyncedProjectRecord,
  SyncedTimelineEvent,
  StudentAcademicSharingPrefs,
  DEFAULT_SHARING_PREFS,
} from "./learning-sync-types";

/**
 * Builds the synchronized learning profile for a student, respecting their privacy/sharing preferences.
 */
export function buildStudentLearningProfile(
  studentUser: UserRecord,
  studentRec: DB["students"][string],
  options: {
    institutionId: string;
    studentIdCode?: string;
  }
): StudentLearningProfile {
  const sharing: StudentAcademicSharingPrefs = (studentRec as any).academicSharingPrefs || {
    shareCourseEnrollmentAndProgress: true,
    shareSkillDevelopment: true,
    shareCertificates: true,
    shareProjectsAndPracticalWork: true,
    shareActivityTimeline: true,
    lastSyncTimestamp: new Date().toISOString(),
  };

  const learning = studentRec.learning || {};
  const tasks = studentRec.tasks || [];
  const profile = studentRec.profile || ({} as any);

  // 1. Process Courses
  const rawCourses: SyncedCourseRecord[] = [];
  let totalHoursLearned = 0;
  let activeCoursesCount = 0;
  let completedCoursesCount = 0;
  let completedLessonsTotal = 0;
  let completedTasksTotal = tasks.filter((t) => t.completed).length;
  let pendingTasksTotal = tasks.filter((t) => !t.completed).length;

  for (const [skillId, prog] of Object.entries(learning)) {
    const skillDef = SKILLS_CATALOG.find((s) => s.id === skillId);
    if (!skillDef) continue;

    const completedLessons = prog.completedLessonIds || [];
    const totalLessons = skillDef.lessons.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const courseTasks = tasks.filter((t) => t.courseId === skillId);
    const pendingCourseTasks = courseTasks.filter((t) => !t.completed).length;
    const completedCourseTasks = courseTasks.filter((t) => t.completed).length;

    const isCompleted = prog.status === "Completed" || (totalLessons > 0 && completedLessons.length >= totalLessons);
    const status = isCompleted ? "Completed" : prog.status || "In Progress";

    if (isCompleted) completedCoursesCount++;
    else if (status === "In Progress") activeCoursesCount++;

    totalHoursLearned += prog.hoursSpent || 0;
    completedLessonsTotal += completedLessons.length;

    // Next scheduled topic
    const nextLesson = skillDef.lessons.find((l) => !completedLessons.includes(l.id));

    rawCourses.push({
      courseId: skillDef.id,
      courseName: skillDef.name,
      category: skillDef.category,
      difficulty: skillDef.difficulty,
      color: skillDef.color,
      enrolledAt: prog.lastAccessedAt || new Date().toISOString(),
      status,
      progressPercent,
      completedLessonsCount: completedLessons.length,
      totalLessonsCount: totalLessons,
      remainingLessonsCount: Math.max(0, totalLessons - completedLessons.length),
      pendingTasksCount: pendingCourseTasks,
      completedTasksCount: completedCourseTasks,
      hoursSpent: prog.hoursSpent || 0,
      lastActivityAt: prog.lastAccessedAt || new Date().toISOString(),
      lastActivityTitle: prog.lastActivityTitle || (completedLessons.length > 0 ? `Completed lesson` : "Enrolled"),
      nextScheduledTopic: nextLesson?.title || (isCompleted ? "Course Finished" : undefined),
      completedAt: prog.completedAt,
    });
  }

  // 2. Process Skills (Distinguishing Origin)
  const rawSkills: SyncedSkillRecord[] = [];
  const profileSkills = studentRec.skills || [];
  let verifiedSkillsCount = 0;
  let learningSkillsCount = 0;

  // Track profile skills (self-declared or verified)
  for (const sk of profileSkills) {
    const enrolledCourse = rawCourses.find((c) => c.courseName.toLowerCase() === sk.name.toLowerCase());
    const isCompletedCourse = enrolledCourse && enrolledCourse.status === "Completed";
    const origin = isCompletedCourse ? "course_completed" : "self_declared";
    const originLabel = isCompletedCourse ? "Course Completed" : "Self-Declared";

    if (isCompletedCourse) verifiedSkillsCount++;

    rawSkills.push({
      id: sk.id,
      name: sk.name,
      level: sk.level,
      origin,
      originLabel,
      courseId: enrolledCourse?.courseId,
      courseName: enrolledCourse?.courseName,
      lastDemonstratedAt: enrolledCourse?.lastActivityAt,
    });
  }

  // Add currently learning courses that aren't yet in student's profile skills
  for (const crs of rawCourses) {
    if (!rawSkills.some((s) => s.name.toLowerCase() === crs.courseName.toLowerCase())) {
      learningSkillsCount++;
      rawSkills.push({
        id: `learning-${crs.courseId}`,
        name: crs.courseName,
        level: crs.difficulty === "Advanced" ? "Advanced" : crs.difficulty === "Intermediate" ? "Intermediate" : "Beginner",
        origin: "currently_learning",
        originLabel: "Currently Learning",
        courseId: crs.courseId,
        courseName: crs.courseName,
        lastDemonstratedAt: crs.lastActivityAt,
      });
    }
  }

  // 3. Process Certificates
  const rawCerts: SyncedCertificateRecord[] = (studentRec.certifications || []).map((c) => {
    // Derive verification status or default to Pending Verification/Verified if has URL
    const isVerified = (c as any).verificationStatus === "Verified";
    const status = (c as any).verificationStatus || (c.credentialUrl ? "Verified" : "Pending Verification");

    return {
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate,
      expiryDate: (c as any).expiryDate,
      verificationStatus: status,
      credentialUrl: c.credentialUrl,
      verifiedBy: (c as any).verifiedBy,
      verifiedAt: (c as any).verifiedAt,
      verificationNotes: (c as any).verificationNotes,
    };
  });

  const verifiedCertsCount = rawCerts.filter((c) => c.verificationStatus === "Verified").length;
  const pendingCertsCount = rawCerts.filter((c) => c.verificationStatus === "Pending Verification").length;

  // 4. Process Projects
  const rawProjects: SyncedProjectRecord[] = (studentRec.projects || []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    technologies: p.technologies || [],
    url: p.url,
    submissionDate: (p as any).submissionDate || new Date().toISOString().split("T")[0],
    completionStatus: "Completed",
    assessmentStatus: (p as any).assessmentStatus || "Reviewed",
    relatedSkillIds: (p as any).relatedSkillIds,
  }));

  // 5. Build Chronological Timeline
  const rawTimeline: SyncedTimelineEvent[] = [];

  // Courses milestones
  for (const crs of rawCourses) {
    rawTimeline.push({
      id: `timeline-enroll-${crs.courseId}`,
      studentId: studentUser.id,
      activityType: "Course Enrolled",
      activityCategory: "course",
      title: `Enrolled in ${crs.courseName}`,
      description: `Started ${crs.difficulty} level course with ${crs.totalLessonsCount} lessons.`,
      relatedEntityName: crs.courseName,
      timestamp: crs.enrolledAt,
      status: "Milestone",
    });

    if (crs.status === "Completed") {
      rawTimeline.push({
        id: `timeline-comp-${crs.courseId}`,
        studentId: studentUser.id,
        activityType: "Skill Acquired",
        activityCategory: "skill",
        title: `Completed ${crs.courseName}`,
        description: `Successfully completed all ${crs.totalLessonsCount} syllabus lessons and practical work.`,
        relatedEntityName: crs.courseName,
        timestamp: crs.completedAt || crs.lastActivityAt,
        status: "Completed",
      });
    }
  }

  // Completed daily tasks
  for (const t of tasks.filter((t) => t.completed)) {
    rawTimeline.push({
      id: `timeline-task-${t.id}`,
      studentId: studentUser.id,
      activityType:
        t.type === "Watch Lecture"
          ? "Video Lecture Watched"
          : t.type === "Practice Coding"
          ? "Coding Practice Finished"
          : t.type === "Solve Quiz"
          ? "Quiz Passed"
          : "Daily Task Completed",
      activityCategory: t.type === "Solve Quiz" ? "assessment" : "course",
      title: t.title,
      description: t.description || `Completed task on Day ${t.dayNumber || 1}.`,
      relatedEntityName: t.courseName,
      timestamp: (t as any).completedAt || new Date().toISOString(),
      status: "Completed",
    });
  }

  // Certificates
  for (const cert of rawCerts) {
    rawTimeline.push({
      id: `timeline-cert-${cert.id}`,
      studentId: studentUser.id,
      activityType: "Certificate Earned",
      activityCategory: "certificate",
      title: `Earned Certificate: ${cert.title}`,
      description: `Issued by ${cert.issuer} (${cert.verificationStatus}).`,
      relatedEntityName: cert.title,
      timestamp: `${cert.issueDate}T12:00:00.000Z`,
      status: "Completed",
    });
  }

  // Projects
  for (const prj of rawProjects) {
    rawTimeline.push({
      id: `timeline-prj-${prj.id}`,
      studentId: studentUser.id,
      activityType: "Project Submitted",
      activityCategory: "project",
      title: `Submitted Project: ${prj.title}`,
      description: prj.description.slice(0, 120),
      relatedEntityName: prj.title,
      timestamp: `${prj.submissionDate}T12:00:00.000Z`,
      status: "Submitted",
    });
  }

  // Sort timeline newest first
  rawTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply Transparent Sharing Filter Permissions
  return {
    studentId: studentUser.id,
    studentName: studentUser.name,
    studentEmail: studentUser.email,
    studentIdCode: options.studentIdCode || `SB-${studentUser.id.slice(0, 6).toUpperCase()}`,
    college: profile.college || "Academic Institution",
    department: profile.branch || "Computer Science",
    program: profile.degree || "B.Tech / B.E.",
    year: profile.year || "4th Year",
    gradYear: profile.gradYear || "2026",
    syncStatus: "Synced",
    lastSynchronizedAt: sharing.lastSyncTimestamp || new Date().toISOString(),
    sharingPreferences: sharing,

    // Filtered arrays based on student consent
    courses: sharing.shareCourseEnrollmentAndProgress ? rawCourses : [],
    skills: sharing.shareSkillDevelopment ? rawSkills : [],
    certificates: sharing.shareCertificates ? rawCerts : [],
    projects: sharing.shareProjectsAndPracticalWork ? rawProjects : [],
    timeline: sharing.shareActivityTimeline ? rawTimeline : [],

    metrics: {
      activeCoursesCount,
      completedCoursesCount,
      totalHoursLearned: Math.round(totalHoursLearned * 10) / 10,
      completedLessonsCount: completedLessonsTotal,
      completedTasksCount: completedTasksTotal,
      pendingTasksCount: pendingTasksTotal,
      verifiedSkillsCount,
      learningSkillsCount,
      verifiedCertsCount,
      pendingCertsCount,
    },
  };
}

/**
 * Computes institution-wide learning analytics across all matching students.
 */
export function computeInstitutionalAnalytics(
  institutionId: string,
  institutionName: string,
  studentProfiles: StudentLearningProfile[]
): InstitutionalLearningAnalytics {
  let totalActiveCourseEnrollments = 0;
  let totalCoursesCompleted = 0;
  let totalTasksCompleted = 0;
  let totalCertsEarned = 0;
  let totalCertsPending = 0;
  let studentsActivelyLearning = 0;
  let studentsWithCourses = 0;

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;
  let studentsRecentlyActive = 0;

  const skillCounts = new Map<string, { count: number; category: string }>();
  const courseCounts = new Map<string, { count: number; category: string; difficulty: string }>();
  const completionBuckets = { "0-25%": 0, "26-50%": 0, "51-75%": 0, "76-100%": 0 };
  const deptSkills = new Map<string, Map<string, number>>();
  const progCerts = new Map<string, number>();
  const recentEvents: InstitutionalLearningAnalytics["recentlyActiveStudents"] = [];

  for (const st of studentProfiles) {
    if (st.courses.length > 0) studentsWithCourses++;
    if (st.metrics.activeCoursesCount > 0) studentsActivelyLearning++;

    totalActiveCourseEnrollments += st.metrics.activeCoursesCount;
    totalCoursesCompleted += st.metrics.completedCoursesCount;
    totalTasksCompleted += st.metrics.completedTasksCount;
    totalCertsEarned += st.metrics.verifiedCertsCount;
    totalCertsPending += st.metrics.pendingCertsCount;

    // Check recent activity
    const isRecent = st.timeline.some((ev) => new Date(ev.timestamp).getTime() >= sevenDaysAgo);
    if (isRecent) studentsRecentlyActive++;

    // Add recent events
    for (const ev of st.timeline.slice(0, 2)) {
      recentEvents.push({
        studentId: st.studentId,
        studentName: st.studentName,
        department: st.department,
        activityTitle: ev.title,
        activityType: ev.activityType,
        timestamp: ev.timestamp,
      });
    }

    // Courses & Completion distribution
    for (const crs of st.courses) {
      const existing = courseCounts.get(crs.courseName) || {
        count: 0,
        category: crs.category,
        difficulty: crs.difficulty,
      };
      existing.count++;
      courseCounts.set(crs.courseName, existing);

      if (crs.progressPercent <= 25) completionBuckets["0-25%"]++;
      else if (crs.progressPercent <= 50) completionBuckets["26-50%"]++;
      else if (crs.progressPercent <= 75) completionBuckets["51-75%"]++;
      else completionBuckets["76-100%"]++;
    }

    // Skills
    for (const sk of st.skills) {
      const existing = skillCounts.get(sk.name) || { count: 0, category: "Technology" };
      existing.count++;
      skillCounts.set(sk.name, existing);

      // Dept skill mapping
      if (!deptSkills.has(st.department)) deptSkills.set(st.department, new Map());
      const dMap = deptSkills.get(st.department)!;
      dMap.set(sk.name, (dMap.get(sk.name) || 0) + 1);
    }

    // Certificates by program
    const pC = progCerts.get(st.program) || 0;
    progCerts.set(st.program, pC + st.certificates.length);
  }

  // Format popular skills
  const popularSkills = Array.from(skillCounts.entries())
    .map(([skillName, v]) => ({ skillName, studentCount: v.count, category: v.category }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 8);

  // Format popular courses
  const mostEnrolledCourses = Array.from(courseCounts.entries())
    .map(([courseName, v]) => ({ courseName, count: v.count, category: v.category, difficulty: v.difficulty }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Format completion distribution
  const totalCourses = Math.max(1, totalActiveCourseEnrollments + totalCoursesCompleted);
  const completionDistribution = Object.entries(completionBuckets).map(([range, count]) => ({
    range,
    count,
    percentage: Math.round((count / totalCourses) * 100),
  }));

  // Format department top skills
  const skillsByDepartment = Array.from(deptSkills.entries()).map(([department, m]) => {
    let topSkill = "Foundations";
    let max = 0;
    for (const [sk, count] of m.entries()) {
      if (count > max) {
        max = count;
        topSkill = sk;
      }
    }
    return { department, topSkill, count: max };
  });

  // Format certs by program
  const certificatesByProgram = Array.from(progCerts.entries()).map(([program, count]) => ({
    program,
    count,
  }));

  // Sort recent events
  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    institutionId,
    institutionName,
    computedAt: new Date().toISOString(),
    metrics: {
      totalEnrolledStudents: studentProfiles.length,
      studentsActivelyLearning,
      studentsWithCourses,
      totalActiveCourseEnrollments,
      totalCoursesCompleted,
      skillsCurrentlyDeveloped: skillCounts.size,
      certificatesEarned: totalCertsEarned,
      certificatesPendingVerification: totalCertsPending,
      learningTasksCompleted: totalTasksCompleted,
      studentsRecentlyActive7Days: studentsRecentlyActive,
    },
    popularSkills,
    mostEnrolledCourses,
    completionDistribution,
    skillsByDepartment,
    certificatesByProgram,
    recentlyActiveStudents: recentEvents.slice(0, 10),
  };
}
