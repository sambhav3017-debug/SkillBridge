/** Shared (client + server) types for the SkillBridge Industry / Recruiter portal. */

import type { AppStatus, Certification, OppType, Project, Skill, WorkMode } from "@/lib/student/types";

export const INDUSTRY_CATEGORIES = [
  "Software & Cloud",
  "AI & Data Science",
  "Fintech & Banking",
  "Cybersecurity",
  "E-commerce & Consumer",
  "EdTech",
  "Healthtech & Biotech",
  "Hardware, IoT & Robotics",
  "Consulting & IT Services",
  "Design & Creative",
  "Other",
] as const;

export const COMPANY_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–1,000 employees",
  "1,000+ employees",
] as const;

export const JOB_TYPES = [
  "Internship",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Project",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["Draft", "Published", "Paused", "Closed", "Expired"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const ATS_STAGES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;
export type AtsStage = AppStatus;

export const VERIFICATION_STATES = [
  "not_submitted",
  "pending_review",
  "verified",
  "changes_requested",
] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export const TEAM_ROLES = ["Company Admin", "Recruiter", "Interviewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const INTERVIEW_TYPES = ["Online", "Phone", "In-person"] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_STATUSES = ["Scheduled", "Completed", "Cancelled", "Rescheduled"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const EVENT_TYPES = [
  "Campus Recruitment Drive",
  "Information Session",
  "Virtual Recruiting Session",
  "Career Fair",
  "Technical Workshop",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ["Draft", "Upcoming", "Completed", "Cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface HiringPreferences {
  roles: string[];
  skills: string[];
  hireInterns: boolean;
  hireGraduates: boolean;
  locations: string[];
  modes: WorkMode[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  logo: string; // data URL or ""
  coverImage: string; // data URL or ""
  website: string;
  industry: string;
  size: string;
  headquarters: string;
  description: string;
  mission: string;
  techAreas: string[];
  verificationStatus: VerificationState;
  verificationSubmittedAt?: string;
  verificationNote?: string;
  hiringPreferences: HiringPreferences;
  createdAt: string;
}

export interface NotificationPrefs {
  newApplications: boolean;
  stageChanges: boolean;
  interviewReminders: boolean;
  jobDeadlines: boolean;
  teamUpdates: boolean;
}

export interface RecruiterProfile {
  userId: string;
  companyId: string;
  name: string;
  email: string;
  jobTitle: string;
  role: TeamRole;
  contactPreference: "Email" | "In-app messages" | "Both";
  notifications: NotificationPrefs;
  savedCandidateIds: string[];
  onboarded: boolean;
}

export interface JobListing {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  type: JobType;
  department: string;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills: string[];
  eligibility: string;
  degreeRequirement: string;
  gradYearEligibility: string;
  experienceRequirement: string;
  location: string;
  mode: WorkMode;
  salaryRange: string;
  currency: string;
  deadline: string; // YYYY-MM-DD or ISO
  openings: number;
  duration: string;
  requireResume: boolean;
  requirePortfolio: boolean;
  applicationQuestions: string[];
  hiringContact: string;
  status: "Draft" | "Published" | "Paused" | "Closed";
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
}

export interface EvaluationNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface StageHistoryEntry {
  stage: AtsStage;
  changedBy: string;
  changedAt: string;
}

export interface CandidateSummary {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  bio: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  gradYear: string;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  linkedin: string;
  github: string;
  portfolio: string;
  preferredTypes: OppType[];
  preferredModes: WorkMode[];
  interestedRoles: string[];
  hasResume: boolean;
  resumeName?: string;
  /** True only for clearly labelled fallback demo candidates when few real student accounts exist. */
  isDemoCandidate?: boolean;
}

export interface AtsApplicant {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobType: JobType;
  candidateId: string;
  candidate: CandidateSummary;
  appliedAt: string;
  stage: AtsStage;
  notes: EvaluationNote[];
  history: StageHistoryEntry[];
  isDemoRecord?: boolean;
}

export interface InterviewFeedback {
  rating: number; // 1-5
  recommendation: "Strong Hire" | "Hire" | "Hold" | "No Hire";
  strengths: string;
  concerns: string;
  submittedBy: string;
  submittedAt: string;
}

export interface InterviewRecord {
  id: string;
  companyId: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  scheduledAt: string; // ISO
  durationMinutes: number;
  timezone: string;
  type: InterviewType;
  locationOrLink: string;
  interviewer: string;
  round: string;
  notes: string;
  status: InterviewStatus;
  feedback?: InterviewFeedback;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  senderRole: "recruiter" | "candidate";
  senderName: string;
  body: string;
  sentAt: string;
}

export interface ConversationThread {
  id: string;
  companyId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  jobId?: string;
  jobTitle?: string;
  unreadByRecruiter: boolean;
  updatedAt: string;
  messages: MessageItem[];
}

export interface EventParticipant {
  id: string;
  name: string;
  college: string;
  registeredAt: string;
  attended: boolean;
  isDemo?: boolean;
}

export interface CampusEvent {
  id: string;
  companyId: string;
  title: string;
  type: EventType;
  institution: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mode: WorkMode;
  venueOrLink: string;
  capacity: number;
  status: EventStatus;
  institutionApproval: "Not requested" | "Pending institution approval" | "Approved";
  linkedJobIds: string[];
  description: string;
  participants: EventParticipant[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  companyId: string;
  name: string;
  email: string;
  jobTitle: string;
  role: TeamRole;
  status: "Active" | "Invited (Demo — email not sent)" | "Deactivated";
  joinedAt: string;
  isOwner?: boolean;
}

export interface ActivityItem {
  id: string;
  companyId: string;
  text: string;
  href: string;
  createdAt: string;
}

export interface IndustryWorkspaceData {
  recruiter: RecruiterProfile;
  company: CompanyProfile;
  jobs: JobListing[];
  applicants: AtsApplicant[];
  candidates: CandidateSummary[];
  interviews: InterviewRecord[];
  conversations: ConversationThread[];
  events: CampusEvent[];
  team: TeamMember[];
  activities: ActivityItem[];
}
