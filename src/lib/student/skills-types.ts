export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  stage: "Beginner" | "Intermediate" | "Advanced";
  videoUrl?: string; // YouTube embed URL
  videoTitle?: string;
  instructor?: string;
  channelName?: string;
  docUrl?: string;
  summary: string;
  language?: "Hindi" | "Hinglish" | "English";
  isIndianCreator?: boolean;
  isPlaylist?: boolean;
  playlistTitle?: string;
  youtubeUrl?: string;
}

export interface PracticalProject {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  deliverables: string[];
  recommendedTech: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillDefinition {
  id: string; // e.g. "python", "react"
  name: string;
  category: SkillCategory;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  prerequisites: string[];
  careerRelevance: string[];
  officialDocUrl: string;
  color: string; // Tailwind color accent
  lessons: Lesson[];
  projects: PracticalProject[];
  quiz: QuizQuestion[];
}

export const SKILL_CATEGORIES = [
  "Programming Languages",
  "Web Development",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Analytics",
  "Cloud & DevOps",
  "Cybersecurity",
  "Mobile & Software Development",
  "Design & Creative Technology",
  "Professional & Career Skills",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface StudentSkillProgress {
  skillId: string;
  enrolledAt: string; // ISO
  lastAccessedAt: string; // ISO
  completedLessonIds: string[];
  completedProjectIds: string[];
  quizScore?: number; // 0-100
  status: "Not Started" | "In Progress" | "Paused" | "Completed";
  hoursSpent: number;
  weeklyTargetHours?: number;
  targetCompletionDate?: string;
  lastActivityTitle?: string;
  currentDay?: number;
  totalDays?: number;
  completedAt?: string;
}
