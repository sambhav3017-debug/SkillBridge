import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AcademiaProvider from "@/components/academia/AcademiaProvider";
import AcademiaAppShell from "@/components/academia/AcademiaAppShell";
import { getCurrentAcademia } from "@/lib/server/academia-service";

export const metadata: Metadata = {
  title: "Academia Institution Portal",
  description: "Manage student cohorts, faculty research labs, curriculum benchmarks, and placement outcomes on SkillBridge.",
};

export default async function AcademiaAppLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentAcademia();
  if (!current) redirect("/academia/login");
  if (!current.staff.onboarded) redirect("/academia/onboarding");

  return (
    <AcademiaProvider initial={current}>
      <AcademiaAppShell>{children}</AcademiaAppShell>
    </AcademiaProvider>
  );
}
