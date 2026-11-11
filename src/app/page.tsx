import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import FlowLines from "@/components/landing/FlowLines";
import SectionOpportunity from "@/components/landing/cinematic/SectionOpportunity";
import SectionBuild from "@/components/landing/cinematic/SectionBuild";
import SectionEcosystem from "@/components/landing/cinematic/SectionEcosystem";
import SectionProgression from "@/components/landing/cinematic/SectionProgression";
import SectionOutcomes from "@/components/landing/cinematic/SectionOutcomes";
import SectionClosingCta from "@/components/landing/cinematic/SectionClosingCta";
import CinematicFooter from "@/components/landing/cinematic/CinematicFooter";

export default function Home() {
  return (
    <div className="landing-page-root relative flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#080808] dark:text-[#CDCBCA] transition-colors duration-500">
      <Header />
      <main id="home" className="relative flex-1 bg-[#F8FAFC] dark:bg-[#080808] transition-colors duration-500">
        {/* Cinematic Hero Section with Robotic Hand Bridge & Continuous Animation (Preserved 100%) */}
        <Hero />

        {/* Section 1: Pathways to Accelerate Forward */}
        <SectionOpportunity />

        {/* Section 2: Turn Skills into Real Projects (Interactive Workspaces) */}
        <SectionBuild />

        {/* Section 3: Three Words, One Unified Network (Students, Academia, Industry) */}
        <SectionEcosystem />

        {/* Section 4: From Progress to Possibility (Milestone Lifecycle) */}
        <SectionProgression />

        {/* Section 5: Real Outcomes, Real Connections (Capabilities & Global Network) */}
        <SectionOutcomes />

        {/* Section 6: Your Future Is Built One Skill at a Time (Closing Horizon & Primary CTA) */}
        <SectionClosingCta />
      </main>

      {/* Decorative Brand Accent Flow Lines */}
      <FlowLines />

      {/* Elevated Responsive Cinematic Footer */}
      <CinematicFooter />
    </div>
  );
}
