/**
 * Student–Academia Learning Synchronization Types & Permissions
 */

import type { Proficiency, Certification, Project, Skill } from "@/lib/student/types";
import type { StudentSkillProgress } from "@/lib/student/skills-types";

export type VerificationStatus =
  | "Verified"
  | "Pending Verification"
  | "Unverified"
  | "Rejected"
  | "Expired";

export type SkillOrigin =
  | "self_declared"
  | "currently_learning"
  | "course_completed"
  | "assessed"
  | "verified";

export type SyncStatus = "Synced" | "Pending" | "Failed" | "Requires Review";

export type LearningActivityType =
  | "Course Enrolled"
  | "Started Learning Path"
  | "Lesson Completed"
  | "Video Lecture Watched"
  | "Daily Task Completed"
  | "Coding Practice Finished"
  | "Quiz Passed"
  | "Project Submitted"
  | "Skill Acquired"
  | "Certificate Earned";

/** Transparent Student Sharing Preferences */
export interface StudentAcademicSharingPrefs {
  shareCourseEnrollmentAndProgress: boolean;
  shareSkillDevelopment: boolean;
  shareCertificates: boolean;
  shareProjectsAndPracticalWork: boolean;
  shareActivityTimeline: boolean;
  lastSyncTimestamp: string;
}

export const DEFAULT_SHARING_PREFS: StudentAcademicSharingPrefs = {
  shareCourseEnrollmentAndProgress: true,
  shareSkillDevelopment: true,
  shareCertificates: true,
  shareProjectsAndPracticalWork: true,
  shareActivityTimeline: true,
  lastSyncTimestamp: new Date().toISOString(),
};

/** Synchronized Single Course Record */
export interface SyncedCourseRecord {
  courseId: string;
  courseName: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  enrolledAt: string;
  status: "Not Started" | "In Progress" | "Paused" | "Completed";
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  remainingLessonsCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  hoursSpent: number;
  lastActivityAt: string;
  lastActivityTitle?: string;
  nextScheduledTopic?: string;
  completedAt?: string;
}

/** Synchronized Enriched Skill Record with Origin */
export interface SyncedSkillRecord {
  id: string;
  name: string;
  level: Proficiency;
  origin: SkillOrigin;
  originLabel: string;
  courseId?: string;
  courseName?: string;
  lastDemonstratedAt?: string;
  assessmentScore?: number;
  evidenceUrl?: string;
}

/** Synchronized Certificate Record */
export interface SyncedCertificateRecord {
  id: string;
  title: string;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string;
  verificationStatus: VerificationStatus;
  credentialUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

/** Synchronized Project Record */
export interface SyncedProjectRecord {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  submissionDate: string;
  completionStatus: "Completed" | "In Progress";
  assessmentStatus?: "Passed" | "Reviewed" | "Pending Review";
  relatedSkillIds?: string[];
}

/** Chronological Timeline Event */
export interface SyncedTimelineEvent {
  id: string;
  studentId: string;
  activityType: LearningActivityType;
  activityCategory: "course" | "skill" | "certificate" | "project" | "assessment";
  title: string;
  description: string;
  relatedEntityName?: string;
  timestamp: string; // ISO
  status: "Completed" | "Submitted" | "Milestone" | "In Progress";
}

/** Complete Synchronized Student Learning Profile (for Academia consumption) */
export interface StudentLearningProfile {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentIdCode: string;
  college: string;
  department: string;
  program: string;
  year: string;
  gradYear: string;
  syncStatus: SyncStatus;
  lastSynchronizedAt: string;
  sharingPreferences: StudentAcademicSharingPrefs;
  
  // Categorized Learning Data (subject to sharingPreferences)
  courses: SyncedCourseRecord[];
  skills: SyncedSkillRecord[];
  certificates: SyncedCertificateRecord[];
  projects: SyncedProjectRecord[];
  timeline: SyncedTimelineEvent[];

  // Aggregated Quick Metrics
  metrics: {
    activeCoursesCount: number;
    completedCoursesCount: number;
    totalHoursLearned: number;
    completedLessonsCount: number;
    completedTasksCount: number;
    pendingTasksCount: number;
    verifiedSkillsCount: number;
    learningSkillsCount: number;
    verifiedCertsCount: number;
    pendingCertsCount: number;
  };
}

/** Institution-Wide Student Learning Analytics Summary */
export interface InstitutionalLearningAnalytics {
  institutionId: string;
  institutionName: string;
  computedAt: string;
  
  metrics: {
    totalEnrolledStudents: number;
    studentsActivelyLearning: number;
    studentsWithCourses: number;
    totalActiveCourseEnrollments: number;
    totalCoursesCompleted: number;
    skillsCurrentlyDeveloped: number;
    certificatesEarned: number;
    certificatesPendingVerification: number;
    learningTasksCompleted: number;
    studentsRecentlyActive7Days: number;
  };

  popularSkills: { skillName: string; studentCount: number; category: string }[];
  mostEnrolledCourses: { courseName: string; count: number; category: string; difficulty: string }[];
  completionDistribution: { range: string; count: number; percentage: number }[];
  skillsByDepartment: { department: string; topSkill: string; count: number }[];
  certificatesByProgram: { program: string; count: number }[];
  recentlyActiveStudents: {
    studentId: string;
    studentName: string;
    department: string;
    activityTitle: string;
    activityType: LearningActivityType;
    timestamp: string;
  }[];
}
