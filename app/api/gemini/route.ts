import { ThinkingLevel } from "@google/genai";
import mime from "mime";
import { gemini } from "@/lib/gemini";
import { MODEL_DEFINITIONS } from "@/lib/models";

export const runtime = "nodejs";

const encoder = new TextEncoder();

type ParsedApiError = {
  status?: number;
  message?: string;
};

const MODEL_MAP = new Map(
  MODEL_DEFINITIONS.map((model) => [model.id, model]),
);

function parseGeminiError(error: unknown): ParsedApiError {
  let status: number | undefined;
  let message: string | undefined;

  if (typeof error === "object" && error) {
    const anyError = error as { status?: number; code?: number; message?: string };
    if (typeof anyError.status === "number") {
      status = anyError.status;
    } else if (typeof anyError.code === "number") {
      status = anyError.code;
    }
    if (typeof anyError.message === "string") {
      message = anyError.message;
    }
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as {
          error?: { code?: number; message?: string };
        };
        if (typeof parsed?.error?.code === "number" && !status) {
          status = parsed.error.code;
        }
        if (parsed?.error?.message && !message) {
          message = parsed.error.message;
        }
      } catch {
        // Ignore JSON parse errors and fall back to message.
      }
    }
  }

  if (!message && error instanceof Error) {
    message = error.message;
  }

  return { status, message };
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response("Missing GEMINI_API_KEY. Check .env.local.", {
      status: 500,
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  const prompt =
    typeof (payload as { prompt?: string })?.prompt === "string"
      ? (payload as { prompt: string }).prompt.trim()
      : "";
  const model =
    typeof (payload as { model?: string })?.model === "string"
      ? (payload as { model: string }).model.trim()
      : "gemini-3-flash-preview";

  if (!prompt) {
    return new Response("Prompt is required.", { status: 400 });
  }

  const selectedModel = MODEL_MAP.get(model);
  if (!selectedModel) {
    return new Response("Model tidak valid.", { status: 400 });
  }

  if (!selectedModel.supported) {
    return new Response(
      `Model ini tidak didukung untuk playground text. ${selectedModel.reason ?? ""}`.trim(),
      { status: 400 },
    );
  }

  try {
    const config: {
      thinkingConfig?: { thinkingLevel: ThinkingLevel };
      tools?: { googleSearch: Record<string, never> }[];
    } = {};

    if (selectedModel.supportsThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    if (selectedModel.supportsTools) {
      config.tools = [{ googleSearch: {} }];
    }

    const stream = await gemini.models.generateContentStream({
      model,
      contents: prompt,
      config,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (error) {
          console.error("Streaming error", error);
          controller.enqueue(encoder.encode("\n[Stream interrupted]\n"));
        } finally {
          controller.close();
        }
      },
    });

    const contentType = mime.getType("txt") ?? "text/plain";
    return new Response(readableStream, {
      headers: {
        "Content-Type": `${contentType}; charset=utf-8`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Gemini API error", error);
    const { status, message } = parseGeminiError(error);
    const statusCode =
      typeof status === "number" && status >= 400 && status < 600
        ? status
        : 500;
    const friendlyMessage =
      statusCode === 429
        ? "Quota exceeded. Check your Gemini plan and usage limits: https://ai.google.dev/gemini-api/docs/rate-limits"
        : message
          ? `Gemini API error: ${message}`
          : "Gemini API error.";
    return new Response(friendlyMessage, { status: statusCode });
  }
}
