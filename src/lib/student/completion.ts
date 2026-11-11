import type { StudentData } from "./types";

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  weight: number;
}

/** Profile completion derived purely from real stored data. */
export function getCompletion(d: StudentData) {
  const p = d.profile;
  const filled = (s: string) => s.trim().length > 0;
  const items: CompletionItem[] = [
    { key: "avatar", label: "Profile photo", done: filled(p.avatar), href: "/student/profile", weight: 5 },
    { key: "headline", label: "Professional headline", done: filled(p.headline), href: "/student/profile", weight: 10 },
    { key: "bio", label: "Short bio", done: filled(p.bio), href: "/student/profile", weight: 10 },
    {
      key: "education",
      label: "College and degree",
      done: filled(p.college) && filled(p.degree),
      href: "/student/profile",
      weight: 15,
    },
    { key: "grad", label: "Graduation year", done: filled(p.gradYear), href: "/student/profile", weight: 5 },
    { key: "skills", label: "At least 3 skills", done: d.skills.length >= 3, href: "/student/skills", weight: 15 },
    { key: "projects", label: "A project", done: d.projects.length >= 1, href: "/student/projects", weight: 15 },
    {
      key: "certs",
      label: "A certification",
      done: d.certifications.length >= 1,
      href: "/student/skills",
      weight: 5,
    },
    { key: "resume", label: "Resume", done: !!d.resume, href: "/student/profile#resume", weight: 10 },
    {
      key: "links",
      label: "LinkedIn, GitHub or portfolio link",
      done: filled(p.linkedin) || filled(p.github) || filled(p.portfolio),
      href: "/student/profile",
      weight: 5,
    },
    {
      key: "prefs",
      label: "Career preferences",
      done: p.preferences.types.length > 0 && p.preferences.modes.length > 0,
      href: "/student/settings",
      weight: 5,
    },
  ];
  const total = items.reduce((s, i) => s + i.weight, 0);
  const got = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  return { percent: Math.round((got / total) * 100), items, missing: items.filter((i) => !i.done) };
}
