export const runtime = "nodejs";

// POST /api/image-recognition
export async function POST(request) {
  // Validate API key existence.
  if (!process.env.LLM7_API_KEY) {
    return Response.json(
      { error: "Missing LLM7_API_KEY. Check .env.local." },
      { status: 500 },
    );
  }

  // Parse JSON body.
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const prompt =
    typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
  const imageUrl =
    typeof payload?.imageUrl === "string" ? payload.imageUrl.trim() : "";

  // Basic input validation.
  if (!prompt || !imageUrl) {
    return Response.json(
      { error: "prompt and imageUrl are required." },
      { status: 400 },
    );
  }

  const model =
    typeof payload?.model === "string" && payload.model.trim()
      ? payload.model.trim()
      : "gemini-2.5-flash-lite";

  // Build request payload for LXID vision-capable chat.
  const body = {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  };

  try {
    // Call LXID API directly (OpenAI-compatible).
    const response = await fetch("https://api.llm7.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM7_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Return upstream response as-is.
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("LXID API error", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "LXID API error occurred.",
      },
      { status: 500 },
    );
  }
}
