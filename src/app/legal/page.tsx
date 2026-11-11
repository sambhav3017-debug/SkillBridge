import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use & Privacy Policy — SkillBridge",
  description:
    "Review SkillBridge's terms of service, platform safety guidelines, credential verification standards, and privacy commitments.",
};

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 select-none">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-sb-muted hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to website
      </Link>
      <div className="mt-6 rounded-2xl border border-sb-cyan/30 bg-sb-cyan/5 px-5 py-3.5 text-xs text-sb-cyan leading-relaxed">
        <strong>SkillBridge Platform Notice:</strong> These terms govern academic and industry interactions across SkillBridge demonstration environments and authenticated institutional portals.
      </div>
      <section id="terms" className="mt-10 space-y-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-text)]">Terms of Use</h1>
        <p className="text-sm leading-relaxed text-sb-muted">
          SkillBridge provides verified collaboration infrastructure bridging university students, academic departments, and enterprise partners. Verified skill signatures, repository commits, and capstone milestones are validated through automated test pipelines and authorized faculty or employer reviews.
        </p>
      </section>
      <section id="privacy" className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-text)]">Privacy Policy</h2>
        <p className="text-sm leading-relaxed text-sb-muted">
          We prioritize data privacy and student agency. Student profile visibility to external recruiters is strictly opt-in and controlled via privacy settings. Authentication credentials and passwords are encrypted using secure cryptographic salt derivations.
        </p>
      </section>
    </main>
  );
}
