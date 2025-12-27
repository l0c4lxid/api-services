export const runtime = "nodejs";

export function GET() {
  return Response.json({
    code: 200,
    status: "ok",
    service: "lxid-api",
    timestamp: new Date().toISOString(),
  });
}
