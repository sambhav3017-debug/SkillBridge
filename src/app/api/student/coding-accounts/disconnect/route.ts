import { ApiError, readJson, respond } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { disconnectAccount } from "@/lib/server/coding-connectors/sync-service";
import type { CodingPlatform } from "@/lib/student/types";

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const body = await readJson(req);

    const platform = body.platform as CodingPlatform;
    const purgeData = body.purgeData === true;

    if (!platform || (platform !== "github" && platform !== "leetcode" && platform !== "codechef")) {
      throw new ApiError(400, "Invalid coding platform. Supported: github, leetcode, codechef");
    }

    return disconnectAccount(user.id, platform, purgeData);
  });
}
