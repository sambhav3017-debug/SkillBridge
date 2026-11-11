import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/student/AuthShell";
import IndustryLoginForm from "@/components/industry/IndustryLoginForm";
import { getCurrentIndustry } from "@/lib/server/industry-service";

export const metadata: Metadata = { title: "Recruiter Login — SkillBridge Industry" };

export default async function IndustryLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string; loggedout?: string }>;
}) {
  const sp = await searchParams;
  const w = await getCurrentIndustry();
  if (w) redirect(w.recruiter.onboarded ? "/industry/dashboard" : "/industry/onboarding");
  const notice = sp.expired
    ? "Your session has expired. Please log in again."
    : sp.loggedout
      ? "You have been logged out."
      : undefined;

  return (
    <AuthShell
      title="Recruiter Login"
      subtitle="Access your company's hiring pipeline and talent workspace."
      footer={
        <>
          New to SkillBridge Industry?{" "}
          <Link href="/industry/signup" className="font-medium text-sb-cyan underline-offset-2 hover:underline">
            Create a company account
          </Link>
        </>
      }
    >
      <IndustryLoginForm next={sp.next} notice={notice} />
    </AuthShell>
  );
}
