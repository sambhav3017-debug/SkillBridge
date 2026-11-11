import StudentsDirectoryView from "@/components/academia/StudentsDirectoryView";

export default async function AcademiaStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return <StudentsDirectoryView initialQuery={sp.q || ""} />;
}
