import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/student/AuthShell";

export const metadata: Metadata = { title: "Forgot password — SkillBridge" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Password reset isn't available yet" footer={<Link href="/student/login" className="font-medium text-sb-cyan hover:underline">Back to Log In</Link>}>
      <div className="space-y-3 text-sm leading-relaxed text-sb-muted">
        <p>
          Resetting a password by email needs an email provider and verified accounts, and this demo environment has neither
          configured, so no reset email would ever be sent.
        </p>
        <p>
          If you are logged in, you can change your password from <strong className="text-white">Settings</strong>. Otherwise, you can
          create a new account with a different email address.
        </p>
      </div>
    </AuthShell>
  );
}
