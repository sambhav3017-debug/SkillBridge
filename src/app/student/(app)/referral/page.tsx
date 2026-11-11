import type { Metadata } from "next";
import ReferralView from "@/components/student/ReferralView";

export const metadata: Metadata = {
  title: "Peer Referrals — SkillBridge Student Portal",
  description: "Invite classmates to SkillBridge, earn verified endorsements, and unlock priority recruiter mentorship.",
};

export default function StudentReferralPage() {
  return <ReferralView />;
}
