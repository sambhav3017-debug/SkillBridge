import type { Metadata } from "next";
import SavedView from "@/components/student/SavedView";

export const metadata: Metadata = { title: "Saved Opportunities — SkillBridge" };

export default function Page() {
  return <SavedView />;
}
