import { respond } from "@/lib/server/http";
import { clearSession } from "@/lib/server/auth";

export async function POST() {
  return respond(async () => {
    await clearSession();
    return { loggedOut: true };
  });
}
