export type CareerTrackId =
  | "fullstack-architect"
  | "ai-ml-specialist"
  | "cloud-devops-engineer"
  | "data-science-analytics"
  | "mobile-app-engineer"
  | "cybersecurity-analyst";

export interface CareerTrackDefinition {
  id: CareerTrackId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  iconName: string;
  colorGradient: string;
  accentColor: string;
  requiredSkills: string[];
  recommendedDegrees: string[];
  averageIndustrySalary: string;
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  currentStatus: "Mastered" | "In Progress" | "Missing Gap" | "Prerequisite";
  currentLevel?: "Beginner" | "Intermediate" | "Advanced";
  targetLevel: "Beginner" | "Intermediate" | "Advanced";
  priority: "High" | "Medium" | "Prerequisite";
  reason: string;
}

export interface RecommendedSkillItem {
  skillId: string;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  reason: string;
  isPrerequisite: boolean;
  status: "recommended" | "in_progress" | "completed" | "skipped";
  officialDocUrl: string;
  lessonsCount: number;
}

export interface RecommendedVideoItem {
  id: string;
  skillId: string;
  title: string;
  instructorOrChannel: string;
  durationMinutes: number;
  videoUrl: string;
  summary: string;
  phaseNumber: number;
  language?: "Hindi" | "Hinglish" | "English";
  isIndianCreator?: boolean;
  isPlaylist?: boolean;
  playlistTitle?: string;
  youtubeUrl?: string;
}

export interface RecommendedCourseCertItem {
  id: string;
  title: string;
  provider: string; // e.g., "Coursera / DeepLearning.AI", "AWS Skill Builder", "Google Cloud", "freeCodeCamp", "Harvard CS50"
  credentialType: "Course Completion Certificate" | "Industry Professional Certification" | "Open-Source Guided Course";
  pricing: "Free (100% Open Access)" | "Free (Audit available)" | "Paid Certification Exam" | "Financial Aid Available";
  url: string;
  skillsCovered: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  verified: boolean;
  disclaimer: string;
  phaseNumber: number;
}

export interface RecommendedProjectItem {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  deliverables: string[];
  recommendedTech: string[];
  demonstratedSkills: string[];
  completed: boolean;
  phaseNumber: number;
}

export interface LearningPhase {
  id: string; // "phase-1", "phase-2", etc.
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  title: string; // e.g., "Phase 1 — Build Your Foundation"
  subtitle: string;
  description: string;
  estimatedHours: number;
  estimatedWeeks: number;
  skills: RecommendedSkillItem[];
  videos: RecommendedVideoItem[];
  coursesAndCerts: RecommendedCourseCertItem[];
  projects: RecommendedProjectItem[];
  completed: boolean;
}

export interface NextRecommendedAction {
  phaseId: string;
  phaseNumber: number;
  phaseTitle: string;
  skillId: string;
  skillName: string;
  actionType: "lesson" | "project" | "quiz" | "certification" | "video";
  title: string;
  url?: string;
  estimatedMinutes: number;
  reason: string;
}

export interface PersonalizedPathProgress {
  totalSkills: number;
  completedSkills: number;
  totalHours: number;
  completedHours: number;
  completedProjects: number;
  totalProjects: number;
  overallPercentage: number;
  targetCompletionDate: string; // ISO
}

export interface PersonalizedLearningPath {
  id: string;
  studentId: string;
  studentName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  careerTrackId: CareerTrackId;
  targetRole: string;
  targetGoal3to6m: string;
  weeklyHoursTarget: number;
  currentProficiencyAssessment: string;
  academicContextSummary: string;
  skillGaps: SkillGapItem[];
  phases: LearningPhase[];
  customizations: {
    skippedSkillIds: string[];
    acceptedSkillIds: string[];
    completedProjectIds: string[];
    completedCourseIds: string[];
  };
  progress: PersonalizedPathProgress;
  nextRecommendedAction: NextRecommendedAction;
}

export interface PathGenerationInput {
  targetTrackId?: CareerTrackId;
  targetGoal3to6m?: string;
  weeklyHours?: number;
  selfAssessedLevel?: "Beginner" | "Intermediate" | "Advanced";
  selectedSkills?: string[];
  preferredResourceTypes?: string[];
  videoPreferences?: string[];
  targetDurationMonths?: number;
  learningPace?: "Accelerated" | "Steady" | "Relaxed";
}

export interface AssistantInteractionMessage {
  id: string;
  sender: "student" | "assistant";
  content: string;
  timestamp: string;
  actionPrompt?: string;
  suggestedAction?: {
    type: "open_skill" | "open_video" | "open_phase";
    targetId: string;
    label: string;
  };
}
