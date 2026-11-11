/** Shared (client + server) types for the SkillBridge student experience. */

export const PROFICIENCY = ["Beginner", "Intermediate", "Advanced"] as const;
export type Proficiency = (typeof PROFICIENCY)[number];

export const OPP_TYPES = ["Internship", "Full-time Job", "Freelance", "Project", "Hackathon"] as const;
export type OppType = (typeof OPP_TYPES)[number];

export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const APP_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export interface Skill {
  id: string;
  name: string;
  level: Proficiency;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  credentialUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Preferences {
  types: OppType[];
  modes: WorkMode[];
  roles: string[];
  areas: string[];
}

export interface Profile {
  avatar: string; // data: URL, or "" for initials avatar
  headline: string;
  bio: string;
  college: string;
  degree: string;
  branch: string;
  year: string; // current year / semester
  gradYear: string;
  linkedin: string;
  github: string;
  portfolio: string;
  preferences: Preferences;
  onboarded: boolean;
}

export interface Application {
  id: string;
  opportunityId: string;
  appliedAt: string; // ISO
  status: AppStatus;
}

export interface ResumeInfo {
  name: string;
  size: number;
  uploadedAt: string;
}

export interface StudentInterviewSummary {
  id: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  type: "Online" | "Phone" | "In-person";
  locationOrLink: string;
  round: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
}

export type CodingPlatform = "github" | "leetcode" | "codechef" | "skillbridge";
export type CodingAccountStatus = "connected" | "not_connected" | "syncing" | "synced" | "sync_failed";

export interface CodingMetrics {
  reposCount?: number;
  commitsCount?: number;
  prsCount?: number;
  problemsSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  contestRating?: number;
  globalRank?: number;
  stars?: number;
  contestsAttended?: number;
}

export interface CodingAccountSummary {
  platform: CodingPlatform;
  username: string;
  status: CodingAccountStatus;
  connectedAt: string;
  lastSyncedAt?: string;
  lastError?: string;
  profileUrl: string;
  avatarUrl?: string;
  metrics?: CodingMetrics;
}

export interface CodingActivityItem {
  id: string;
  studentId: string;
  platform: CodingPlatform;
  activityType: "commit" | "pull_request" | "issue" | "problem_solved" | "contest" | "project_milestone";
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  metricValue: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  skillTopic?: string;
  externalUrl?: string;
}

export interface UnifiedCodingStats {
  totalProblemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalCommits: number;
  reposContributed: number;
  contestsAttended: number;
  activeStreakDays: number;
  longestStreakDays: number;
  activeDaysLast30: number;
  activeDaysLastYear: number;
  leetcodeRating?: number;
  codechefRating?: number;
  codechefStars?: number;
}

export const TASK_TYPES = [
  "Personal Task",
  "Assignment",
  "Exam",
  "Project Deadline",
  "Interview",
  "Meeting",
  "Study Session",
  "General Reminder",
  "Watch Lecture",
  "Read Learning Material",
  "Practice Coding",
  "Complete Assignment",
  "Solve Quiz",
  "Build Mini Project",
  "Review Previous Topic",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["Upcoming", "Due Today", "Overdue", "Completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const REMINDER_SETTINGS = [
  "none",
  "at_time",
  "15_min",
  "30_min",
  "1_hour",
  "1_day",
] as const;
export type ReminderSetting = (typeof REMINDER_SETTINGS)[number];

export interface StudentTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  dueTime?: string; // HH:mm
  type: TaskType;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  reminder: ReminderSetting;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  // Smart Learning Planner attributes
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  topic?: string;
  estimatedMinutes?: number;
  dayNumber?: number;
  actionUrl?: string;
  videoUrl?: string;
}

export interface StudentData {
  user: { id: string; email: string; name: string };
  profile: Profile;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  saved: string[];
  applications: Application[];
  resume: ResumeInfo | null;
  interviews?: StudentInterviewSummary[];
  codingAccounts?: CodingAccountSummary[];
  codingStats?: UnifiedCodingStats;
  codingActivities?: CodingActivityItem[];
  tasks?: StudentTask[];
  learning?: Record<string, import("./skills-types").StudentSkillProgress>;
  personalizedPath?: import("./personalized-path-types").PersonalizedLearningPath;
}

export interface Opportunity {
  id: string;
  title: string;
  org: string;
  type: OppType;
  mode: WorkMode;
  location: string;
  skills: string[];
  postedAt: string; // ISO
  deadline: string; // ISO
  description: string;
  /** True for the built-in sample catalogue; false for published company listings. */
  sample: boolean;
  companyId?: string;
  department?: string;
  salaryRange?: string;
  openings?: number;
}

export const EMPTY_PREFERENCES: Preferences = { types: [], modes: [], roles: [], areas: [] };

export const EMPTY_PROFILE: Profile = {
  avatar: "",
  headline: "",
  bio: "",
  college: "",
  degree: "",
  branch: "",
  year: "",
  gradYear: "",
  linkedin: "",
  github: "",
  portfolio: "",
  preferences: EMPTY_PREFERENCES,
  onboarded: false,
};
