import { respond } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { readDb } from "@/lib/server/db";
import { getAllStudentOpportunities } from "@/lib/server/opportunities";

/** Returns published Industry jobs merged with the sample catalogue. */
export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    const preserveIds = rec
      ? [...rec.saved, ...rec.applications.map((a) => a.opportunityId)]
      : [];
    return getAllStudentOpportunities(preserveIds);
  });
}
