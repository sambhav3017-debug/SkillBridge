import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { scheduleOrUpdateInterview } from "@/lib/server/industry-service";

export async function POST(req: Request) {
  return respond(async () => scheduleOrUpdateInterview(await requireIndustryUser(), await readJson(req)));
}

export async function PATCH(req: Request) {
  return respond(async () => scheduleOrUpdateInterview(await requireIndustryUser(), await readJson(req)));
}
