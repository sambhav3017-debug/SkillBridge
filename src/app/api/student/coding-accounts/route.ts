import { respond } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { readDb } from "@/lib/server/db";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const student = db.students[user.id];

    return {
      accounts: student?.codingAccounts ? Object.values(student.codingAccounts) : [],
      stats: student?.codingStats || null,
      activities: student?.codingActivities || [],
    };
  });
}
