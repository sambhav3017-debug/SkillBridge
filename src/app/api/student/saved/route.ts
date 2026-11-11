import { respond, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { setSaved } from "@/lib/server/student-service";

export async function POST(req: Request) {
  return respond(async () => setSaved(await requireUser(), (await readJson(req)).opportunityId, true));
}
export async function DELETE(req: Request) {
  return respond(async () => setSaved(await requireUser(), (await readJson(req)).opportunityId, false));
}
