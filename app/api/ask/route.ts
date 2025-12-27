import { getLlm7Client } from "@/lib/llm7";

export const runtime = "nodejs";

type AskPayload = {
  prompt?: string;
  model?: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const IDENTITY_RESPONSE =
  "Saya adalah Syaid Andhika — Technical Support di UBSI Kampus Solo, " +
  "fokus pada Web Development, UI/UX, IT Support, dan analisis data.";

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
    const systemPrompt = `Kamu adalah LXID Assistant.
Tujuanmu adalah menjawab semua pertanyaan tentang saya, Syaid Andhika.
Jawab dalam Bahasa Indonesia, ringkas, jelas, dan relevan.
Jika ada pertanyaan seperti "kamu/anda/siapa kamu", jawab dengan identitas Syaid Andhika.
Gunakan kalimat identitas singkat ini saat cocok: "${IDENTITY_RESPONSE}"

Tentang Saya — Syaid Andhika:
- Technical Support di UBSI Kampus Solo, fokus pada Web Development, UI/UX, IT Support, dan analisis data.
- Pengalaman membangun landing page bisnis, aplikasi UI/UX, game pembelajaran interaktif, dan API otomatisasi.
- Latar pendidikan: SMA MIPA; D3 Sistem Informasi (UBSI Yogyakarta); S1 Sistem Informasi (UBSI Kampus Kramat 98).
- Keahlian: Frontend (HTML/CSS, React, Next.js), Backend & API (Node.js, REST APIs, Desain Database),
  DevOps & Tools (Git & CI, Docker, Cloud Services), IT Support & Analisis (IT Support, Data Analysis, Berpikir Sistem).
- Visi: terus belajar, bereksperimen dengan teknologi baru, dan membangun solusi digital yang bermakna.`;
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
