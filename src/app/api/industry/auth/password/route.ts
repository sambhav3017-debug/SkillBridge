import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { changePassword } from "@/lib/server/student-service";

export async function POST(req: Request) {
  return respond(async () => changePassword(await requireIndustryUser(), await readJson(req)));
}
