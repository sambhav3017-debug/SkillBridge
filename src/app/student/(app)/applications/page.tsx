import type { Metadata } from "next";
import ApplicationsView from "@/components/student/ApplicationsView";

export const metadata: Metadata = { title: "Applications — SkillBridge" };

export default function Page() {
  return <ApplicationsView />;
}
