import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/student/AppShell";
import StudentProvider from "@/components/student/StudentProvider";
import { getCurrentStudent } from "@/lib/server/student-service";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Accelerate your career through accredited skill roadmaps, capstones, and industry internships on SkillBridge.",
};

/** Route protection: every page in this group requires a valid session and a finished onboarding. */
export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const s = await getCurrentStudent();
  if (!s) redirect("/student/login");
  if (!s.profile.onboarded) redirect("/student/onboarding");
  return (
    <StudentProvider initial={s}>
      <AppShell>{children}</AppShell>
    </StudentProvider>
  );
}
