import type { Metadata } from "next";
import ProfileView from "@/components/student/ProfileView";

export const metadata: Metadata = { title: "My Profile — SkillBridge" };

export default function Page() {
  return <ProfileView />;
}
