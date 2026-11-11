/**
 * DEMO DATA STORE — a single JSON file on the server's disk (default: ./.data/demo-db.json).
 * Not suitable for production: no concurrency across processes, no encryption at rest, no backups.
 * Everything else in the app talks to this module only (readDb / mutateDb), so it can be replaced
 * by Prisma/Postgres without touching route handlers' behaviour.
 */
import { promises as fs } from "fs";
import path from "path";
import type {
  Application,
  Certification,
  CodingAccountSummary,
  CodingActivityItem,
  Profile,
  Project,
  ResumeInfo,
  Skill,
  StudentTask,
  UnifiedCodingStats,
} from "@/lib/student/types";
import type {
  ActivityItem,
  AtsStage,
  CampusEvent,
  CompanyProfile,
  ConversationThread,
  EvaluationNote,
  InterviewRecord,
  JobListing,
  RecruiterProfile,
  StageHistoryEntry,
  TeamMember,
} from "@/lib/industry/types";
import type {
  AcademiaAuditItem,
  AcademiaEvent,
  AcademiaStaffProfile,
  AcademiaTeamMember,
  AcademicOpportunity,
  DepartmentRecord,
  FacultyRecord,
  IndustryPartnership,
  InstitutionAnnouncement,
  InstitutionProfile,
  InstitutionStudentRecord,
  PlacementDrive,
  SharedJobEndorsement,
} from "@/lib/academia/types";

export interface UserRecord {
  id: string;
  email: string; // lowercase
  name: string;
  passwordHash: string; // scrypt$salt$hash — never leaves the server
  role?: "student" | "recruiter" | "academia";
  createdAt: string;
}
export interface SessionRecord {
  tokenHash: string; // sha256 of the cookie token
  userId: string;
  expires: number;
}
export interface StudentRecord {
  profile: Profile;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  saved: string[];
  applications: Application[];
  resume: ResumeInfo | null;
  codingAccounts?: Record<string, CodingAccountSummary>;
  codingActivities?: CodingActivityItem[];
  codingStats?: UnifiedCodingStats;
  tasks?: StudentTask[];
  learning?: Record<string, import("@/lib/student/skills-types").StudentSkillProgress>;
  personalizedPath?: import("@/lib/student/personalized-path-types").PersonalizedLearningPath;
  savedCertificates?: string[];
  inProgressCertificates?: import("@/lib/student/certificate-types").StudentCertificateProgress[];
}
export interface AtsMetaRecord {
  applicationId: string;
  jobId: string;
  candidateId: string;
  stage: AtsStage;
  notes: EvaluationNote[];
  history: StageHistoryEntry[];
}
export interface DB {
  users: UserRecord[];
  sessions: SessionRecord[];
  students: Record<string, StudentRecord>;
  companies: Record<string, CompanyProfile>;
  recruiters: Record<string, RecruiterProfile>;
  jobs: JobListing[];
  atsMeta: Record<string, AtsMetaRecord>;
  interviews: InterviewRecord[];
  conversations: ConversationThread[];
  events: CampusEvent[];
  team: TeamMember[];
  activities: ActivityItem[];
  /* Academia Portal collections */
  institutions: Record<string, InstitutionProfile>;
  academiaStaff: Record<string, AcademiaStaffProfile>;
  academiaDepartments: DepartmentRecord[];
  academiaFaculty: FacultyRecord[];
  academiaStudents: InstitutionStudentRecord[];
  placementDrives: PlacementDrive[];
  industryPartnerships: IndustryPartnership[];
  academicOpportunities: AcademicOpportunity[];
  academiaEvents: AcademiaEvent[];
  academiaAnnouncements: InstitutionAnnouncement[];
  academiaTeam: AcademiaTeamMember[];
  academiaAudit: AcademiaAuditItem[];
  sharedJobEndorsements: SharedJobEndorsement[];
  passwordResetTokens?: { tokenHash: string; userId: string; expires: number; used?: boolean }[];
}

export const DATA_DIR =
  process.env.SKILLBRIDGE_DATA_DIR ??
  (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data"));
const FILE = path.join(DATA_DIR, "demo-db.json");
const BACKUP_FILE = path.join(DATA_DIR, "demo-db.json.bak");

function emptyDb(): DB {
  return {
    users: [],
    sessions: [],
    students: {},
    companies: {},
    recruiters: {},
    jobs: [],
    atsMeta: {},
    interviews: [],
    conversations: [],
    events: [],
    team: [],
    activities: [],
    institutions: {},
    academiaStaff: {},
    academiaDepartments: [],
    academiaFaculty: [],
    academiaStudents: [],
    placementDrives: [],
    industryPartnerships: [],
    academicOpportunities: [],
    academiaEvents: [],
    academiaAnnouncements: [],
    academiaTeam: [],
    academiaAudit: [],
    sharedJobEndorsements: [],
  };
}

function parseDbObject(parsed: Partial<DB>): DB {
  return {
    users: parsed.users ?? [],
    sessions: parsed.sessions ?? [],
    students: parsed.students ?? {},
    companies: parsed.companies ?? {},
    recruiters: parsed.recruiters ?? {},
    jobs: parsed.jobs ?? [],
    atsMeta: parsed.atsMeta ?? {},
    interviews: parsed.interviews ?? [],
    conversations: parsed.conversations ?? [],
    events: parsed.events ?? [],
    team: parsed.team ?? [],
    activities: parsed.activities ?? [],
    institutions: parsed.institutions ?? {},
    academiaStaff: parsed.academiaStaff ?? {},
    academiaDepartments: parsed.academiaDepartments ?? [],
    academiaFaculty: parsed.academiaFaculty ?? [],
    academiaStudents: parsed.academiaStudents ?? [],
    placementDrives: parsed.placementDrives ?? [],
    industryPartnerships: parsed.industryPartnerships ?? [],
    academicOpportunities: parsed.academicOpportunities ?? [],
    academiaEvents: parsed.academiaEvents ?? [],
    academiaAnnouncements: parsed.academiaAnnouncements ?? [],
    academiaTeam: parsed.academiaTeam ?? [],
    academiaAudit: parsed.academiaAudit ?? [],
    sharedJobEndorsements: parsed.sharedJobEndorsements ?? [],
  };
}

export async function readDb(): Promise<DB> {
  let raw: string;
  try {
    raw = await fs.readFile(FILE, "utf8");
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "ENOENT") {
      try {
        raw = await fs.readFile(BACKUP_FILE, "utf8");
      } catch {
        return emptyDb();
      }
    } else {
      try {
        raw = await fs.readFile(BACKUP_FILE, "utf8");
      } catch {
        return emptyDb();
      }
    }
  }

  try {
    const db = JSON.parse(raw) as Partial<DB>;
    return parseDbObject(db);
  } catch (parseErr) {
    console.error("[db] corrupted database JSON, attempting recovery from backup:", parseErr);
    try {
      const backupRaw = await fs.readFile(BACKUP_FILE, "utf8");
      return parseDbObject(JSON.parse(backupRaw) as Partial<DB>);
    } catch {
      throw new Error("[db] Critical: demo-db.json is corrupted and no valid backup exists. Halting to prevent data loss.");
    }
  }
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialised read-modify-write. If fn throws, nothing is written. */
export function mutateDb<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    db.sessions = db.sessions.filter((s) => s.expires > Date.now());
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Unique temp file per mutation to avoid collision across concurrent writes/workers
    const tmp = `${FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));

    // Maintain an atomic backup before replacing primary
    try {
      await fs.copyFile(FILE, BACKUP_FILE);
    } catch {
      // primary might not exist on very first run
    }

    await fs.rename(tmp, FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
