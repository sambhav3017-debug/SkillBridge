import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { updateApplicants } from "@/lib/server/industry-service";

export async function PATCH(req: Request) {
  return respond(async () => updateApplicants(await requireIndustryUser(), await readJson(req)));
}
