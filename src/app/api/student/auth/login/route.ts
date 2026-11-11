import { respond, readJson } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { login } from "@/lib/server/student-service";

export async function POST(req: Request) {
  return respond(async () => {
    const { token, onboarded } = await login(await readJson(req));
    await setSessionCookie(token);
    return { onboarded };
  });
}
