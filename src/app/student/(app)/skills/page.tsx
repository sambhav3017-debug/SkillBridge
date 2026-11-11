import type { Metadata } from "next";
import GainSkillsMainView from "@/components/student/gain-skills/GainSkillsMainView";

export const metadata: Metadata = {
  title: "Gain Skills — SkillBridge Student Learning Platform",
  description:
    "Explore interactive skill roadmaps, video lectures, coding assignments, and knowledge checkpoints across technology and career domains.",
};

export default function GainSkillsPage() {
  return <GainSkillsMainView />;
}
