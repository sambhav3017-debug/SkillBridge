import { respond, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { createStudentTask, getStudentTasks } from "@/lib/server/student-service";

export async function GET() {
  return respond(async () => getStudentTasks(await requireUser()));
}

export async function POST(req: Request) {
  return respond(async () => createStudentTask(await requireUser(), await readJson(req)));
}
