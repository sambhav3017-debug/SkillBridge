import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/student/AuthShell";
import IndustrySignupForm from "@/components/industry/IndustrySignupForm";
import { getCurrentIndustry } from "@/lib/server/industry-service";

export const metadata: Metadata = { title: "Create Company Account — SkillBridge Industry" };

export default async function IndustrySignupPage() {
  const w = await getCurrentIndustry();
  if (w) redirect(w.recruiter.onboarded ? "/industry/dashboard" : "/industry/onboarding");
  return (
    <AuthShell
      wide
      title="Create your company account"
      subtitle="Set up your recruiting workspace to discover talent and post opportunities."
      footer={
        <>
          Already have a recruiter account?{" "}
          <Link href="/industry/login" className="font-medium text-sb-cyan underline-offset-2 hover:underline">
            Recruiter Login
          </Link>
        </>
      }
    >
      <IndustrySignupForm />
    </AuthShell>
  );
}
