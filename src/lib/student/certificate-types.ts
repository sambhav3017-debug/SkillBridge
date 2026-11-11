export type CertificateBadgeType =
  | "Professional Certificate"
  | "Vendor Certification"
  | "Specialization Certificate"
  | "University Certificate"
  | "Course Completion Certificate"
  | "Skill Badge";

export type CertificatePricing = "Free" | "Free Audit" | "Paid" | "Financial Aid Available";

export type CertificateDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type CertificateDomain =
  | "AI & Machine Learning"
  | "Data Science & Analytics"
  | "Web Development"
  | "Cloud & DevOps"
  | "Cybersecurity"
  | "Software Engineering & CS"
  | "Mobile App Development"
  | "UI/UX & Product Design";

export interface SyllabusModule {
  title: string;
  duration: string;
  description: string;
}

export interface GlobalCertificate {
  id: string;
  title: string;
  issuer: string;
  platform: string;
  badgeType: CertificateBadgeType;
  domain: CertificateDomain;
  difficulty: CertificateDifficulty;
  duration: string; // e.g. "3 - 6 months (5 hrs/week)"
  pricing: CertificatePricing;
  priceDetail?: string; // e.g. "Free to audit ($49/mo for certificate)" or "100% Free with Badge"
  rating: number; // e.g. 4.8
  reviewsCount: number; // e.g. 142000
  enrolledStudentsCount: string; // e.g. "850K+ enrolled"
  logoUrl?: string; // Brand logo or provider icon identifier
  badgeAccentColor: string; // Tailwind/HEX gradient style
  skillsCovered: string[];
  careerRelevance: string[]; // e.g. ["Data Analyst", "Business Intelligence Specialist"]
  resumeValueBullets: string[]; // Honest bullet points for student's resume
  officialUrl: string; // Verified direct link to provider/exam
  syllabus: SyllabusModule[];
  prerequisites?: string[];
  isPopular?: boolean;
  isFree?: boolean;
}

export type CertificationProgressStatus =
  | "Recommended"
  | "Saved"
  | "Planning to Start"
  | "In Progress"
  | "Completed"
  | "Verification Pending"
  | "Verified";

export interface StudentCertificateProgress {
  catalogId: string;
  status: CertificationProgressStatus;
  startedAt?: string; // ISO string
  targetCompletionDate?: string; // YYYY-MM-DD
  completedAt?: string; // ISO string
  verificationUrl?: string;
  credentialId?: string;
  notes?: string;
  targetWeeklyHours?: number;
}

export interface CertificateRecommendation {
  certificate: GlobalCertificate;
  matchScore: number; // 0 - 100
  category:
    | "Best Match for Your Current Courses"
    | "Recommended for Your Career Goal"
    | "Build Your Missing Skills"
    | "Advance Your Existing Skills"
    | "Explore New Domains";
  matchReason: string;
  matchedCourses?: string[];
  matchedSkills?: string[];
  matchedRoles?: string[];
}
