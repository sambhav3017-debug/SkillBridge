import { respond, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { deleteStudentTask, updateStudentTask } from "@/lib/server/student-service";

interface RouteProps {
  params: Promise<{ taskId: string }>;
}

export async function PATCH(req: Request, { params }: RouteProps) {
  const { taskId } = await params;
  return respond(async () => updateStudentTask(await requireUser(), taskId, await readJson(req)));
}

export async function DELETE(_req: Request, { params }: RouteProps) {
  const { taskId } = await params;
  return respond(async () => deleteStudentTask(await requireUser(), taskId));
}
