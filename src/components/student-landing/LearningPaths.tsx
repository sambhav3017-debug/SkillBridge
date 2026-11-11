"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  Database,
  Layers,
  Lock,
  Smartphone,
  Star,
  Timer,
  Users,
} from "lucide-react";

const PATHS = [
  {
    id: "ai-ml",
    title: "AI & Machine Learning Engineer",
    icon: BrainCircuit,
    category: "Artificial Intelligence",
    duration: "12 Weeks",
    projects: "6 Capstones",
    level: "Intermediate",
    rating: "4.92",
    students: "2.4k enrolled",
    color: "from-purple-500 to-indigo-500",
    skills: ["Python", "PyTorch", "LangChain", "Vector DBs", "RAG"],
    featuredCapstone: "Enterprise Multi-Agent RAG Assistant",
  },
  {
    id: "fullstack",
    title: "Fullstack Web & Cloud Architect",
    icon: Layers,
    category: "Web & Systems",
    duration: "10 Weeks",
    projects: "8 Capstones",
    level: "All Levels",
    rating: "4.96",
    students: "3.8k enrolled",
    color: "from-blue-500 to-cyan-400",
    skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "GCP"],
    featuredCapstone: "Real-time Collaborative SaaS Workspace",
  },
  {
    id: "devops",
    title: "Cloud DevOps & Site Reliability",
    icon: Cloud,
    category: "Infrastructure",
    duration: "8 Weeks",
    projects: "5 Capstones",
    level: "Advanced",
    rating: "4.88",
    students: "1.9k enrolled",
    color: "from-emerald-500 to-teal-400",
    skills: ["Docker", "Kubernetes", "Terraform", "CI/CD", "Prometheus"],
    featuredCapstone: "Zero-Downtime Microservices Deployment Pipeline",
  },
  {
    id: "data-science",
    title: "Data Science & BigQuery Analytics",
    icon: Database,
    category: "Data Engineering",
    duration: "8 Weeks",
    projects: "4 Capstones",
    level: "Beginner",
    rating: "4.90",
    students: "2.1k enrolled",
    color: "from-amber-500 to-orange-400",
    skills: ["SQL", "BigQuery", "Pandas", "Scikit-Learn", "Tableau"],
    featuredCapstone: "Predictive Customer Churn ML Pipeline",
  },
  {
    id: "mobile",
    title: "Mobile App Development",
    icon: Smartphone,
    category: "Mobile Systems",
    duration: "10 Weeks",
    projects: "5 Capstones",
    level: "Intermediate",
    rating: "4.89",
    students: "1.5k enrolled",
    color: "from-pink-500 to-rose-400",
    skills: ["Flutter", "Dart", "Firebase", "REST APIs", "Offline Sync"],
    featuredCapstone: "Cross-Platform Social Fitness Application",
  },
  {
    id: "security",
    title: "Cybersecurity & Network Defense",
    icon: Lock,
    category: "Security",
    duration: "12 Weeks",
    projects: "7 Capstones",
    level: "Advanced",
    rating: "4.94",
    students: "1.2k enrolled",
    color: "from-red-500 to-pink-500",
    skills: ["OWASP Top 10", "Penetration Testing", "Linux", "SIEM", "Cloud Sec"],
    featuredCapstone: "Automated Vulnerability Scanner & Threat Hunter",
  },
] as const;

export default function LearningPaths() {
  return (
    <section
      className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 border-t border-[var(--glass-border)]"
      aria-label="Popular learning paths"
    >
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sb-pink mb-2">
            <Star size={14} className="fill-sb-pink text-sb-pink" /> Industry Curated Tracks
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-sb-text">
            Popular Learning Paths
          </h2>
        </div>
        <Link
          href="/student/projects"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-sb-cyan hover:text-sb-pink transition-colors"
        >
          <span>View All Roadmaps & Capstones</span>
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-[var(--card-glass-border)] bg-[var(--card-glass-bg)] p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-sb-cyan/40 backdrop-blur-md"
            >
              <div>
                {/* Header with icon and duration badges */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr ${path.color} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon size={22} />
                  </span>
                  <div className="flex items-center gap-2 text-xs text-sb-muted font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Timer size={13} /> {path.duration}
                    </span>
                    <span>·</span>
                    <span>{path.projects}</span>
                  </div>
                </div>

                {/* Category & Title */}
                <p className="text-[11px] font-bold uppercase tracking-wider text-sb-cyan">
                  {path.category}
                </p>
                <h3 className="mt-1 text-lg font-bold text-sb-text group-hover:text-sb-cyan transition-colors line-clamp-1">
                  {path.title}
                </h3>

                {/* Rating and students count */}
                <div className="mt-2.5 flex items-center gap-3 text-xs text-sb-muted">
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <Star size={13} className="fill-amber-500" /> {path.rating}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} /> {path.students}
                  </span>
                </div>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {path.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-[var(--glass-border)] bg-black/5 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-sb-text"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Featured Capstone Preview */}
                <div className="mt-4 rounded-xl border border-[var(--glass-border)] bg-black/[0.02] dark:bg-white/[0.02] p-3 text-xs">
                  <p className="text-[10px] uppercase font-bold text-sb-muted">Capstone Build</p>
                  <p className="mt-0.5 font-semibold text-sb-text line-clamp-1">
                    {path.featuredCapstone}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                <span className="text-xs font-semibold text-sb-muted group-hover:text-sb-text transition-colors">
                  {path.level}
                </span>
                <Link
                  href="/student/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sb-cyan group-hover:text-sb-pink transition-colors"
                >
                  <span>Explore Path</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
