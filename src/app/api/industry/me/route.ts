import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { readDb } from "@/lib/server/db";
import { assembleWorkspace, updateIndustryMe } from "@/lib/server/industry-service";

export async function GET() {
  return respond(async () => {
    const user = await requireIndustryUser();
    return assembleWorkspace(user, await readDb());
  });
}

export async function PATCH(req: Request) {
  return respond(async () => updateIndustryMe(await requireIndustryUser(), await readJson(req)));
}
