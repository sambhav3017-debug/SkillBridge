/** Shared (client + server) types for the SkillBridge Academia portal. */

import type { AppStatus, Certification, Project, Skill, WorkMode } from "@/lib/student/types";
import type { CampusEvent, CompanyProfile, JobListing } from "@/lib/industry/types";

export const INSTITUTION_TYPES = [
  "University",
  "Autonomous Institute",
  "Engineering & Technology College",
  "Arts, Science & Commerce College",
  "Management & Business School",
  "Design & Architecture Institute",
  "Polytechnic / Diploma Institute",
  "Research Institute",
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const INSTITUTION_VERIFICATION_STATUSES = [
  "Draft",
  "Pending Verification",
  "Verified",
  "Rejected",
  "Action Required",
] as const;
export type InstitutionVerificationStatus = (typeof INSTITUTION_VERIFICATION_STATUSES)[number];

export const ACADEMIA_ROLES = [
  "Institution Owner",
  "Institution Administrator",
  "Placement Officer",
  "Department Coordinator",
  "Faculty Member",
  "Read-Only Analyst",
] as const;
export type AcademiaRole = (typeof ACADEMIA_ROLES)[number];

export const PLACEMENT_STATUSES = [
  "Eligible",
  "In Process",
  "Placed",
  "Internship Secured",
  "Higher Studies / Opted Out",
  "Not Eligible",
] as const;
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number];

export const DRIVE_STATUSES = [
  "Draft",
  "Registration Open",
  "Shortlisting",
  "Interviews Ongoing",
  "Completed",
  "Cancelled",
] as const;
export type DriveStatus = (typeof DRIVE_STATUSES)[number];

export const PARTNERSHIP_STATUSES = [
  "Requested",
  "In Discussion",
  "Active",
  "Completed",
  "Declined",
] as const;
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number];

export const ACADEMIC_OPP_CATEGORIES = [
  "Faculty-Led Project",
  "Student Research Opportunity",
  "Interdisciplinary Project",
  "Industry-Sponsored Academic Project",
  "Research Collaboration Request",
  "Workshop / Technical Session",
  "Innovation Challenge / Hackathon",
] as const;
export type AcademicOppCategory = (typeof ACADEMIC_OPP_CATEGORIES)[number];

export const ACADEMIA_EVENT_TYPES = [
  "Campus Recruitment Drive",
  "Workshop & Seminar",
  "Guest Lecture",
  "Academic Conference",
  "Hackathon & Competition",
  "Career Fair",
  "Industry Networking Session",
] as const;
export type AcademiaEventType = (typeof ACADEMIA_EVENT_TYPES)[number];

export const ACADEMIA_EVENT_STATUSES = [
  "Draft",
  "Published",
  "Registration Open",
  "Full",
  "Completed",
  "Cancelled",
] as const;
export type AcademiaEventStatus = (typeof ACADEMIA_EVENT_STATUSES)[number];

export const ANNOUNCEMENT_AUDIENCES = [
  "All Students",
  "Placement-Eligible Students",
  "Specific Department",
  "Specific Academic Year",
  "Faculty Members",
  "Event Participants",
] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const ANNOUNCEMENT_PRIORITIES = ["Normal", "Important", "Urgent"] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export interface InstitutionProfile {
  id: string;
  name: string;
  type: InstitutionType;
  logo: string;
  website: string;
  institutionalEmail: string;
  country: string;
  state: string;
  city: string;
  address: string;
  description: string;
  specializations: string[];
  programsOffered: string[];
  accreditation: string;
  affiliation: string;
  contactPersonName: string;
  contactPersonTitle: string;
  placementOfficeEmail: string;
  placementOfficePhone: string;
  academicYearLabel: string;
  placementPolicyNote: string;
  shareCgpaWithRecruiters: boolean;
  verificationStatus: InstitutionVerificationStatus;
  verificationSubmittedAt?: string;
  verificationNote?: string;
  createdAt: string;
}

export interface AcademiaNotificationPrefs {
  studentRegistrations: boolean;
  placementDrives: boolean;
  industryCollaborations: boolean;
  researchApplications: boolean;
  teamAndAuditAlerts: boolean;
}

export interface AcademiaStaffProfile {
  userId: string;
  institutionId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  role: AcademiaRole;
  notifications: AcademiaNotificationPrefs;
  onboarded: boolean;
}

export interface DepartmentRecord {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  programs: string[];
  academicYears: string[];
  coordinatorName: string;
  coordinatorEmail: string;
  createdAt: string;
}

export interface FacultyRecord {
  id: string;
  institutionId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  expertise: string[];
  researchInterests: string[];
  publicationsCount: number;
  mentoringAvailable: boolean;
  SupervisedProjectsCount: number;
  responsibilities: string[];
  accountStatus: "Active" | "Invited (Demo — email not sent)" | "Inactive";
  createdAt: string;
}

/** Institutional student record (either linked to a real registered student or imported via CSV/directory). */
export interface InstitutionStudentRecord {
  id: string;
  institutionId: string;
  studentIdCode: string; // Roll number / PRN
  linkedUserId?: string; // Real Student Portal userId when matched
  name: string;
  email: string;
  department: string;
  program: string;
  year: string;
  gradYear: string;
  cgpa?: string;
  placementEligible: boolean;
  placementStatus: PlacementStatus;
  placedCompany?: string;
  placedRole?: string;
  invitationStatus: "Registered on SkillBridge" | "Invited (Demo — email not sent)" | "Roster Record";
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  profileCompletion: number;
  applicationsCount: number;
  latestStage?: AppStatus;
  createdAt: string;
}

export interface PlacementDrive {
  id: string;
  institutionId: string;
  title: string;
  companyName: string;
  companyId?: string;
  roleTitle: string;
  packageOrStipend: string;
  driveDate: string; // YYYY-MM-DD
  mode: WorkMode;
  venueOrLink: string;
  eligibleDepartments: string[];
  eligibleGradYears: string[];
  minSkills: string[];
  coordinatorName: string;
  status: DriveStatus;
  registeredCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersCount: number;
  confirmedPlacementsCount: number;
  notes: string;
  createdAt: string;
}

export interface IndustryPartnership {
  id: string;
  institutionId: string;
  companyId?: string;
  companyName: string;
  industry: string;
  website: string;
  contactName: string;
  contactEmail: string;
  collaborationTypes: string[]; // Campus Hiring, Guest Lecture, Internship, Research, MoU
  status: PartnershipStatus;
  mouSigned: boolean;
  mouReference?: string;
  mouValidUntil?: string;
  nextVisitDate?: string;
  notes: string;
  updatedAt: string;
}

export interface AcademicOpportunity {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  category: AcademicOppCategory;
  department: string;
  supervisorName: string;
  supervisorEmail: string;
  sponsorCompany?: string;
  mode: WorkMode;
  location: string;
  requiredSkills: string[];
  eligibility: string;
  positions: number;
  deadline: string; // YYYY-MM-DD
  stipendOrGrant: string;
  description: string;
  publicationReference?: string;
  status: "Draft" | "Published" | "Archived";
  applicantCount: number;
  createdAt: string;
}

export interface AcademiaEvent {
  id: string;
  institutionId: string;
  title: string;
  type: AcademiaEventType;
  organizer: string;
  targetAudience: string;
  department: string;
  date: string;
  time: string;
  registrationDeadline: string;
  mode: WorkMode;
  location: string;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  status: AcademiaEventStatus;
  description: string;
  linkedIndustryEventId?: string;
  createdAt: string;
}

export interface InstitutionAnnouncement {
  id: string;
  institutionId: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  targetDepartment?: string;
  targetYear?: string;
  priority: AnnouncementPriority;
  status: "Draft" | "Published" | "Scheduled";
  scheduledFor?: string;
  authorName: string;
  authorRole: AcademiaRole;
  createdAt: string;
}

export interface AcademiaTeamMember {
  id: string;
  institutionId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  role: AcademiaRole;
  status: "Active" | "Invited (Demo — email not sent)" | "Deactivated";
  joinedAt: string;
  isOwner?: boolean;
}

export interface AcademiaAuditItem {
  id: string;
  institutionId: string;
  actorName: string;
  actorRole: AcademiaRole;
  action: string;
  href: string;
  createdAt: string;
}

export interface SharedJobEndorsement {
  jobId: string;
  institutionId: string;
  sharedBy: string;
  targetDepartments: string[];
  sharedAt: string;
}

export interface AcademiaWorkspaceData {
  staff: AcademiaStaffProfile;
  institution: InstitutionProfile;
  departments: DepartmentRecord[];
  faculty: FacultyRecord[];
  students: InstitutionStudentRecord[];
  drives: PlacementDrive[];
  partnerships: IndustryPartnership[];
  academicOpportunities: AcademicOpportunity[];
  events: AcademiaEvent[];
  announcements: InstitutionAnnouncement[];
  team: AcademiaTeamMember[];
  auditLog: AcademiaAuditItem[];
  /** Shared from Industry Portal */
  industryJobs: JobListing[];
  sharedJobEndorsements: SharedJobEndorsement[];
  industryCampusEvents: CampusEvent[];
  industryCompanies: CompanyProfile[];
}
