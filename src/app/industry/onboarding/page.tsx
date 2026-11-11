import type { Metadata } from "next";
import { redirect } from "next/navigation";
import IndustryOnboardingWizard from "@/components/industry/IndustryOnboardingWizard";
import IndustryProvider from "@/components/industry/IndustryProvider";
import { getCurrentIndustry } from "@/lib/server/industry-service";

export const metadata: Metadata = { title: "Company Setup & Verification — SkillBridge Industry" };

export default async function IndustryOnboardingPage() {
  const w = await getCurrentIndustry();
  if (!w) redirect("/industry/login");
  return (
    <IndustryProvider initial={w}>
      <IndustryOnboardingWizard />
    </IndustryProvider>
  );
}
