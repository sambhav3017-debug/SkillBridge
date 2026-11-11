import { handle, jsonBody, ok } from "@/lib/server/http";
import { requireAcademiaUser } from "@/lib/server/auth";
import { manageAcademiaStudents } from "@/lib/server/academia-service";

export const POST = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await manageAcademiaStudents(user, await jsonBody(req), "POST"));
});

export const PATCH = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await manageAcademiaStudents(user, await jsonBody(req), "PATCH"));
});

export const DELETE = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  return ok(await manageAcademiaStudents(user, await jsonBody(req), "DELETE"));
});
