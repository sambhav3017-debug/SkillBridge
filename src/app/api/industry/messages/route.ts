import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { markConversationRead, sendOrStartMessage } from "@/lib/server/industry-service";

export async function POST(req: Request) {
  return respond(async () => sendOrStartMessage(await requireIndustryUser(), await readJson(req)));
}

export async function PATCH(req: Request) {
  return respond(async () => markConversationRead(await requireIndustryUser(), (await readJson(req)).conversationId));
}
