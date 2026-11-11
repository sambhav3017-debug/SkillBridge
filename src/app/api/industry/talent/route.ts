import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { toggleSavedCandidate } from "@/lib/server/industry-service";

export async function POST(req: Request) {
  return respond(async () => toggleSavedCandidate(await requireIndustryUser(), (await readJson(req)).candidateId, true));
}

export async function DELETE(req: Request) {
  return respond(async () => toggleSavedCandidate(await requireIndustryUser(), (await readJson(req)).candidateId, false));
}
