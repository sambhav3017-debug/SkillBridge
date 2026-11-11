import TalentDiscoveryView from "@/components/industry/TalentDiscoveryView";

export default async function IndustryTalentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return <TalentDiscoveryView initialQuery={sp.q || ""} />;
}
