import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { manageTeamMember } from "@/lib/server/industry-service";

export async function POST(req: Request) {
  return respond(async () => manageTeamMember(await requireIndustryUser(), await readJson(req), "POST"));
}

export async function PATCH(req: Request) {
  return respond(async () => manageTeamMember(await requireIndustryUser(), await readJson(req), "PATCH"));
}

export async function DELETE(req: Request) {
  return respond(async () => manageTeamMember(await requireIndustryUser(), await readJson(req), "DELETE"));
}
