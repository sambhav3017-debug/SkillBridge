export type SearchCategory =
  | "all"
  | "portals"
  | "opportunities"
  | "student"
  | "academia"
  | "industry"
  | "platform"
  | "auth";

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  categoryLabel: string;
  keywords: string[];
  href: string;
  isSection?: boolean;
  badge?: string;
  iconName:
    | "portal"
    | "sparkles"
    | "code"
    | "briefcase"
    | "graduation"
    | "building"
    | "compass"
    | "shield"
    | "user"
    | "award"
    | "file-text"
    | "calendar"
    | "trending-up";
}

export const SEARCH_INDEX: SearchItem[] = [
  // --- PORTALS ---
  {
    id: "portal-student",
    title: "Student Portal",
    description: "Access verified projects, skill verification, career pathways, and mentorship.",
    category: "portals",
    categoryLabel: "Portals",
    keywords: ["student", "portal", "learn", "portfolio", "resume", "internship", "undergrad", "graduate"],
    href: "/student",
    badge: "Core Portal",
    iconName: "graduation",
  },
  {
    id: "portal-academia",
    title: "Academia Portal",
    description: "Oversee capstones, manage research grants, connect faculty with industry R&D.",
    category: "portals",
    categoryLabel: "Portals",
    keywords: ["academia", "faculty", "professor", "university", "research", "capstone", "institution", "grants"],
    href: "/academia",
    badge: "Core Portal",
    iconName: "building",
  },
  {
    id: "portal-industry",
    title: "Industry Portal",
    description: "Discover pre-vetted talent, sponsor capstones, post jobs, and run technical challenges.",
    category: "portals",
    categoryLabel: "Portals",
    keywords: ["industry", "company", "recruiter", "talent", "hiring", "jobs", "internships", "sponsor", "enterprise"],
    href: "/industry",
    badge: "Core Portal",
    iconName: "briefcase",
  },

  // --- LANDING SECTIONS ---
  {
    id: "section-home",
    title: "SkillBridge Hero & Mission",
    description: "The robotic hand bridge unifying human ambition and engineering excellence.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["home", "hero", "landing", "mission", "vision", "overview", "bridge"],
    href: "/#home",
    isSection: true,
    badge: "Landing",
    iconName: "sparkles",
  },
  {
    id: "section-opportunities",
    title: "Four Pathways to Accelerate Forward",
    description: "Explore Industry Projects, Capstones, Research Fellowships, and 1-on-1 Mentorship.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["opportunities", "industry projects", "capstone", "fellowship", "mentorship", "fast track"],
    href: "/#opportunities",
    isSection: true,
    badge: "Section",
    iconName: "compass",
  },
  {
    id: "section-build",
    title: "Turn Skills into Real Projects (Interactive Workspaces)",
    description: "Practical engineering workspaces, git commits, code reviews, and verified skills.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["build", "skills", "coding", "workspace", "commits", "review", "git", "terminal"],
    href: "/#skills",
    isSection: true,
    badge: "Section",
    iconName: "code",
  },
  {
    id: "section-ecosystem",
    title: "Three Words, One Unified Network",
    description: "Interactive portal switchboard bridging Students, Academia, and Industry together.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["three words", "ecosystem", "unified network", "pillars", "connect", "student academia industry"],
    href: "/#ecosystem",
    isSection: true,
    badge: "Section",
    iconName: "portal",
  },
  {
    id: "section-progression",
    title: "From Progress to Possibility (Career Pathway)",
    description: "5 developmental milestones: Foundation, Exploration, Application, Mentorship, Placement.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["progression", "pathway", "milestones", "career journey", "growth", "stages"],
    href: "/#progression",
    isSection: true,
    badge: "Section",
    iconName: "trending-up",
  },
  {
    id: "section-outcomes",
    title: "Real Outcomes, Real Connections",
    description: "Verified metrics, partner institutions, research impact, and hiring records.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["outcomes", "results", "metrics", "partners", "universities", "companies", "stats"],
    href: "/#outcomes",
    isSection: true,
    badge: "Section",
    iconName: "award",
  },
  {
    id: "section-closing-cta",
    title: "Your Future Is Built (Get Started)",
    description: "Join the unified SkillBridge network and accelerate your career or partnership.",
    category: "platform",
    categoryLabel: "Platform",
    keywords: ["get started", "join", "cta", "closing", "register", "connect"],
    href: "/#cta",
    isSection: true,
    badge: "Section",
    iconName: "sparkles",
  },

  // --- OPPORTUNITIES & PROGRAMS ---
  {
    id: "opp-industry-projects",
    title: "Industry Projects",
    description: "Hands-on projects sponsored by top tech companies, solving production-grade engineering challenges.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["industry projects", "sponsored projects", "real world", "client project", "hands-on"],
    href: "/student/opportunities?type=industry",
    badge: "Featured",
    iconName: "briefcase",
  },
  {
    id: "opp-capstone-collaborations",
    title: "Capstone Collaborations",
    description: "Semester-long multidisciplinary projects guided jointly by university faculty and industry experts.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["capstone", "final year project", "thesis", "senior design", "collaborative project"],
    href: "/student/opportunities?type=capstone",
    badge: "Academic",
    iconName: "graduation",
  },
  {
    id: "opp-research-fellowships",
    title: "Research Fellowships",
    description: "Funded research opportunities in AI, quantum computing, biotechnology, and robotics.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["fellowship", "research fellowship", "r&d", "grant", "scientific research", "lab"],
    href: "/student/opportunities?type=fellowship",
    badge: "Research",
    iconName: "sparkles",
  },
  {
    id: "opp-mentorship",
    title: "One-on-One Mentorship",
    description: "Direct guidance from senior engineers, engineering directors, and academic principal investigators.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["mentor", "mentorship", "advisor", "guidance", "career advice", "office hours", "1 on 1"],
    href: "/student/opportunities?type=mentorship",
    badge: "Mentorship",
    iconName: "user",
  },
  {
    id: "opp-fast-track",
    title: "Fast Track Pipeline",
    description: "Direct fast-tracked interview and hiring pipelines for verified top project contributors.",
    category: "opportunities",
    categoryLabel: "Opportunities",
    keywords: ["fast track", "direct hiring", "interview pipeline", "priority application", "job offers"],
    href: "/student/opportunities?type=fast-track",
    badge: "Hiring",
    iconName: "trending-up",
  },

  // --- STUDENT APP FEATURES ---
  {
    id: "student-browse-opps",
    title: "Browse All Student Opportunities",
    description: "Filter verified internships, projects, and fellowships with live application deadlines.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["opportunities", "browse jobs", "internship listings", "filter opportunities", "apply"],
    href: "/student/opportunities",
    badge: "Browse",
    iconName: "briefcase",
  },
  {
    id: "student-projects",
    title: "Student Projects & Workspaces",
    description: "Collaborative project repos, milestone tracking, and code submission workflows.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["projects", "my projects", "workspace", "submissions", "milestones", "teamwork"],
    href: "/student/projects",
    badge: "Workspace",
    iconName: "code",
  },
  {
    id: "student-skills",
    title: "Skill Verification & Credential Graph",
    description: "Demonstrate verified mastery in React, TypeScript, Python, Distributed Systems, and AI.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["skills", "skill verification", "credentials", "assessments", "certifications", "badges"],
    href: "/student/skills",
    badge: "Credentials",
    iconName: "award",
  },
  {
    id: "student-applications",
    title: "Application Status Tracker",
    description: "Monitor your submitted applications, interview stages, and offers in real time.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["applications", "status", "tracker", "interviews", "offers", "accepted"],
    href: "/student/applications",
    badge: "Tracker",
    iconName: "file-text",
  },
  {
    id: "student-saved",
    title: "Saved Opportunities & Bookmarks",
    description: "Review opportunities, fellowships, and mentors you bookmarked for later.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["saved", "bookmarks", "favorites", "starred", "watchlist"],
    href: "/student/saved",
    badge: "Saved",
    iconName: "sparkles",
  },
  {
    id: "student-profile",
    title: "Student Profile & Portfolio",
    description: "Showcase your GitHub contributions, verified skills, and academic achievements to recruiters.",
    category: "student",
    categoryLabel: "Student",
    keywords: ["profile", "portfolio", "resume", "cv", "bio", "github", "showcase"],
    href: "/student/profile",
    badge: "Profile",
    iconName: "user",
  },

  // --- ACADEMIA APP FEATURES ---
  {
    id: "academia-research",
    title: "Research Grants & Collaborative Labs",
    description: "Manage research proposals, university grants, and industry R&D sponsorships.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["research", "grants", "publications", "labs", "sponsorship", "funding"],
    href: "/academia/research",
    badge: "Research",
    iconName: "sparkles",
  },
  {
    id: "academia-faculty",
    title: "Faculty Directory & Mentors",
    description: "Connect institutional faculty with external industry sponsors and student researchers.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["faculty", "professors", "supervisors", "teachers", "mentors", "directory"],
    href: "/academia/faculty",
    badge: "Faculty",
    iconName: "user",
  },
  {
    id: "academia-placements",
    title: "Placement Analytics & Career Outcomes",
    description: "Track student placement rates, internship transitions, and industry hiring metrics.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["placements", "career outcomes", "graduation rate", "employment statistics", "analytics"],
    href: "/academia/placements",
    badge: "Analytics",
    iconName: "trending-up",
  },
  {
    id: "academia-projects",
    title: "Capstone & Curriculum Management",
    description: "Assign and grade real-world industry capstones within accredited university coursework.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["capstone management", "coursework", "grading", "rubrics", "curriculum"],
    href: "/academia/projects",
    badge: "Curriculum",
    iconName: "graduation",
  },
  {
    id: "academia-departments",
    title: "Academic Departments & Faculty Chairs",
    description: "Manage departmental rosters, course schedules, and research specializations.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["departments", "computer science", "engineering", "faculty chairs", "division"],
    href: "/academia/departments",
    badge: "Administration",
    iconName: "building",
  },
  {
    id: "academia-institution",
    title: "Institutional Profile & Accreditation",
    description: "Manage university branding, verified accreditations, and corporate partnerships.",
    category: "academia",
    categoryLabel: "Academia",
    keywords: ["institution", "university profile", "accreditation", "campus", "branding"],
    href: "/academia/institution",
    badge: "Settings",
    iconName: "building",
  },

  // --- INDUSTRY APP FEATURES ---
  {
    id: "industry-jobs",
    title: "Post & Manage Opportunities",
    description: "Publish internships, co-ops, and full-time roles targeting pre-qualified student cohorts.",
    category: "industry",
    categoryLabel: "Industry",
    keywords: ["post jobs", "post internship", "job board", "listings", "open positions", "hiring"],
    href: "/industry/jobs",
    badge: "Recruitment",
    iconName: "briefcase",
  },
  {
    id: "industry-talent",
    title: "Search Verified Talent Pool",
    description: "Filter candidates by verified git commits, real project contributions, and technical skills.",
    category: "industry",
    categoryLabel: "Industry",
    keywords: ["talent search", "candidates", "developer sourcing", "recruiting", "engineers"],
    href: "/industry/talent",
    badge: "Sourcing",
    iconName: "user",
  },
  {
    id: "industry-company-profile",
    title: "Company Profile & Engineering Brand",
    description: "Highlight your tech stack, engineering values, and open-source contributions to candidates.",
    category: "industry",
    categoryLabel: "Industry",
    keywords: ["company profile", "employer brand", "tech stack", "culture", "about company"],
    href: "/industry/company-profile",
    badge: "Branding",
    iconName: "building",
  },
  {
    id: "industry-analytics",
    title: "Hiring Pipeline Analytics & ROI",
    description: "Detailed funnel metrics from project participation to offer acceptance and retention.",
    category: "industry",
    categoryLabel: "Industry",
    keywords: ["hiring analytics", "metrics", "pipeline conversion", "talent ROI", "reports"],
    href: "/industry/analytics",
    badge: "Analytics",
    iconName: "trending-up",
  },
  {
    id: "industry-events",
    title: "Campus & Virtual Tech Events",
    description: "Host hackathons, engineering tech talks, and live Q&A sessions with top student talent.",
    category: "industry",
    categoryLabel: "Industry",
    keywords: ["events", "hackathon", "tech talk", "webinar", "campus recruitment", "meetup"],
    href: "/industry/events",
    badge: "Events",
    iconName: "calendar",
  },

  // --- AUTHENTICATION & ACCESS ---
  {
    id: "auth-student-login",
    title: "Student Sign In",
    description: "Log into your SkillBridge student account to view opportunities and track applications.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["login", "sign in", "student login", "authenticate", "access account"],
    href: "/student/login",
    badge: "Auth",
    iconName: "user",
  },
  {
    id: "auth-student-signup",
    title: "Student Registration",
    description: "Create your student account to build a verified portfolio and unlock top opportunities.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["signup", "register", "student register", "create account", "join"],
    href: "/student/signup",
    badge: "Register",
    iconName: "graduation",
  },
  {
    id: "auth-academia-login",
    title: "Academia Portal Sign In",
    description: "Sign in for faculty advisors, department chairs, and university research coordinators.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["academia login", "faculty sign in", "university access", "professor login"],
    href: "/academia/login",
    badge: "Auth",
    iconName: "building",
  },
  {
    id: "auth-academia-register",
    title: "Academia Institutional Onboarding",
    description: "Register your university, college, or research institute on the SkillBridge network.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["academia register", "institution signup", "university onboarding", "partner university"],
    href: "/academia/register",
    badge: "Register",
    iconName: "building",
  },
  {
    id: "auth-industry-login",
    title: "Industry Partner Sign In",
    description: "Sign in for hiring managers, technical recruiters, and company project mentors.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["industry login", "recruiter sign in", "employer access", "company login"],
    href: "/industry/login",
    badge: "Auth",
    iconName: "briefcase",
  },
  {
    id: "auth-industry-signup",
    title: "Industry Partner Registration",
    description: "Onboard your company to recruit pre-vetted engineers and sponsor innovative capstones.",
    category: "auth",
    categoryLabel: "Account",
    keywords: ["industry register", "company signup", "employer registration", "sponsor registration"],
    href: "/industry/signup",
    badge: "Register",
    iconName: "briefcase",
  },

  // --- LEGAL & POLICIES ---
  {
    id: "legal-terms",
    title: "Terms of Service & Privacy Policy",
    description: "SkillBridge platform guidelines, intellectual property terms, and data protection privacy.",
    category: "platform",
    categoryLabel: "Legal",
    keywords: ["legal", "privacy", "terms", "terms of service", "ip policy", "student data protection", "ethics"],
    href: "/legal",
    badge: "Legal",
    iconName: "shield",
  },
];

export const POPULAR_SEARCH_TERMS = [
  "Student Portal",
  "Industry Projects",
  "Capstone Collaborations",
  "Research Fellowships",
  "Academia Portal",
  "Skill Verification",
  "One-on-One Mentorship",
];

export interface TextChunk {
  text: string;
  isMatch: boolean;
}

/**
 * Splits text into chunks with `isMatch: boolean` to safely highlight matching query terms
 */
export function highlightChunks(text: string, query: string): TextChunk[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, isMatch: false }];
  }

  // Escape regex special chars
  const words = trimmed
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  if (words.length === 0) {
    return [{ text, isMatch: false }];
  }

  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);
  const lowerWords = words.map((w) => w.toLowerCase());

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: lowerWords.includes(part.toLowerCase()),
    }));
}

/**
 * Intelligent multi-word scoring search
 */
export function searchSite(
  query: string,
  categoryFilter: SearchCategory = "all",
  extraItems: SearchItem[] = []
): SearchItem[] {
  const trimmed = query.trim().toLowerCase();
  const allItems = extraItems.length > 0 ? [...extraItems, ...SEARCH_INDEX] : SEARCH_INDEX;

  // If query is empty, filter by category or return curated top items
  if (!trimmed) {
    const list =
      categoryFilter === "all"
        ? allItems
        : allItems.filter((item) => item.category === categoryFilter);
    return list.slice(0, 15);
  }

  const queryWords = trimmed.split(/\s+/).filter(Boolean);

  const scoredItems: { item: SearchItem; score: number }[] = [];

  for (const item of allItems) {
    // Check category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      continue;
    }

    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const categoryLower = item.categoryLabel.toLowerCase();
    const keywordsLower = item.keywords.map((k) => k.toLowerCase());

    let score = 0;
    let allWordsMatch = true;

    for (const word of queryWords) {
      let wordMatched = false;

      // Exact title match or starts with word
      if (titleLower === trimmed) {
        score += 150;
        wordMatched = true;
      } else if (titleLower.startsWith(word)) {
        score += 60;
        wordMatched = true;
      } else if (titleLower.includes(word)) {
        score += 35;
        wordMatched = true;
      }

      // Keyword match
      for (const kw of keywordsLower) {
        if (kw === word) {
          score += 45;
          wordMatched = true;
        } else if (kw.includes(word)) {
          score += 20;
          wordMatched = true;
        }
      }

      // Category match
      if (categoryLower.includes(word)) {
        score += 15;
        wordMatched = true;
      }

      // Description match
      if (descLower.includes(word)) {
        score += 10;
        wordMatched = true;
      }

      if (!wordMatched) {
        allWordsMatch = false;
      }
    }

    // Require all words to match somewhere in the item for precision
    if (allWordsMatch && score > 0) {
      // Small bonus for user's personal items / dynamic opportunities
      if (item.badge === "Personal" || item.badge === "Live" || item.badge === "Application" || item.badge === "Saved") {
        score += 25;
      }
      // Small bonus for core portals
      if (item.category === "portals") score += 10;
      scoredItems.push({ item, score });
    }
  }

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((s) => s.item);
}
