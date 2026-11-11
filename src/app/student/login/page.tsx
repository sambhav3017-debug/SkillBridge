import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentLoginSplit from "@/components/student/StudentLoginSplit";
import { getCurrentStudent } from "@/lib/server/student-service";

export const metadata: Metadata = { title: "Student Log In — SkillBridge" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string; loggedout?: string }>;
}) {
  const sp = await searchParams;
  const s = await getCurrentStudent();
  if (s) redirect(s.profile.onboarded ? "/student/dashboard" : "/student/onboarding");
  const notice = sp.expired
    ? "Your session has expired. Please log in again."
    : sp.loggedout
    ? "You have been logged out."
    : undefined;

  return <StudentLoginSplit next={sp.next} notice={notice} />;
}
