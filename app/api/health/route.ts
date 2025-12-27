export const runtime = "nodejs";

export function GET() {
  return Response.json({
    status: "ok",
    service: "llm7-api",
    timestamp: new Date().toISOString(),
  });
}
