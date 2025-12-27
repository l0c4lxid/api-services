export const runtime = "nodejs";

export function GET() {
  return Response.json({
    status: "ok",
    service: "gemini-api",
    timestamp: new Date().toISOString(),
  });
}
