import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { readDb } from "@/lib/server/db";
import { assembleWorkspace, createOrDuplicateJob } from "@/lib/server/industry-service";

export async function GET() {
  return respond(async () => {
    const user = await requireIndustryUser();
    return (await assembleWorkspace(user, await readDb())).jobs;
  });
}

export async function POST(req: Request) {
  return respond(async () => createOrDuplicateJob(await requireIndustryUser(), await readJson(req)));
}
