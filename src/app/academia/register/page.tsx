import Link from "next/link";
import { redirect } from "next/navigation";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AcademiaRegisterForm from "@/components/academia/AcademiaRegisterForm";
import { getCurrentAcademia } from "@/lib/server/academia-service";

export default async function AcademiaRegisterPage() {
  const current = await getCurrentAcademia();
  if (current) {
    redirect(current.staff.onboarded ? "/academia/dashboard" : "/academia/onboarding");
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[130px]" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <SkillBridgeWordmark portal="academia" />{" "}
              <span className="text-xs font-semibold text-sb-pink">Academia</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <Link href="/academia" className="text-xs text-sb-muted hover:text-white">
              ← Academia Overview
            </Link>
          </div>
        </div>

        <section className="glass p-6 sm:p-9">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Register Your Institution</h1>
          <p className="mt-1.5 text-sm text-sb-muted">
            Create an official campus workspace for your university, college, or Training &amp; Placement Cell.
          </p>

          <div className="mt-6">
            <AcademiaRegisterForm />
          </div>

          <p className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-sb-muted">
            Already registered your institution?{" "}
            <Link href="/academia/login" className="font-semibold text-sb-cyan hover:underline">
              Sign in to Academia Portal
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
