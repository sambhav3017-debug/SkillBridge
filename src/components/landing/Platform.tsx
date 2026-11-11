"use client";

import { BookOpen, Compass, Library, Users } from "lucide-react";
import { useInView } from "@/components/motion/MotionHooks";

const ITEMS = [
  {
    id: "opportunities",
    icon: Compass,
    title: "Opportunities",
    text: "Internships, jobs and live projects posted by industry and matched to what students can do.",
    color: "#ff2d95",
  },
  {
    id: "skills",
    icon: BookOpen,
    title: "Skills",
    text: "Personalised roadmaps that map classroom learning to the skills employers ask for.",
    color: "#19b8e6",
  },
  {
    id: "resources",
    icon: Library,
    title: "Resources",
    text: "Guides, templates and structured feedback to help you prepare, apply and improve.",
    color: "#19b8e6",
  },
  {
    id: "about",
    icon: Users,
    title: "About",
    text: "SkillBridge links students, industry and academia so potential meets opportunity.",
    color: "#ff2d95",
  },
] as const;

export default function Platform() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 sm:px-8">
      <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
        {ITEMS.map(({ id, icon: Icon, title, text, color }, idx) => (
          <section
            key={id}
            id={id}
            className={`flex items-start gap-4 border-t border-[var(--glass-border)] py-7 transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: `${idx * 120}ms` }}
          >
            <div
              className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[var(--glass-border)] bg-white/[0.03] light:bg-[#FFFEFC] light:border-[#E5E7EF] light:shadow-[0_2px_8px_rgba(32,37,54,0.04)] transition-transform duration-300 hover:scale-110"
              style={{ color }}
            >
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-sb-text light:text-[#202536]">{title}</h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-sb-muted light:text-[#596579]">{text}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
