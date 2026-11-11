import type { Metadata } from "next";
import ProjectsView from "@/components/student/ProjectsView";

export const metadata: Metadata = { title: "Projects — SkillBridge" };

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  return <ProjectsView autoOpen={sp.new === "1"} />;
}
