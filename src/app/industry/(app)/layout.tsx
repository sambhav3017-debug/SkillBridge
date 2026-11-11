import type { Metadata } from "next";
import { redirect } from "next/navigation";
import IndustryAppShell from "@/components/industry/IndustryAppShell";
import IndustryProvider from "@/components/industry/IndustryProvider";
import { getCurrentIndustry } from "@/lib/server/industry-service";

export const metadata: Metadata = {
  title: "Industry Enterprise Portal",
  description: "Hire verified graduates, mentor capstone projects, and build pre-placement talent pipelines on SkillBridge.",
};

/** Protected layout for all authenticated Industry workspace routes. */
export default async function IndustryAppLayout({ children }: { children: React.ReactNode }) {
  const w = await getCurrentIndustry();
  if (!w) redirect("/industry/login");
  if (!w.recruiter.onboarded) redirect("/industry/onboarding");
  return (
    <IndustryProvider initial={w}>
      <IndustryAppShell>{children}</IndustryAppShell>
    </IndustryProvider>
  );
}
