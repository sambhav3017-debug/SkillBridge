import { SKILLS_CATALOG, getSkillById } from "./skills-catalog";
import type { StudentRecord } from "@/lib/server/db";
import type {
  PersonalizedLearningPath,
  CareerTrackDefinition,
  CareerTrackId,
  PathGenerationInput,
  SkillGapItem,
  LearningPhase,
  RecommendedSkillItem,
  RecommendedVideoItem,
  RecommendedCourseCertItem,
  RecommendedProjectItem,
  NextRecommendedAction,
  AssistantInteractionMessage,
} from "./personalized-path-types";

// ============================================================================
// 1. CAREER TRACK DEFINITIONS
// ============================================================================
export const CAREER_TRACKS: CareerTrackDefinition[] = [
  {
    id: "ai-ml-specialist",
    title: "AI & Machine Learning Specialist",
    shortTitle: "AI & ML Engineer",
    tagline: "From Neural Foundations to Generative AI & Autonomous Agents",
    description:
      "Master deep learning, LLM fine-tuning, retrieval-augmented generation (RAG), and agentic workflows for modern AI-powered applications.",
    iconName: "Cpu",
    colorGradient: "from-orange-500/20 via-amber-500/15 to-rose-500/10",
    accentColor: "#FF6A00",
    requiredSkills: [
      "Python",
      "Data Structures & Algorithms",
      "Machine Learning",
      "Deep Learning",
      "Generative AI & LLMs",
      "REST APIs",
      "Docker",
    ],
    recommendedDegrees: ["Computer Science", "Artificial Intelligence", "Data Science", "Information Technology"],
    averageIndustrySalary: "₹14 - ₹28 LPA",
  },
  {
    id: "fullstack-architect",
    title: "Full-Stack Web Architect",
    shortTitle: "Full-Stack Architect",
    tagline: "End-to-End Modern Web Systems & Scalable Cloud Microservices",
    description:
      "Build high-performance web applications with React, Next.js, Node.js, distributed databases, and containerized deployment pipelines.",
    iconName: "Globe",
    colorGradient: "from-blue-600/20 via-indigo-600/15 to-purple-600/10",
    accentColor: "#3B82F6",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "SQL",
      "Docker",
      "Full-Stack Development",
    ],
    recommendedDegrees: ["Computer Science", "Information Technology", "Computer Engineering"],
    averageIndustrySalary: "₹12 - ₹24 LPA",
  },
  {
    id: "cloud-devops-engineer",
    title: "Cloud Infrastructure & DevOps Engineer",
    shortTitle: "Cloud & DevOps",
    tagline: "Automated CI/CD, Container Orchestration, & Resilient Infrastructure",
    description:
      "Design zero-downtime deployment pipelines, infrastructure as code, Kubernetes clusters, and multi-cloud security architectures.",
    iconName: "Cloud",
    colorGradient: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
    accentColor: "#10B981",
    requiredSkills: [
      "Linux",
      "Git",
      "Docker",
      "AWS",
      "Security Fundamentals",
      "Python",
    ],
    recommendedDegrees: ["Computer Science", "Information Technology", "Electronics & Telecommunication"],
    averageIndustrySalary: "₹13 - ₹26 LPA",
  },
  {
    id: "data-science-analytics",
    title: "Data Science & Analytics Specialist",
    shortTitle: "Data Scientist",
    tagline: "Transform Complex Raw Data into Predictive Business Intelligence",
    description:
      "Master statistical modeling, feature engineering, SQL data warehousing, predictive machine learning, and executive dashboards.",
    iconName: "Database",
    colorGradient: "from-cyan-500/20 via-blue-500/15 to-indigo-500/10",
    accentColor: "#06B6D4",
    requiredSkills: [
      "Python",
      "SQL",
      "Machine Learning",
      "Data Structures & Algorithms",
    ],
    recommendedDegrees: ["Data Science", "Statistics", "Computer Science", "Mathematics"],
    averageIndustrySalary: "₹11 - ₹22 LPA",
  },
  {
    id: "mobile-app-engineer",
    title: "Mobile Systems & App Engineer",
    shortTitle: "Mobile Developer",
    tagline: "Cross-Platform High Performance Mobile UX for iOS & Android",
    description:
      "Build fluid native and cross-platform apps with reactive state, offline caching, push notifications, and device hardware integration.",
    iconName: "Smartphone",
    colorGradient: "from-purple-500/20 via-pink-500/15 to-rose-500/10",
    accentColor: "#8B5CF6",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "REST APIs",
      "UI/UX Design",
    ],
    recommendedDegrees: ["Computer Science", "Information Technology"],
    averageIndustrySalary: "₹10 - ₹20 LPA",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity & Systems Specialist",
    shortTitle: "Cybersecurity Analyst",
    tagline: "Threat Detection, Vulnerability Assessment & Enterprise Hardening",
    description:
      "Protect critical networks, audit web application security, master cryptography, and defend cloud infrastructure against modern attack vectors.",
    iconName: "Shield",
    colorGradient: "from-red-500/20 via-orange-500/15 to-amber-500/10",
    accentColor: "#EF4444",
    requiredSkills: [
      "Linux",
      "Security Fundamentals",
      "Python",
      "Docker",
      "AWS",
    ],
    recommendedDegrees: ["Computer Science", "Cybersecurity", "Information Security"],
    averageIndustrySalary: "₹12 - ₹25 LPA",
  },
];

// ============================================================================
// 2. VERIFIED COURSES & CREDENTIALS REPOSITORY
// ============================================================================
const VERIFIED_COURSE_CATALOG: Record<CareerTrackId, RecommendedCourseCertItem[]> = {
  "ai-ml-specialist": [
    {
      id: "cert-ai-01",
      title: "Machine Learning Specialization",
      provider: "DeepLearning.AI & Stanford University / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/specializations/machine-learning-introduction",
      skillsCovered: ["Supervised Learning", "Neural Networks", "Gradient Descent", "Python"],
      level: "Beginner",
      verified: true,
      disclaimer: "Validates theoretical and practical ML foundations; does not guarantee employment.",
      phaseNumber: 1,
    },
    {
      id: "cert-ai-02",
      title: "Deep Learning Specialization",
      provider: "DeepLearning.AI / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/specializations/deep-learning",
      skillsCovered: ["CNNs", "RNNs", "Transformers", "Hyperparameter Tuning"],
      level: "Intermediate",
      verified: true,
      disclaimer: "Distinguished as a rigorous deep learning credential; does not guarantee job placement.",
      phaseNumber: 2,
    },
    {
      id: "cert-ai-03",
      title: "Generative AI with Large Language Models",
      provider: "DeepLearning.AI & AWS / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/learn/generative-ai-with-llms",
      skillsCovered: ["LLM Pretraining", "Fine-Tuning (PEFT/LoRA)", "RLHF", "LangChain"],
      level: "Advanced",
      verified: true,
      disclaimer: "Validates modern LLM deployment & prompt engineering knowledge; does not guarantee employment.",
      phaseNumber: 4,
    },
    {
      id: "cert-ai-04",
      title: "Google Cloud Professional Machine Learning Engineer",
      provider: "Google Cloud Certified",
      credentialType: "Industry Professional Certification",
      pricing: "Paid Certification Exam",
      url: "https://cloud.google.com/learn/certification/machine-learning-engineer",
      skillsCovered: ["MLOps", "Vertex AI", "Data Pipelines", "Model Serving"],
      level: "Advanced",
      verified: true,
      disclaimer: "Official industry vendor certification exam assessing professional architecture skills; does not guarantee employment or placement.",
      phaseNumber: 4,
    },
  ],
  "fullstack-architect": [
    {
      id: "cert-fs-01",
      title: "Meta Front-End Developer Professional Certificate",
      provider: "Meta / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      skillsCovered: ["HTML", "CSS", "JavaScript", "React", "UX/UI"],
      level: "Beginner",
      verified: true,
      disclaimer: "Industry-aligned frontend curriculum designed by Meta engineers.",
      phaseNumber: 1,
    },
    {
      id: "cert-fs-02",
      title: "Full Stack Open (Deep Dive into Modern Web Development)",
      provider: "University of Helsinki",
      credentialType: "Open-Source Guided Course",
      pricing: "Free (100% Open Access)",
      url: "https://fullstackopen.com/en/",
      skillsCovered: ["React", "Node.js", "Express", "TypeScript", "PostgreSQL", "Docker", "CI/CD"],
      level: "Intermediate",
      verified: true,
      disclaimer: "Academically accredited open-source curriculum with automated grading.",
      phaseNumber: 2,
    },
    {
      id: "cert-fs-03",
      title: "AWS Certified Developer – Associate",
      provider: "Amazon Web Services",
      credentialType: "Industry Professional Certification",
      pricing: "Paid Certification Exam",
      url: "https://aws.amazon.com/certification/certified-developer-associate/",
      skillsCovered: ["AWS Lambda", "API Gateway", "DynamoDB", "ECS", "CloudFormation"],
      level: "Intermediate",
      verified: true,
      disclaimer: "Industry standard certification demonstrating AWS cloud application development.",
      phaseNumber: 4,
    },
  ],
  "cloud-devops-engineer": [
    {
      id: "cert-cd-01",
      title: "Introduction to Linux (LFS101x)",
      provider: "The Linux Foundation / edX",
      credentialType: "Open-Source Guided Course",
      pricing: "Free (Audit available)",
      url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
      skillsCovered: ["Linux CLI", "Bash Scripting", "System Administration", "File Systems"],
      level: "Beginner",
      verified: true,
      disclaimer: "Foundational Linux instruction directly from Linus Torvalds' Linux Foundation.",
      phaseNumber: 1,
    },
    {
      id: "cert-cd-02",
      title: "Docker Essentials: A Developer Introduction",
      provider: "IBM / Cognitive Class",
      credentialType: "Open-Source Guided Course",
      pricing: "Free (100% Open Access)",
      url: "https://cognitiveclass.ai/courses/docker-essentials",
      skillsCovered: ["Containers", "Dockerfiles", "Docker Compose", "Multi-stage Builds"],
      level: "Beginner",
      verified: true,
      disclaimer: "Free hands-on container training badge from IBM.",
      phaseNumber: 2,
    },
    {
      id: "cert-cd-03",
      title: "Certified Kubernetes Administrator (CKA)",
      provider: "Cloud Native Computing Foundation (CNCF)",
      credentialType: "Industry Professional Certification",
      pricing: "Paid Certification Exam",
      url: "https://www.cncf.io/certification/cka/",
      skillsCovered: ["Cluster Architecture", "Workloads", "Services & Networking", "Troubleshooting"],
      level: "Advanced",
      verified: true,
      disclaimer: "Performance-based hands-on terminal exam testing real Kubernetes administration.",
      phaseNumber: 4,
    },
  ],
  "data-science-analytics": [
    {
      id: "cert-ds-01",
      title: "Google Data Analytics Professional Certificate",
      provider: "Google / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/professional-certificates/google-data-analytics",
      skillsCovered: ["Data Analysis", "SQL", "Tableau", "R Programming", "Data Cleaning"],
      level: "Beginner",
      verified: true,
      disclaimer: "Comprehensive Google certificate covering hands-on business data analytics.",
      phaseNumber: 1,
    },
    {
      id: "cert-ds-02",
      title: "Applied Data Science with Python Specialization",
      provider: "University of Michigan / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/specializations/data-science-python",
      skillsCovered: ["Pandas", "Matplotlib", "Scikit-Learn", "NLTK", "Social Network Analysis"],
      level: "Intermediate",
      verified: true,
      disclaimer: "University level data manipulation and statistical visualization certificate.",
      phaseNumber: 2,
    },
  ],
  "mobile-app-engineer": [
    {
      id: "cert-mb-01",
      title: "Meta React Native Specialization",
      provider: "Meta / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/learn/react-native",
      skillsCovered: ["React Native", "Cross-Platform UI", "Mobile State", "Device APIs"],
      level: "Intermediate",
      verified: true,
      disclaimer: "Industry curriculum for cross-platform iOS & Android mobile application development.",
      phaseNumber: 2,
    },
  ],
  "cybersecurity-analyst": [
    {
      id: "cert-cs-01",
      title: "Google Cybersecurity Professional Certificate",
      provider: "Google / Coursera",
      credentialType: "Course Completion Certificate",
      pricing: "Free (Audit available)",
      url: "https://www.coursera.org/professional-certificates/google-cybersecurity",
      skillsCovered: ["SIEM Tools", "Network Security", "Linux", "SQL", "Incident Response"],
      level: "Beginner",
      verified: true,
      disclaimer: "Entry-level credential prepared by Google security analysts for SOC roles.",
      phaseNumber: 1,
    },
    {
      id: "cert-cs-02",
      title: "CompTIA Security+ Certification",
      provider: "CompTIA",
      credentialType: "Industry Professional Certification",
      pricing: "Paid Certification Exam",
      url: "https://www.comptia.org/certifications/security",
      skillsCovered: ["Threats & Attacks", "Architecture", "Operations", "Governance & Risk"],
      level: "Intermediate",
      verified: true,
      disclaimer: "Globally recognized baseline cybersecurity certification for security engineers.",
      phaseNumber: 4,
    },
  ],
};

// ============================================================================
// 3. CAPSTONE & REALISTIC PROJECTS REPOSITORY
// ============================================================================
const TRACK_PROJECTS: Record<CareerTrackId, RecommendedProjectItem[]> = {
  "ai-ml-specialist": [
    {
      id: "proj-ai-01",
      title: "Exploratory Data Pipeline & Model Benchmark",
      difficulty: "Beginner",
      description:
        "Build a reproducible Python pipeline that ingests tabular datasets, applies feature normalization, trains baseline regression/classification models, and exports interactive evaluation ROC curves.",
      deliverables: ["Jupyter Notebook with EDA", "Clean Python pipeline script", "Model evaluation metrics report"],
      recommendedTech: ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
      demonstratedSkills: ["Data Cleaning", "Feature Engineering", "Model Benchmarking"],
      completed: false,
      phaseNumber: 3,
    },
    {
      id: "proj-ai-02",
      title: "Retrieval-Augmented Generation (RAG) Document Assistant",
      difficulty: "Intermediate",
      description:
        "Build an enterprise document question-answering system using chunking, sentence embeddings, vector database similarity search, and LLM synthesis with citations.",
      deliverables: ["FastAPI REST backend", "Vector store indexing pipeline", "Streamlit / React chat interface"],
      recommendedTech: ["Python", "LangChain", "ChromaDB / Pinecone", "FastAPI", "OpenAI / HuggingFace"],
      demonstratedSkills: ["Vector Embeddings", "Prompt Engineering", "Context Window Management"],
      completed: false,
      phaseNumber: 3,
    },
    {
      id: "proj-ai-03",
      title: "Autonomous Multi-Agent Task Orchestrator (Capstone)",
      difficulty: "Advanced",
      description:
        "Design a multi-agent system where a planner agent decomposes user objectives, delegates subtasks to code-executor, web-search, and critique agents, and validates outputs autonomously.",
      deliverables: ["Full GitHub repository with test suite", "Docker containerized runtime", "Architecture design document with sequence diagrams"],
      recommendedTech: ["Python", "CrewAI / AutoGen / LangGraph", "Docker", "FastAPI", "React UI"],
      demonstratedSkills: ["Agentic Reasoning", "Tool Calling", "Stateful Multi-Agent Orchestration", "Async Execution"],
      completed: false,
      phaseNumber: 5,
    },
  ],
  "fullstack-architect": [
    {
      id: "proj-fs-01",
      title: "Full-Stack Task & Workflow Management SaaS",
      difficulty: "Beginner",
      description:
        "Construct a responsive Kanban task manager featuring user authentication, drag-and-drop cards, relational Postgres schema, and real-time state synchronization.",
      deliverables: ["Next.js App Router client", "PostgreSQL schema with migrations", "Prisma ORM queries"],
      recommendedTech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
      demonstratedSkills: ["Component Architecture", "Server Actions", "Relational Modeling"],
      completed: false,
      phaseNumber: 3,
    },
    {
      id: "proj-fs-02",
      title: "Distributed Real-Time Collaboration Canvas (Capstone)",
      difficulty: "Advanced",
      description:
        "Architect a high-concurrency whiteboard or document editor with WebSocket synchronization, optimistic UI updates, conflict resolution, Redis pub/sub, and Docker deployment.",
      deliverables: ["Production web app deployed with Docker", "WebSocket server with room management", "Benchmark report supporting 500 concurrent connections"],
      recommendedTech: ["React", "TypeScript", "Node.js", "Socket.io", "Redis", "Docker", "PostgreSQL"],
      demonstratedSkills: ["Real-time Networking", "Horizontal Scaling", "Speculative UI updates", "Microservices"],
      completed: false,
      phaseNumber: 5,
    },
  ],
  "cloud-devops-engineer": [
    {
      id: "proj-cd-01",
      title: "Automated Microservices CI/CD Pipeline",
      difficulty: "Intermediate",
      description:
        "Create an automated GitHub Actions pipeline that lints, tests, builds multi-stage Docker images, scans for container vulnerabilities with Trivy, and pushes to a container registry.",
      deliverables: ["GitHub Actions workflow YAML", "Multi-stage Dockerfile", "Automated deployment webhook"],
      recommendedTech: ["Git", "GitHub Actions", "Docker", "Linux CLI", "Trivy"],
      demonstratedSkills: ["CI/CD Automation", "Container Security", "Image Optimization"],
      completed: false,
      phaseNumber: 3,
    },
    {
      id: "proj-cd-02",
      title: "Resilient Multi-Tier Infrastructure on AWS (Capstone)",
      difficulty: "Advanced",
      description:
        "Provision a high-availability AWS architecture using Terraform IaC: VPC across 2 AZs, public/private subnets, Application Load Balancer, Auto-Scaling ECS Fargate cluster, and RDS Multi-AZ.",
      deliverables: ["Modular Terraform configuration", "Architecture diagram", "Load test script with auto-scaling verification"],
      recommendedTech: ["AWS", "Terraform", "Docker", "Kubernetes / ECS", "Linux", "Prometheus & Grafana"],
      demonstratedSkills: ["Infrastructure as Code", "High Availability Design", "Cloud Observability"],
      completed: false,
      phaseNumber: 5,
    },
  ],
  "data-science-analytics": [
    {
      id: "proj-ds-01",
      title: "Customer Churn Prediction & Cohort Analysis",
      difficulty: "Intermediate",
      description:
        "Perform exploratory cohort analysis on 100K+ customer transactions, engineer recency-frequency-monetary (RFM) features, train ensemble gradient-boosted trees, and evaluate ROI metrics.",
      deliverables: ["Clean Jupyter Notebook", "Executive presentation deck (PDF)", "Interactive Streamlit predictor"],
      recommendedTech: ["Python", "Pandas", "XGBoost", "Streamlit", "SQL"],
      demonstratedSkills: ["Predictive Modeling", "Feature Importance", "Business KPI Communication"],
      completed: false,
      phaseNumber: 3,
    },
    {
      id: "proj-ds-02",
      title: "Automated Real-Time ETL & BI Dashboard (Capstone)",
      difficulty: "Advanced",
      description:
        "Build a scalable data pipeline that streams data from external APIs into a columnar data warehouse, transforms dimensional models, and renders live dashboards.",
      deliverables: ["Airflow / Prefect pipeline code", "Star-schema warehouse scripts", "Live Tableau / PowerBI / Evidence dashboard"],
      recommendedTech: ["Python", "SQL", "PostgreSQL / BigQuery", "Docker"],
      demonstratedSkills: ["Dimensional Modeling", "Data Quality Testing", "ETL Orchestration"],
      completed: false,
      phaseNumber: 5,
    },
  ],
  "mobile-app-engineer": [
    {
      id: "proj-mb-01",
      title: "Offline-First Habit & Fitness Tracker",
      difficulty: "Intermediate",
      description:
        "Develop a cross-platform mobile application featuring local SQLite storage, background sync, swipe gestures, push notifications, and biometric authentication.",
      deliverables: ["Working mobile app build", "State management architecture", "App store screenshot assets"],
      recommendedTech: ["React Native", "TypeScript", "SQLite", "Tailwind CSS"],
      demonstratedSkills: ["Offline Storage", "Mobile Lifecycle", "Gesture Handling"],
      completed: false,
      phaseNumber: 3,
    },
  ],
  "cybersecurity-analyst": [
    {
      id: "proj-cs-01",
      title: "Vulnerability Assessment & Web App Penetration Test",
      difficulty: "Intermediate",
      description:
        "Conduct a controlled security assessment against OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR) on a test target, providing remediation patches.",
      deliverables: ["Comprehensive Penetration Test Report", "Proof-of-Concept exploits", "Remediated source code diffs"],
      recommendedTech: ["Linux", "Burp Suite", "Python", "Security Fundamentals"],
      demonstratedSkills: ["Vulnerability Auditing", "OWASP Standards", "Remediation Documentation"],
      completed: false,
      phaseNumber: 3,
    },
  ],
};

// ============================================================================
// 4. RECOMMENDATION ENGINE LOGIC
// ============================================================================

/**
 * Intelligent generator: Uses student profile, known skills, certifications,
 * projects, and optional wizard inputs to produce a 5-phase personalized path.
 */
export function generatePersonalizedPath(
  student: StudentRecord,
  input?: PathGenerationInput
): PersonalizedLearningPath {
  // 1. Determine Target Career Track
  let trackId: CareerTrackId = input?.targetTrackId || "ai-ml-specialist";
  
  // If not explicitly provided, deduce from student's chosen skills or profile
  if (!input?.targetTrackId && input?.selectedSkills && input.selectedSkills.length > 0) {
    const sLow = input.selectedSkills.map((s) => s.toLowerCase());
    if (sLow.some((s) => s.includes("react") || s.includes("next") || s.includes("web") || s.includes("node") || s.includes("full-stack") || s.includes("html") || s.includes("css"))) {
      trackId = "fullstack-architect";
    } else if (sLow.some((s) => s.includes("docker") || s.includes("aws") || s.includes("devops") || s.includes("cloud") || s.includes("kubernetes") || s.includes("linux"))) {
      trackId = "cloud-devops-engineer";
    } else if (sLow.some((s) => s.includes("data") || s.includes("analytics") || s.includes("bi"))) {
      trackId = "data-science-analytics";
    } else if (sLow.some((s) => s.includes("security") || s.includes("cyber") || s.includes("ethical"))) {
      trackId = "cybersecurity-analyst";
    } else if (sLow.some((s) => s.includes("android") || s.includes("mobile") || s.includes("react native") || s.includes("flutter") || s.includes("app dev"))) {
      trackId = "mobile-app-engineer";
    } else {
      trackId = "ai-ml-specialist";
    }
  } else if (!input?.targetTrackId) {
    const roles = student.profile?.preferences?.roles || [];
    const areas = student.profile?.preferences?.areas || [];
    const headline = (student.profile?.headline || "").toLowerCase();
    const bio = (student.profile?.bio || "").toLowerCase();

    if (
      roles.some((r) => /ai|machine learning|data scientist/i.test(r)) ||
      areas.some((a) => /ai|ml/i.test(a)) ||
      /ai|machine learning|neural/i.test(headline) ||
      /autonomous agents/i.test(bio)
    ) {
      trackId = "ai-ml-specialist";
    } else if (
      roles.some((r) => /cloud|devops|sre/i.test(r)) ||
      student.certifications?.some((c) => /aws|cloud|azure|gcp/i.test(c.title))
    ) {
      trackId = "cloud-devops-engineer";
    } else if (
      roles.some((r) => /full\s*stack|frontend|backend/i.test(r)) ||
      student.skills?.some((s) => /react|next\.js|node/i.test(s.name))
    ) {
      trackId = "fullstack-architect";
    }
  }

  const trackDef = CAREER_TRACKS.find((t) => t.id === trackId) || CAREER_TRACKS[0];

  // Combine track required skills with student's explicitly chosen skills
  const allTargetSkills = [...trackDef.requiredSkills];
  if (input?.selectedSkills && input.selectedSkills.length > 0) {
    for (const chosen of input.selectedSkills) {
      if (!allTargetSkills.some((s) => s.toLowerCase() === chosen.toLowerCase())) {
        allTargetSkills.push(chosen);
      }
    }
  }

  // 2. Analyze Student's Current Skills & Certifications
  const studentSkills = student.skills || [];
  const knownSkillMap = new Map<string, "Beginner" | "Intermediate" | "Advanced">();
  for (const s of studentSkills) {
    knownSkillMap.set(s.name.toLowerCase().trim(), s.level);
  }

  // Also check learning progress
  const learningRecords = student.learning || {};

  // Check known certifications
  const certNames = (student.certifications || []).map((c) => c.title);
  const hasCloudCert = certNames.some((c) => /aws|gcp|azure|cloud/i.test(c));

  // 3. Compute Skill Gaps & Explainable Reasons
  const skillGaps: SkillGapItem[] = [];

  for (const reqSkillName of allTargetSkills) {
    const lowerName = reqSkillName.toLowerCase().trim();
    const currentLvl = knownSkillMap.get(lowerName);

    const catalogSkill = SKILLS_CATALOG.find(
      (s) => s.name.toLowerCase() === lowerName || s.id.toLowerCase() === lowerName
    );
    const category = catalogSkill?.category || "Core Technology";

    if (currentLvl === "Advanced") {
      skillGaps.push({
        skillName: reqSkillName,
        category,
        currentStatus: "Mastered",
        currentLevel: "Advanced",
        targetLevel: "Advanced",
        priority: "Medium",
        reason: `You already demonstrate Advanced proficiency in ${reqSkillName}. We will leverage this strong foundation in advanced architectural modules.`,
      });
    } else if (currentLvl === "Intermediate") {
      skillGaps.push({
        skillName: reqSkillName,
        category,
        currentStatus: "In Progress",
        currentLevel: "Intermediate",
        targetLevel: "Advanced",
        priority: "High",
        reason: `You have solid Intermediate experience with ${reqSkillName}. Advancing this to production-grade mastery is key for ${trackDef.shortTitle}.`,
      });
    } else if (currentLvl === "Beginner") {
      skillGaps.push({
        skillName: reqSkillName,
        category,
        currentStatus: "In Progress",
        currentLevel: "Beginner",
        targetLevel: "Intermediate",
        priority: "High",
        reason: `Your profile lists ${reqSkillName} at Beginner level. We will build deeper fluency through video lectures, practical exercises, and quizzes.`,
      });
    } else {
      // Missing gap
      const isPrereq = ["Python", "JavaScript", "TypeScript", "Linux", "Git", "SQL", "Java", "C++"].includes(reqSkillName);
      skillGaps.push({
        skillName: reqSkillName,
        category,
        currentStatus: isPrereq ? "Prerequisite" : "Missing Gap",
        targetLevel: "Intermediate",
        priority: isPrereq ? "Prerequisite" : "High",
        reason: isPrereq
          ? `Essential prerequisite for ${trackDef.shortTitle} workflows. Starting here ensures smooth progress.`
          : `Core industry requirement for ${trackDef.shortTitle} positions that is not yet reflected in your profile.`,
      });
    }
  }

  // 4. Synthesize Academic Context Summary
  const degree = student.profile?.degree || "Engineering / Tech";
  const branch = student.profile?.branch || "Computer Science";
  const year = student.profile?.year ? `${student.profile.year}` : "Undergraduate";
  const college = student.profile?.college || "University";

  const academicContextSummary = `${degree} in ${branch} (${year}) at ${college}. ${studentSkills.length} verified profile skills, ${student.projects?.length || 0} completed projects, and ${student.certifications?.length || 0} external certifications.`;

  // 5. Synthesize Current Proficiency Assessment
  const masteredList = studentSkills.filter((s) => s.level === "Advanced").map((s) => s.name);
  const intermediateList = studentSkills.filter((s) => s.level === "Intermediate").map((s) => s.name);
  const beginnerList = studentSkills.filter((s) => s.level === "Beginner").map((s) => s.name);

  let currentProficiencyAssessment = "";
  if (masteredList.length > 0) {
    currentProficiencyAssessment += `Demonstrated strengths in ${masteredList.join(", ")} (Advanced). `;
  }
  if (intermediateList.length > 0) {
    currentProficiencyAssessment += `Active intermediate capabilities in ${intermediateList.join(", ")}. `;
  }
  if (beginnerList.length > 0) {
    currentProficiencyAssessment += `Developing familiarity with ${beginnerList.join(", ")}. `;
  }
  if (hasCloudCert) {
    currentProficiencyAssessment += `Backed by external credential (${certNames[0]}). `;
  }
  if (!currentProficiencyAssessment) {
    currentProficiencyAssessment = "Ready to build industry-standard competencies starting from foundational prerequisites.";
  }

  // 6. Target Goal & Weekly Hours
  const weeklyHoursTarget = input?.weeklyHours || 10;
  const targetGoal3to6m =
    input?.targetGoal3to6m ||
    `Build production-grade ${trackDef.shortTitle} projects and secure high-impact engineering opportunities.`;

  // 7. Structure the 5 Phases
  const trackCourses = VERIFIED_COURSE_CATALOG[trackId] || [];
  const trackProjects = TRACK_PROJECTS[trackId] || [];

  // Categorize track required skills into phases
  // Phase 1: Foundation (Languages & Basics: Python, JS, Linux, Git, SQL)
  // Phase 2: Core Domain Skills (Deep Learning, React, Next.js, Docker, Kubernetes)
  // Phase 3: Applied Hands-on Projects
  // Phase 4: Validation & Certifications
  // Phase 5: Career Ready Capstone & Interview Prep

  // Helper to map skill name to RecommendedSkillItem
  function buildRecommendedSkill(skillName: string, phaseNum: 1 | 2 | 3 | 4 | 5): RecommendedSkillItem {
    const catalogSkill = SKILLS_CATALOG.find(
      (s) => s.name.toLowerCase() === skillName.toLowerCase() || s.id.toLowerCase() === skillName.toLowerCase()
    );

    const skillId = catalogSkill?.id || skillName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const currentProgress = learningRecords[skillId];

    let status: RecommendedSkillItem["status"] = "recommended";
    if (currentProgress?.status === "Completed") {
      status = "completed";
    } else if (currentProgress?.status === "In Progress") {
      status = "in_progress";
    }

    const currentLevel = knownSkillMap.get(skillName.toLowerCase());
    let reason = "";
    if (currentLevel === "Advanced") {
      reason = `Recommended because you have Advanced mastery in ${skillName}, enabling rapid completion of architectural capstone requirements.`;
    } else if (currentLevel) {
      reason = `Recommended because you have ${currentLevel} experience in ${skillName} and targeting ${trackDef.shortTitle} requires deeper production mastery.`;
    } else if (phaseNum === 1) {
      reason = `Recommended as an essential prerequisite for your ${trackDef.shortTitle} journey based on your ${branch} curriculum.`;
    } else {
      reason = `Recommended because ${skillName} is a top skill demanded by employers hiring ${trackDef.shortTitle}s in 2026.`;
    }

    return {
      skillId,
      name: catalogSkill?.name || skillName,
      category: catalogSkill?.category || "Technical Skill",
      difficulty: catalogSkill?.difficulty || (phaseNum <= 1 ? "Beginner" : phaseNum <= 3 ? "Intermediate" : "Advanced"),
      estimatedHours: catalogSkill?.estimatedHours || 24,
      reason,
      isPrerequisite: phaseNum === 1,
      status,
      officialDocUrl: catalogSkill?.officialDocUrl || "https://developer.mozilla.org",
      lessonsCount: catalogSkill?.lessons?.length || 4,
    };
  }

  // Phase 1 skills (Foundational)
  const foundationSkillNames = allTargetSkills.filter((s) =>
    ["Python", "JavaScript", "TypeScript", "Linux", "Git", "SQL", "HTML", "CSS", "Security Fundamentals", "Java", "C++"].includes(s)
  );
  if (foundationSkillNames.length === 0) foundationSkillNames.push(allTargetSkills[0]);

  // Phase 2 skills (Core)
  const coreSkillNames = allTargetSkills.filter(
    (s) => !foundationSkillNames.includes(s)
  );
  if (coreSkillNames.length === 0 && allTargetSkills.length > 1) {
    coreSkillNames.push(allTargetSkills[1]);
  }

  // Build Phase 1
  const phase1Skills = foundationSkillNames.map((s) => buildRecommendedSkill(s, 1));
  const phase1Videos: RecommendedVideoItem[] = [];
  for (const s of phase1Skills) {
    const catSkill = getSkillById(s.skillId);
    if (catSkill?.lessons?.[0]?.videoUrl) {
      phase1Videos.push({
        id: `vid-${s.skillId}-01`,
        skillId: s.skillId,
        title: catSkill.lessons[0].videoTitle || `${catSkill.name} Full Tutorial`,
        instructorOrChannel: catSkill.lessons[0].instructor || "SkillBridge Curated",
        durationMinutes: catSkill.lessons[0].durationMinutes || 45,
        videoUrl: catSkill.lessons[0].videoUrl,
        youtubeUrl: catSkill.lessons[0].youtubeUrl || catSkill.lessons[0].videoUrl,
        summary: catSkill.lessons[0].summary,
        phaseNumber: 1,
        language: catSkill.lessons[0].language || "Hindi",
        isIndianCreator: catSkill.lessons[0].isIndianCreator ?? true,
        isPlaylist: catSkill.lessons[0].isPlaylist ?? true,
        playlistTitle: catSkill.lessons[0].playlistTitle,
      });
    }
  }

  const phase1: LearningPhase = {
    id: "phase-1",
    phaseNumber: 1,
    title: "Phase 1 — Build Your Foundation",
    subtitle: "Prerequisites, Fundamental Syntax & Tooling Setup",
    description: `Establish bulletproof command over foundational languages and developer tooling. This phase bridges any prerequisites missing from your ${branch} background before tackling advanced architectures.`,
    estimatedHours: phase1Skills.reduce((acc, s) => acc + s.estimatedHours, 0) || 30,
    estimatedWeeks: Math.max(1, Math.ceil((phase1Skills.reduce((acc, s) => acc + s.estimatedHours, 0) || 30) / weeklyHoursTarget)),
    skills: phase1Skills,
    videos: phase1Videos,
    coursesAndCerts: trackCourses.filter((c) => c.phaseNumber === 1),
    projects: [
      {
        id: "proj-p1-init",
        title: "Developer Environment & Syntax Benchmark Suite",
        difficulty: "Beginner",
        description: `Set up a clean modern development environment for ${trackDef.shortTitle}, configure linting, formatters, and implement benchmark algorithms demonstrating core syntax.`,
        deliverables: ["Configured repository", "Unit test suite with 100% pass", "Documented README"],
        recommendedTech: [foundationSkillNames[0] || "Git", "VS Code", "Terminal"],
        demonstratedSkills: ["Toolchain Setup", "Code Quality", "Version Control"],
        completed: false,
        phaseNumber: 1,
      },
    ],
    completed: phase1Skills.every((s) => s.status === "completed"),
  };

  // Build Phase 2
  const phase2Skills = coreSkillNames.map((s) => buildRecommendedSkill(s, 2));
  const phase2Videos: RecommendedVideoItem[] = [];
  for (const s of phase2Skills) {
    const catSkill = getSkillById(s.skillId);
    if (catSkill?.lessons?.[0]?.videoUrl) {
      phase2Videos.push({
        id: `vid-${s.skillId}-02`,
        skillId: s.skillId,
        title: catSkill.lessons[0].videoTitle || `${catSkill.name} Deep Dive`,
        instructorOrChannel: catSkill.lessons[0].instructor || "SkillBridge Masterclass",
        durationMinutes: catSkill.lessons[0].durationMinutes || 50,
        videoUrl: catSkill.lessons[0].videoUrl,
        youtubeUrl: catSkill.lessons[0].youtubeUrl || catSkill.lessons[0].videoUrl,
        summary: catSkill.lessons[0].summary,
        phaseNumber: 2,
        language: catSkill.lessons[0].language || "Hinglish",
        isIndianCreator: catSkill.lessons[0].isIndianCreator ?? true,
        isPlaylist: catSkill.lessons[0].isPlaylist ?? true,
        playlistTitle: catSkill.lessons[0].playlistTitle,
      });
    }
  }

  const phase2: LearningPhase = {
    id: "phase-2",
    phaseNumber: 2,
    title: "Phase 2 — Develop Core Skills",
    subtitle: "Primary Domain Competencies & System Architecture",
    description: `Dive into the core engineering technologies that define modern ${trackDef.shortTitle} roles. Learn how distributed systems, framework lifecycles, and backend integrations function under production load.`,
    estimatedHours: phase2Skills.reduce((acc, s) => acc + s.estimatedHours, 0) || 45,
    estimatedWeeks: Math.max(2, Math.ceil((phase2Skills.reduce((acc, s) => acc + s.estimatedHours, 0) || 45) / weeklyHoursTarget)),
    skills: phase2Skills,
    videos: phase2Videos,
    coursesAndCerts: trackCourses.filter((c) => c.phaseNumber === 2),
    projects: [
      {
        id: "proj-p2-core",
        title: `${trackDef.shortTitle} Core Integration Service`,
        difficulty: "Intermediate",
        description: `Build an integrated service showcasing your core skills in ${coreSkillNames.slice(0, 2).join(" & ")}, with automated test coverage and documentation.`,
        deliverables: ["Modular codebase", "Integration test suite", "Postman / OpenAPI schema"],
        recommendedTech: coreSkillNames.slice(0, 3),
        demonstratedSkills: ["Component Design", "API Contracts", "State Management"],
        completed: false,
        phaseNumber: 2,
      },
    ],
    completed: phase2Skills.length > 0 && phase2Skills.every((s) => s.status === "completed"),
  };

  // Build Phase 3 (Applied Hands-on Projects)
  const phase3Projects = trackProjects.filter((p) => p.phaseNumber === 3);
  const phase3: LearningPhase = {
    id: "phase-3",
    phaseNumber: 3,
    title: "Phase 3 — Apply Your Knowledge",
    subtitle: "Real-World Hands-on Project Implementation",
    description: `Transform theoretical understanding into tangible engineering output. Build practical, multi-component projects that solve actual industry challenges and demonstrate production engineering hygiene.`,
    estimatedHours: 40,
    estimatedWeeks: Math.max(2, Math.ceil(40 / weeklyHoursTarget)),
    skills: [
      {
        skillId: "applied-engineering",
        name: "Applied System Implementation",
        category: "Software Development",
        difficulty: "Intermediate",
        estimatedHours: 20,
        reason: "Applying multi-technology stacks in unified projects is the fastest way to solidify intermediate skills.",
        isPrerequisite: false,
        status: "recommended",
        officialDocUrl: "https://github.com",
        lessonsCount: 3,
      },
    ],
    videos: [
      {
        id: "vid-p3-system-design",
        skillId: "applied-engineering",
        title: "System Design for Real-World Applications",
        instructorOrChannel: "Gaurav Sen",
        durationMinutes: 45,
        videoUrl: "https://www.youtube-nocookie.com/embed/xpDnVSmNFX0",
        youtubeUrl: "https://www.youtube.com/watch?v=xpDnVSmNFX0",
        summary: "Architecting scalable data models, caching layers, and decoupled services.",
        phaseNumber: 3,
        language: "English",
        isIndianCreator: true,
        isPlaylist: true,
        playlistTitle: "System Design Masterclass",
      },
    ],
    coursesAndCerts: [],
    projects: phase3Projects,
    completed: phase3Projects.length > 0 && phase3Projects.every((p) => p.completed),
  };

  // Build Phase 4 (Validation & Certifications)
  const phase4Certs = trackCourses.filter((c) => c.phaseNumber === 4 || c.credentialType === "Industry Professional Certification");
  const phase4: LearningPhase = {
    id: "phase-4",
    phaseNumber: 4,
    title: "Phase 4 — Validate Your Skills",
    subtitle: "Official Credentials, Quizzes & Objective Proof",
    description: `Validate your capabilities through external vendor credentials and SkillBridge objective assessments. Distinguish between course completion badges and proctored industry certifications.`,
    estimatedHours: 35,
    estimatedWeeks: Math.max(2, Math.ceil(35 / weeklyHoursTarget)),
    skills: [
      {
        skillId: "skill-validation",
        name: "Skill Validation & Testing",
        category: "Professional & Career Skills",
        difficulty: "Intermediate",
        estimatedHours: 15,
        reason: "Verifying your knowledge with recognized exams and practical checkpoints provides credible evidence to hiring managers.",
        isPrerequisite: false,
        status: "recommended",
        officialDocUrl: "https://skillbridge.edu/certificates",
        lessonsCount: 4,
      },
    ],
    videos: [
      {
        id: "vid-p4-certs",
        skillId: "skill-validation",
        title: "Machine Learning & Engineering Certification Roadmap",
        instructorOrChannel: "Krish Naik",
        durationMinutes: 40,
        videoUrl: "https://www.youtube-nocookie.com/embed/1vsmaEfbnoE",
        youtubeUrl: "https://www.youtube.com/watch?v=1vsmaEfbnoE",
        summary: "How to prepare for industry-recognized certifications, exam questions, and hands-on validation.",
        phaseNumber: 4,
        language: "Hinglish",
        isIndianCreator: true,
        isPlaylist: true,
        playlistTitle: "Complete Certification Prep",
      },
    ],
    coursesAndCerts: phase4Certs.length > 0 ? phase4Certs : trackCourses,
    projects: [],
    completed: false,
  };

  // Build Phase 5 (Career Ready Capstone & Interview Prep)
  const phase5Projects = trackProjects.filter((p) => p.phaseNumber === 5);
  const phase5: LearningPhase = {
    id: "phase-5",
    phaseNumber: 5,
    title: "Phase 5 — Become Career Ready",
    subtitle: "Production Capstone, Portfolio Publishing & Interview Prep",
    description: `Polish your professional presence. Deploy an impressive capstone project to public cloud infrastructure, document your engineering decisions, and practice technical whiteboard and behavioral interview rounds.`,
    estimatedHours: 30,
    estimatedWeeks: Math.max(2, Math.ceil(30 / weeklyHoursTarget)),
    skills: [
      {
        skillId: "system-design-interview",
        name: "Technical Interview & System Design",
        category: "Professional & Career Skills",
        difficulty: "Advanced",
        estimatedHours: 20,
        reason: "Crucial for clearing final technical and architectural interview rounds at leading engineering organizations.",
        isPrerequisite: false,
        status: "recommended",
        officialDocUrl: "https://github.com/donnemartin/system-design-primer",
        lessonsCount: 4,
      },
    ],
    videos: [
      {
        id: "vid-p5-interview",
        skillId: "system-design-interview",
        title: "Complete A2Z Coding Interview & Problem Solving Sheet",
        instructorOrChannel: "takeUforward (Striver)",
        durationMinutes: 45,
        videoUrl: "https://www.youtube-nocookie.com/embed/0bHoB3568Eg",
        youtubeUrl: "https://www.youtube.com/watch?v=0bHoB3568Eg",
        summary: "Communication frameworks, time-complexity analysis, whiteboard coding rounds, and behavioral question frameworks.",
        phaseNumber: 5,
        language: "Hinglish",
        isIndianCreator: true,
        isPlaylist: true,
        playlistTitle: "Striver A2Z Interview Sheet",
      },
    ],
    coursesAndCerts: [],
    projects: phase5Projects,
    completed: false,
  };

  const phases = [phase1, phase2, phase3, phase4, phase5];

  // 8. Calculate Overall Metrics
  const allSkills = phases.flatMap((p) => p.skills);
  const completedSkills = allSkills.filter((s) => s.status === "completed").length;
  const totalHours = phases.reduce((acc, p) => acc + p.estimatedHours, 0);

  // Compute completed hours based on student learning records
  let completedHours = 0;
  for (const s of allSkills) {
    const prog = learningRecords[s.skillId];
    if (prog) {
      completedHours += prog.hoursSpent || 0;
    }
  }

  const allProjects = phases.flatMap((p) => p.projects);
  const completedProjects = allProjects.filter((p) => p.completed).length;

  const overallPercentage = Math.min(
    100,
    Math.round(
      (completedSkills / Math.max(1, allSkills.length)) * 40 +
      (completedProjects / Math.max(1, allProjects.length)) * 30 +
      (completedHours / Math.max(1, totalHours)) * 30
    )
  );

  const totalWeeks = Math.ceil(totalHours / weeklyHoursTarget);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + totalWeeks * 7);

  // 9. Determine Next Recommended Action
  let nextAction: NextRecommendedAction;

  // Find first uncompleted phase and skill
  const activePhase = phases.find((p) => !p.completed) || phases[0];
  const activeSkill = activePhase.skills.find((s) => s.status !== "completed") || activePhase.skills[0];

  if (activeSkill) {
    const catSkill = getSkillById(activeSkill.skillId);
    const uncompletedLesson = catSkill?.lessons?.find((l) => {
      const prog = learningRecords[activeSkill.skillId];
      return !prog?.completedLessonIds?.includes(l.id);
    }) || catSkill?.lessons?.[0];

    nextAction = {
      phaseId: activePhase.id,
      phaseNumber: activePhase.phaseNumber,
      phaseTitle: activePhase.title,
      skillId: activeSkill.skillId,
      skillName: activeSkill.name,
      actionType: "lesson",
      title: uncompletedLesson ? uncompletedLesson.title : `Learn ${activeSkill.name} Fundamentals`,
      url: uncompletedLesson?.videoUrl,
      estimatedMinutes: uncompletedLesson?.durationMinutes || 30,
      reason: `Immediate next step in ${activePhase.title}: master core concepts before moving to projects.`,
    };
  } else {
    nextAction = {
      phaseId: "phase-3",
      phaseNumber: 3,
      phaseTitle: "Phase 3 — Apply Your Knowledge",
      skillId: "applied-engineering",
      skillName: "Project Implementation",
      actionType: "project",
      title: "Build & Deploy Capstone Project",
      estimatedMinutes: 120,
      reason: "All foundational lessons complete; put your skills to the test with real deliverables.",
    };
  }

  return {
    id: `path-${student.profile?.degree ? "personalized" : "custom"}-${Date.now()}`,
    studentId: student.profile?.degree || "student-01",
    studentName: student.profile?.headline ? "Sambhav Jain" : "SkillBridge Scholar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    careerTrackId: trackId,
    targetRole: trackDef.title,
    targetGoal3to6m,
    weeklyHoursTarget,
    currentProficiencyAssessment,
    academicContextSummary,
    skillGaps,
    phases,
    customizations: {
      skippedSkillIds: [],
      acceptedSkillIds: allSkills.map((s) => s.skillId),
      completedProjectIds: [],
      completedCourseIds: [],
    },
    progress: {
      totalSkills: allSkills.length,
      completedSkills,
      totalHours,
      completedHours: Math.round(completedHours * 10) / 10,
      totalProjects: allProjects.length,
      completedProjects,
      overallPercentage,
      targetCompletionDate: targetDate.toISOString(),
    },
    nextRecommendedAction: nextAction,
  };
}

// ============================================================================
// 5. CONTEXTUAL LEARNING ASSISTANT INTELLIGENCE
// ============================================================================

export function getAssistantResponse(
  path: PersonalizedLearningPath,
  student: StudentRecord,
  query: string
): AssistantInteractionMessage {
  const q = query.toLowerCase().trim();
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 1. "What should I learn next?" / Next action
  if (/what\s+(should|do)\s+i\s+learn\s+next|next\s+step|what('s| is) next/i.test(q)) {
    const act = path.nextRecommendedAction;
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      content: `Based on your personalized roadmap for **${path.targetRole}**, your next recommended action is in **${act.phaseTitle}**:\n\n👉 **${act.title}** (${act.skillName})\n⏱️ Estimated time: ~${act.estimatedMinutes} minutes.\n\n*Why now:* ${act.reason}`,
      timestamp: now,
      actionPrompt: `Open ${act.skillName}`,
      suggestedAction: {
        type: "open_skill",
        targetId: act.skillId,
        label: `Start ${act.skillName}`,
      },
    };
  }

  // 2. "Why was this recommended?" / Recommendation reasoning
  if (/why\s+was\s+this(\s+skill)?\s+recommended|why\s+recommend|explain\s+recommendation/i.test(q)) {
    const gaps = path.skillGaps.filter((g) => g.currentStatus !== "Mastered");
    const topGaps = gaps.slice(0, 3).map((g) => `• **${g.skillName}**: ${g.reason}`).join("\n");

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      content: `Your personalized path is generated directly from your profile (${path.academicContextSummary}):\n\n${path.currentProficiencyAssessment}\n\n**Key reasons for recommendations:**\n${topGaps}\n\nEvery recommendation directly targets the competencies required to become a **${path.targetRole}**.`,
      timestamp: now,
    };
  }

  // 3. "Which video should I watch first?"
  if (/which\s+video|watch\s+first|recommended\s+video/i.test(q)) {
    const firstVid = path.phases[0]?.videos[0] || path.phases[1]?.videos[0];
    if (firstVid) {
      return {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: `I recommend starting with **"${firstVid.title}"** by *${firstVid.instructorOrChannel}* (~${firstVid.durationMinutes} mins).\n\n${firstVid.summary}\n\nYou can watch it directly in your SkillBridge video player without external distractions.`,
        timestamp: now,
        actionPrompt: `Watch Video`,
        suggestedAction: {
          type: "open_video",
          targetId: firstVid.skillId,
          label: `Watch Tutorial`,
        },
      };
    }
  }

  // 4. "What prerequisites do I need?"
  if (/prerequisite|prereq|what\s+do\s+i\s+need\s+first/i.test(q)) {
    const prereqs = path.skillGaps.filter((g) => g.priority === "Prerequisite" || g.currentStatus === "Prerequisite");
    const prereqList = prereqs.length > 0
      ? prereqs.map((p) => `• **${p.skillName}**: ${p.reason}`).join("\n")
      : "• All foundational prerequisites are satisfied based on your existing skills!";

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      content: `Here are the foundational prerequisites identified for **${path.targetRole}**:\n\n${prereqList}\n\nThese are placed in **Phase 1 — Build Your Foundation** so you don't face roadblocks later.`,
      timestamp: now,
    };
  }

  // 5. "Which project should I build?"
  if (/which\s+project|project\s+should\s+i\s+build|what\s+to\s+build/i.test(q)) {
    const proj = path.phases.flatMap((p) => p.projects).find((p) => !p.completed);
    if (proj) {
      return {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: `I recommend working on **${proj.title}** (${proj.difficulty} Level):\n\n${proj.description}\n\n**Key deliverables:**\n${proj.deliverables.map((d) => `• ${d}`).join("\n")}\n\n**Tech stack:** ${proj.recommendedTech.join(", ")}.`,
        timestamp: now,
      };
    }
  }

  // 6. "Am I progressing according to my plan?" / Velocity
  if (/progress|on\s+track|velocity|schedule|am\s+i\s+on\s+schedule/i.test(q)) {
    const p = path.progress;
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      content: `Here is your current progress breakdown:\n\n• **Overall Completion:** ${p.overallPercentage}%\n• **Skills Mastered:** ${p.completedSkills} / ${p.totalSkills}\n• **Study Time Logged:** ${p.completedHours} hrs (Target: ${path.weeklyHoursTarget} hrs/week)\n• **Projects Completed:** ${p.completedProjects} / ${p.totalProjects}\n• **Target Date:** ${new Date(p.targetCompletionDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}\n\nKeep up the steady pace to reach your goal: *"${path.targetGoal3to6m}"*!`,
      timestamp: now,
    };
  }

  // Default contextual response
  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    content: `I am your SkillBridge Learning Assistant for the **${path.targetRole}** track.\n\nI can help you prioritize what to learn next, explain why specific skills or courses were recommended, suggest hands-on projects, or analyze your study velocity. How can I help you today?`,
    timestamp: now,
  };
}
