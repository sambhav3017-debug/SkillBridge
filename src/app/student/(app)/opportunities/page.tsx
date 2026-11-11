import type { Metadata } from "next";
import OpportunitiesView from "@/components/student/OpportunitiesView";

export const metadata: Metadata = { title: "Opportunities — SkillBridge" };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  return <OpportunitiesView openId={sp.id} />;
}
