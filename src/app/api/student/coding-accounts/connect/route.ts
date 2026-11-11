import { ApiError, readJson, respond } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { connectAccount } from "@/lib/server/coding-connectors/sync-service";
import type { CodingPlatform } from "@/lib/student/types";

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = await readJson(req);

    const platform = body.platform as CodingPlatform;
    const username = typeof body.username === "string" ? body.username.trim() : "";

    if (!platform || (platform !== "github" && platform !== "leetcode" && platform !== "codechef")) {
      throw new ApiError(400, "Invalid coding platform. Supported: github, leetcode, codechef");
    }

    if (!username || username.length > 60) {
      throw new ApiError(400, "Please provide a valid platform username.");
    }

    return connectAccount(user.id, platform, username);
  });
}
