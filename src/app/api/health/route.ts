import { NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    const db = await readDb();
    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: true,
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "connected",
            latencyMs: durationMs,
            records: {
              users: db.users.length,
              jobs: db.jobs.length,
            },
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("[health] check failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      {
        ok: false,
        status: "degraded",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "unavailable",
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
