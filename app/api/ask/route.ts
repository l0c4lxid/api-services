import { getLlm7Client } from "@/lib/llm7";

export const runtime = "nodejs";

type AskPayload = {
  prompt?: string;
  model?: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export async function POST(request: Request) {
  if (!process.env.LLM7_API_KEY) {
    return Response.json(
      { code: 500, error: "Missing LLM7_API_KEY. Check .env.local." },
      { status: 500 },
    );
  }

  let payload: AskPayload;
  try {
    payload = (await request.json()) as AskPayload;
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return Response.json(
      { code: 400, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const prompt =
    typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  const model =
    typeof payload.model === "string" && payload.model.trim()
      ? payload.model.trim()
      : DEFAULT_MODEL;

  if (!prompt) {
    return Response.json(
      { code: 400, error: "Prompt is required." },
      { status: 400 },
    );
  }

  try {
    const systemPrompt =
      "Kamu adalah Local AI Assistant untuk API Console internal. " +
      "Jawab dalam Bahasa Indonesia, ringkas, jelas, dan sesuai kebutuhan developer. " +
      "Jika ditanya identitas, jelaskan bahwa kamu asisten lokal untuk pengujian API dan dokumentasi.";
    const llm7 = getLlm7Client();
    const completion = await llm7.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    if (!text) {
      return Response.json(
        { code: 502, error: "Empty response from LXID." },
        { status: 502 },
      );
    }

    return Response.json({
      code: 200,
      text,
      model,
      cost: "Local AI Assistant",
    });
  } catch (error) {
    console.error("LXID API error", error);
    const message =
      error instanceof Error ? error.message : "LXID API error.";
    return Response.json(
      { code: 500, error: `LXID API error: ${message}` },
      { status: 500 },
    );
  }
}
