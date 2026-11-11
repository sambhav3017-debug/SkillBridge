import { respond, readJson, ApiError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { readDb } from "@/lib/server/db";
import { toStudentData, updateStudent } from "@/lib/server/student-service";

export async function GET() {
  return respond(async () => {
    const user = await requireUser();
    const db = await readDb();
    const rec = db.students[user.id];
    if (!rec) throw new ApiError(404, "Student account not found.");
    return toStudentData(user, rec, db);
  });
}

/** Body may contain any of: account, profile, skills, certifications, projects. */
export async function PATCH(req: Request) {
  return respond(async () => updateStudent(await requireUser(), await readJson(req)));
}
