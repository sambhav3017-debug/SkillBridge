import { readJson, respond } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { syncAllAccounts } from "@/lib/server/coding-connectors/sync-service";
import type { CodingPlatform } from "@/lib/student/types";

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    let specificPlatform: Exclude<CodingPlatform, "skillbridge"> | undefined;
    try {
      const body = await readJson(req);
      if (body && typeof body.platform === "string") {
        specificPlatform = body.platform as Exclude<CodingPlatform, "skillbridge">;
      }
    } catch {}

    return syncAllAccounts(user.id, specificPlatform);
  });
}
