import { respond, readJson } from "@/lib/server/http";
import { INDUSTRY_SESSION_COOKIE, setSessionCookie } from "@/lib/server/auth";
import { signupIndustry } from "@/lib/server/industry-service";

export async function POST(req: Request) {
  return respond(async () => {
    const { token, onboarded } = await signupIndustry(await readJson(req));
    await setSessionCookie(token, INDUSTRY_SESSION_COOKIE);
    return { onboarded };
  });
}
