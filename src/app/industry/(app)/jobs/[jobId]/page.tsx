import JobEditorView from "@/components/industry/JobEditorView";

export default async function EditIndustryJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <JobEditorView jobId={jobId} />;
}
