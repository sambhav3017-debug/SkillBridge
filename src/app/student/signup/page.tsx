import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/student/AuthShell";
import SignupForm from "@/components/student/SignupForm";
import { getCurrentStudent } from "@/lib/server/student-service";

export const metadata: Metadata = { title: "Create Student Account — SkillBridge" };

export default async function SignupPage() {
  const s = await getCurrentStudent();
  if (s) redirect(s.profile.onboarded ? "/student/dashboard" : "/student/onboarding");
  return (
    <AuthShell
      title="Create your student account"
      subtitle="Start building your profile in a couple of minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/student/login" className="font-medium text-sb-cyan underline-offset-2 hover:underline">
            Log In
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
