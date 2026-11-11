import { redirect } from "next/navigation";
import AcademiaProvider from "@/components/academia/AcademiaProvider";
import AcademiaOnboardingWizard from "@/components/academia/AcademiaOnboardingWizard";
import { getCurrentAcademia } from "@/lib/server/academia-service";

export default async function AcademiaOnboardingPage() {
  const current = await getCurrentAcademia();
  if (!current) redirect("/academia/login");

  return (
    <AcademiaProvider initial={current}>
      <AcademiaOnboardingWizard />
    </AcademiaProvider>
  );
}
