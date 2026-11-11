import { handle, ok } from "@/lib/server/http";
import { ACADEMIA_SESSION_COOKIE, clearSession } from "@/lib/server/auth";

export const POST = handle(async () => {
  await clearSession(ACADEMIA_SESSION_COOKIE);
  return ok({ loggedOut: true });
});
