import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import FlowLines from "@/components/landing/FlowLines";
import StudentHero from "@/components/student-landing/StudentHero";
import GrowthJourney from "@/components/student-landing/GrowthJourney";
import LearningPaths from "@/components/student-landing/LearningPaths";
import StudentCTA from "@/components/student-landing/StudentCTA";
import { getCurrentStudent } from "@/lib/server/student-service";

export const metadata: Metadata = {
  title: "Students — SkillBridge | Learn. Build. Get Hired.",
  description:
    "Your skills are your superpower. SkillBridge connects students with personalized learning roadmaps, real-world verified capstones, and direct hiring opportunities.",
};

export default async function StudentLandingPage() {
  const student = await getCurrentStudent();
  const isLoggedIn = !!student;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-bg)] light:bg-[#F8F6F2] transition-colors duration-300 selection:bg-sb-cyan/20 selection:text-sb-cyan">
      {/* Top Floating Glass Navigation Header with Fluid Sliding Glass Indicator */}
      <Header />

      {/* Main Students Landing Content */}
      <main className="relative flex-1">
        {/* Hero Section with Interactive 3D Student Scene & Floating Glass Cards */}
        <StudentHero isLoggedIn={isLoggedIn} />

        {/* Growth Journey: 4-Step Pathway & Built for Your Success */}
        <div className="relative w-full light:bg-[#F0F3F8]/75 light:border-y light:border-[#E5E7EF] transition-colors duration-300">
          <GrowthJourney />
        </div>

        {/* Popular Learning Paths & Verified Capstones */}
        <LearningPaths />

        {/* Closing High-Impact Call to Action */}
        <StudentCTA isLoggedIn={isLoggedIn} />
      </main>

      {/* Background ambient flow lines */}
      <FlowLines />

      {/* Standard Platform Footer */}
      <footer className="relative border-t border-[var(--glass-border)] light:border-[#E5E7EF] px-6 py-10 text-center text-sm text-sb-muted">
        © {new Date().getFullYear()} SkillBridge. Your potential. Our bridge.
      </footer>
    </div>
  );
}
