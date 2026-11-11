import type { Metadata } from "next";
import DashboardView from "@/components/student/DashboardView";

export const metadata: Metadata = { title: "Dashboard — SkillBridge" };

export default function Page() {
  return <DashboardView />;
}
