import { respond } from "@/lib/server/http";
import { clearSession, INDUSTRY_SESSION_COOKIE } from "@/lib/server/auth";

export async function POST() {
  return respond(async () => {
    await clearSession(INDUSTRY_SESSION_COOKIE);
    return { loggedOut: true };
  });
}
