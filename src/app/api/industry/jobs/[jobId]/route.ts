import { respond, readJson } from "@/lib/server/http";
import { requireIndustryUser } from "@/lib/server/auth";
import { deleteJob, updateJob } from "@/lib/server/industry-service";

export async function PATCH(req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params;
  return respond(async () => updateJob(await requireIndustryUser(), jobId, await readJson(req)));
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params;
  return respond(async () => deleteJob(await requireIndustryUser(), jobId));
}
