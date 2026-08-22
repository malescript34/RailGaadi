import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/production";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "monitoring", 10);
  if (limited) return limited;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return NextResponse.json({ accepted: true });
  try {
    const body = await request.json() as { message?: string; stack?: string; digest?: string };
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    const endpoint = `${url.protocol}//${url.host}/api/${projectId}/store/?sentry_key=${url.username}`;
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "javascript", level: "error", message: body.message || "Unknown application error", exception: { values: [{ type: "Error", value: body.message, stacktrace: body.stack ? { frames: [] } : undefined }] }, tags: body.digest ? { digest: body.digest } : undefined }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) { console.error("Sentry error transport failed", error); }
  return NextResponse.json({ accepted: true });
}
