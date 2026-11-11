import type { Opportunity, OppType, WorkMode } from "@/lib/student/types";
import type { JobListing, JobType } from "@/lib/industry/types";
import type { AcademicOpportunity } from "@/lib/academia/types";
import { readDb } from "./db";

/**
 * SAMPLE CATALOGUE — fictional organisations and invented roles used only so the interface can be
 * exercised. These are NOT real listings. Dates are generated relative to today so samples never expire.
 */
interface Seed {
  id: string;
  title: string;
  org: string;
  type: OppType;
  mode: WorkMode;
  location: string;
  skills: string[];
  posted: number; // days ago
  due: number; // days from now
  description: string;
  department?: string;
  salaryRange?: string;
  openings?: number;
}

const SEEDS: Seed[] = [
  { id: "sample-01", title: "Frontend Engineering Intern", org: "Northwind Labs", type: "Internship", mode: "Hybrid", location: "Pune, India", skills: ["React", "TypeScript", "CSS"], posted: 2, due: 21, description: "Help build and polish the web interface of a learning analytics product. You will pair with a mentor, ship small features and learn code review practice.", department: "Web Engineering", salaryRange: "₹25,000 - ₹35,000 / mo", openings: 3 },
  { id: "sample-02", title: "Data Analyst Intern", org: "Cobalt Analytics", type: "Internship", mode: "Remote", location: "Remote (India)", skills: ["Python", "SQL", "Pandas"], posted: 4, due: 14, description: "Clean, explore and visualise datasets for internal reports. A good fit if you enjoy turning raw numbers into clear stories.", department: "Analytics & BI", salaryRange: "₹20,000 - ₹30,000 / mo", openings: 2 },
  { id: "sample-03", title: "Junior Backend Developer", org: "Helix Systems", type: "Full-time Job", mode: "On-site", location: "Bengaluru, India", skills: ["Node.js", "PostgreSQL", "REST"], posted: 1, due: 30, description: "Join a small platform team building APIs and background jobs. Expect ownership of well-scoped services from your first month.", department: "Core Platform", salaryRange: "₹6.5 - ₹8.5 LPA", openings: 2 },
  { id: "sample-04", title: "Mobile App Project: Campus Events", org: "Aster Studio", type: "Project", mode: "Remote", location: "Remote", skills: ["React Native", "Firebase", "UI Design"], posted: 6, due: 18, description: "A team project to design and build a campus events app. Suitable for portfolio work, with weekly check-ins.", department: "Mobile Experience", salaryRange: "Certificate + ₹15,000 Grant", openings: 4 },
  { id: "sample-05", title: "National Student Hackathon: Smart Cities", org: "Lumen Innovation Forum", type: "Hackathon", mode: "On-site", location: "Mumbai, India", skills: ["IoT", "Python", "Prototyping"], posted: 3, due: 10, description: "A 36-hour build sprint around urban challenges. Form a team of up to four and present a working prototype to a judging panel.", department: "Smart Cities Guild", salaryRange: "₹1,50,000 Prize Pool", openings: 20 },
  { id: "sample-06", title: "UI/UX Design Freelance Gig", org: "Pixelcraft Collective", type: "Freelance", mode: "Remote", location: "Remote", skills: ["Figma", "Prototyping", "User Research"], posted: 5, due: 12, description: "Short engagement to redesign onboarding screens for a small SaaS product. Deliver wireframes and a clickable prototype.", department: "Product Design", salaryRange: "₹40,000 fixed milestone", openings: 1 },
  { id: "sample-07", title: "Machine Learning Intern", org: "Orbit AI Works", type: "Internship", mode: "Hybrid", location: "Hyderabad, India", skills: ["Python", "PyTorch", "Machine Learning"], posted: 7, due: 25, description: "Support experiments on text classification models: dataset preparation, training runs and evaluation write-ups.", department: "Applied AI", salaryRange: "₹30,000 - ₹45,000 / mo", openings: 2 },
  { id: "sample-08", title: "Cloud Support Associate", org: "Stratus Infra", type: "Full-time Job", mode: "Hybrid", location: "Pune, India", skills: ["Linux", "AWS", "Networking"], posted: 8, due: 28, description: "First-line troubleshooting for cloud workloads, with a structured path towards infrastructure engineering.", department: "Cloud Infrastructure", salaryRange: "₹5.0 - ₹7.0 LPA", openings: 5 },
  { id: "sample-09", title: "Open-Source Docs Sprint", org: "Quillwork Foundation", type: "Project", mode: "Remote", location: "Remote", skills: ["Technical Writing", "Git", "Markdown"], posted: 9, due: 9, description: "Improve documentation for a community developer tool. Great for first contributions and visible public work.", department: "Open Source Guild", salaryRange: "Stipend ₹12,000", openings: 6 },
  { id: "sample-10", title: "Full-Stack Web Developer (Part-time)", org: "Brightpath Ventures", type: "Freelance", mode: "Remote", location: "Remote (India)", skills: ["React", "Node.js", "MongoDB"], posted: 2, due: 20, description: "Build an internal dashboard in a few weekly milestones. Flexible hours, clear scope and agreed deliverables.", department: "Engineering", salaryRange: "₹35,000 / mo", openings: 2 },
  { id: "sample-11", title: "Cybersecurity Trainee", org: "Bastion Secure", type: "Internship", mode: "On-site", location: "Delhi, India", skills: ["Networking", "Linux", "Security"], posted: 10, due: 16, description: "Shadow the security team on vulnerability assessments and learn to write clear, actionable findings.", department: "Cyber Defense", salaryRange: "₹22,000 - ₹28,000 / mo", openings: 3 },
  { id: "sample-12", title: "AI for Good Hackathon", org: "Meridian Tech Society", type: "Hackathon", mode: "Remote", location: "Online", skills: ["Machine Learning", "Python", "Data Visualisation"], posted: 1, due: 7, description: "A weekend online hackathon focused on social-impact data problems. Open to students from any discipline.", department: "Social Innovation", salaryRange: "₹2,00,000 Prize Pool", openings: 15 },
];

export function getSampleOpportunities(): Opportunity[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const day = 86400000;
  return SEEDS.map((s) => ({
    id: s.id,
    title: s.title,
    org: s.org,
    type: s.type,
    mode: s.mode,
    location: s.location,
    skills: s.skills,
    description: s.description,
    postedAt: new Date(today.getTime() - s.posted * day).toISOString(),
    deadline: new Date(today.getTime() + s.due * day).toISOString(),
    sample: true,
    department: s.department,
    salaryRange: s.salaryRange,
    openings: s.openings,
  }));
}

function mapJobTypeToStudentOppType(type: JobType): OppType {
  if (type === "Internship") return "Internship";
  if (type === "Full-time") return "Full-time Job";
  if (type === "Project") return "Project";
  return "Freelance";
}

export function jobListingToOpportunity(j: JobListing): Opportunity {
  const deadlineIso = j.deadline.includes("T")
    ? j.deadline
    : new Date(`${j.deadline}T23:59:59.000Z`).toISOString();
  return {
    id: j.id,
    title: j.title,
    org: j.companyName,
    type: mapJobTypeToStudentOppType(j.type),
    mode: j.mode,
    location: j.location,
    skills: j.requiredSkills.length ? j.requiredSkills : ["General"],
    postedAt: j.publishedAt ?? j.createdAt,
    deadline: deadlineIso,
    description: [j.description, j.responsibilities && `Responsibilities: ${j.responsibilities}`]
      .filter(Boolean)
      .join("\n\n"),
    sample: false,
    companyId: j.companyId,
    department: j.department,
    salaryRange: j.salaryRange ? `${j.currency} ${j.salaryRange}`.trim() : undefined,
    openings: j.openings,
  };
}

export function academicOppToOpportunity(a: AcademicOpportunity): Opportunity {
  const deadlineIso = a.deadline.includes("T")
    ? a.deadline
    : new Date(`${a.deadline}T23:59:59.000Z`).toISOString();
  const type: OppType =
    a.category === "Innovation Challenge / Hackathon" ? "Hackathon" : "Project";
  return {
    id: a.id,
    title: `${a.title} (${a.category})`,
    org: `${a.institutionName} · ${a.department}`,
    type,
    mode: a.mode,
    location: a.location,
    skills: a.requiredSkills.length ? a.requiredSkills : ["Research"],
    postedAt: a.createdAt,
    deadline: deadlineIso,
    description: `${a.description}\n\nFaculty Supervisor: ${a.supervisorName} (${a.supervisorEmail})`,
    sample: false,
    department: a.department,
    salaryRange: a.stipendOrGrant || undefined,
    openings: a.positions,
  };
}

/**
 * Returns active published Industry jobs and Academia research/project opportunities merged with the sample catalogue.
 * Draft, Paused, Closed, or expired jobs are excluded from active student discovery.
 */
export async function getAllStudentOpportunities(includeInactiveIds: string[] = []): Promise<Opportunity[]> {
  const db = await readDb();
  const now = Date.now();
  const keepSet = new Set(includeInactiveIds);
  const publishedCompanyJobs = db.jobs
    .filter((j) => {
      if (keepSet.has(j.id)) return true;
      if (j.status !== "Published") return false;
      const dl = new Date(j.deadline.includes("T") ? j.deadline : `${j.deadline}T23:59:59.000Z`).getTime();
      return !Number.isNaN(dl) && dl >= now;
    })
    .map(jobListingToOpportunity);
  const publishedAcademicOpps = db.academicOpportunities
    .filter((a) => {
      if (keepSet.has(a.id)) return true;
      if (a.status !== "Published") return false;
      const dl = new Date(a.deadline.includes("T") ? a.deadline : `${a.deadline}T23:59:59.000Z`).getTime();
      return !Number.isNaN(dl) && dl >= now;
    })
    .map(academicOppToOpportunity);
  return [...publishedCompanyJobs, ...publishedAcademicOpps, ...getSampleOpportunities()];
}
