import { handle, jsonBody, ok } from "@/lib/server/http";
import { ACADEMIA_SESSION_COOKIE, setSessionCookie } from "@/lib/server/auth";
import { registerAcademia } from "@/lib/server/academia-service";

export const POST = handle(async (req: Request) => {
  const { token, onboarded } = await registerAcademia(await jsonBody(req));
  await setSessionCookie(token, ACADEMIA_SESSION_COOKIE);
  return ok({ onboarded });
});
