import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/student/OnboardingWizard";
import StudentProvider from "@/components/student/StudentProvider";
import { getCurrentStudent } from "@/lib/server/student-service";

export const metadata: Metadata = { title: "Set up your profile — SkillBridge" };

export default async function OnboardingPage() {
  const s = await getCurrentStudent();
  if (!s) redirect("/student/login");
  if (s.profile.onboarded) redirect("/student/dashboard");
  return (
    <StudentProvider initial={s}>
      <OnboardingWizard />
    </StudentProvider>
  );
}
