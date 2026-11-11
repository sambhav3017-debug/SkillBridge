import { handle, jsonBody, ok } from "@/lib/server/http";
import { requireAcademiaUser } from "@/lib/server/auth";
import { saveOrDeleteAnnouncement } from "@/lib/server/academia-service";

export const POST = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await saveOrDeleteAnnouncement(user, await jsonBody(req), "POST"));
});

export const DELETE = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await saveOrDeleteAnnouncement(user, await jsonBody(req), "DELETE"));
});
