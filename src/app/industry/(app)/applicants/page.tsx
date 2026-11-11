import ApplicantsView from "@/components/industry/ApplicantsView";

export default async function IndustryApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; stage?: string; appId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <ApplicantsView
      initialJobId={sp.jobId || "All"}
      initialStage={sp.stage || "All"}
      initialAppId={sp.appId || ""}
    />
  );
}
