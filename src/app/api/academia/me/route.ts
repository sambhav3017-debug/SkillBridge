import { handle, jsonBody, ok } from "@/lib/server/http";
import { requireAcademiaUser } from "@/lib/server/auth";
import { assembleAcademiaWorkspace, updateAcademiaMe } from "@/lib/server/academia-service";
import { readDb } from "@/lib/server/db";

export const GET = handle(async () => {
  const user = await requireAcademiaUser();
  const db = await readDb();
  return ok(assembleAcademiaWorkspace(user, db));
});

export const PATCH = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await updateAcademiaMe(user, await jsonBody(req)));
});
