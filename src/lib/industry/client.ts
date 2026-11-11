/** Typed fetch helper for Industry API endpoints. */

export type IndustryApiResult<T = unknown> =
  | { ok: true; data: T; status: number }
  | {
      ok: false;
      data?: undefined;
      error: string;
      fieldErrors?: Record<string, string>;
      status: number;
    };

export async function industryApi<T = unknown>(
  url: string,
  init?: RequestInit & { json?: unknown },
): Promise<IndustryApiResult<T>> {
  try {
    const { json, ...rest } = init ?? {};
    const res = await fetch(url, {
      ...rest,
      headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: "same-origin",
    });
    const body = await res.json().catch(() => null);
    if (res.status === 401 && typeof window !== "undefined" && !url.includes("/auth/login")) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/industry/login?expired=1");
    }
    if (body && body.ok) return { ok: true, data: body.data as T, status: res.status };
    return {
      ok: false,
      error: body?.error ?? "Something went wrong. Please try again.",
      fieldErrors: body?.fieldErrors,
      status: res.status,
    };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again.", status: 0 };
  }
}
