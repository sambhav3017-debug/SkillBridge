import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Wraps a route handler: converts ApiError to JSON, hides unexpected error details. */
export async function respond<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    return NextResponse.json({ ok: true, data: await fn() });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ ok: false, error: e.message, fieldErrors: e.fieldErrors }, { status: e.status });
    }
    console.error("[api] unexpected error", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {}
  throw new ApiError(400, "Invalid request body.");
}

export const jsonBody = readJson;

export function ok<T>(data: T): NextResponse {
  return NextResponse.json({ ok: true, data });
}

export function handle(fn: (req: Request) => Promise<NextResponse>) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ ok: false, error: e.message, fieldErrors: e.fieldErrors }, { status: e.status });
      }
      console.error("[api] unexpected error", e instanceof Error ? e.message : "unknown");
      return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}
