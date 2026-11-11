import { respond, readJson } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { signup } from "@/lib/server/student-service";

export async function POST(req: Request) {
  return respond(async () => {
    const { token, onboarded } = await signup(await readJson(req));
    await setSessionCookie(token);
    return { onboarded };
  });
}
