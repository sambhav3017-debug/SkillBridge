import type { Metadata } from "next";
import SettingsView from "@/components/student/SettingsView";

export const metadata: Metadata = { title: "Settings — SkillBridge" };

export default function Page() {
  return <SettingsView />;
}
