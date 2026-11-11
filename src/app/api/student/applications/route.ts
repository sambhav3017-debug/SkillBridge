import { respond, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { applyTo, withdraw } from "@/lib/server/student-service";

export async function POST(req: Request) {
  return respond(async () => applyTo(await requireUser(), (await readJson(req)).opportunityId));
}
/** Withdraw — only allowed while the status is still "Applied". */
export async function DELETE(req: Request) {
  return respond(async () => withdraw(await requireUser(), (await readJson(req)).applicationId));
}
