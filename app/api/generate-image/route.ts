import { llm7 } from "@/lib/llm7";

export const runtime = "nodejs";

type GenerateImagePayload = {
  prompt?: string;
  size?: string;
  n?: number;
  seed?: number;
  model?: string | number;
};

const DEFAULT_MODEL = (process.env.LLM7_IMAGE_MODEL || "flux").trim() || "flux";
const DEFAULT_SIZE = "1024x1024";
const MAX_IMAGES = 4;
const MODEL_CACHE_MS = 5 * 60 * 1000;

let cachedModel: string | null = null;
let cachedAt = 0;

function isValidSize(value: string) {
  return /^\d+x\d+$/.test(value);
}

type Llm7Model = {
  id?: string;
  default?: boolean;
  is_default?: boolean;
  isDefault?: boolean;
  type?: string;
  category?: string;
  tags?: string[];
  capabilities?: Record<string, unknown>;
  modalities?: Record<string, unknown>;
};

function isDefaultModel(model: Llm7Model) {
  return model.default || model.is_default || model.isDefault || false;
}

function hasImageCapability(model: Llm7Model) {
  const id = typeof model.id === "string" ? model.id.toLowerCase() : "";
  if (/(image|img|vision|flux|turbo|sd|diffusion)/.test(id)) {
    return true;
  }
  const type = typeof model.type === "string" ? model.type.toLowerCase() : "";
  const category =
    typeof model.category === "string" ? model.category.toLowerCase() : "";
  if (/(image|vision)/.test(type) || /(image|vision)/.test(category)) {
    return true;
  }
  const tags = Array.isArray(model.tags) ? model.tags : [];
  if (tags.some((tag) => /image|vision/.test(String(tag).toLowerCase()))) {
    return true;
  }
  const modalities = model.modalities ?? {};
  const output =
    (modalities as { output?: unknown }).output ??
    (modalities as { outputs?: unknown }).outputs;
  const input =
    (modalities as { input?: unknown }).input ??
    (modalities as { inputs?: unknown }).inputs;
  if (
    Array.isArray(output) &&
    output.some((item) => `${item}`.toLowerCase().includes("image"))
  ) {
    return true;
  }
  if (
    Array.isArray(input) &&
    input.some((item) => `${item}`.toLowerCase().includes("image"))
  ) {
    return true;
  }
  const capabilities = model.capabilities ?? {};
  if (
    typeof (capabilities as { image?: boolean }).image === "boolean" ||
    typeof (capabilities as { image_generation?: boolean }).image_generation ===
      "boolean"
  ) {
    return true;
  }
  return false;
}

function pickDefaultModel(models: Llm7Model[]) {
  const imageModels = models.filter(hasImageCapability);
  if (!imageModels.length) {
    return DEFAULT_MODEL;
  }
  const imageDefault = imageModels.find(isDefaultModel);
  const anyDefault = models.find(isDefaultModel);
  return (
    imageDefault?.id ??
    imageModels[0]?.id ??
    anyDefault?.id ??
    models[0]?.id ??
    DEFAULT_MODEL
  );
}

async function getDefaultModel(forceRefresh = false) {
  if (!forceRefresh && cachedModel && Date.now() - cachedAt < MODEL_CACHE_MS) {
    return cachedModel;
  }

  try {
    const response = await fetch("https://api.llm7.io/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.LLM7_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`LXID models request failed (${response.status}).`);
    }
    const data = await response.json();
    const models: Llm7Model[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    const picked = pickDefaultModel(models);
    cachedModel = picked ?? DEFAULT_MODEL;
    cachedAt = Date.now();
    return cachedModel;
  } catch (error) {
    console.error("Failed to fetch LXID models", error);
    return DEFAULT_MODEL;
  }
}

function parseLlm7Error(error: unknown) {
  const fallback = "LXID image generation failed.";
  if (!error || typeof error !== "object") {
    return { message: fallback, status: 500 };
  }

  const anyError = error as {
    status?: number;
    error?: { message?: string };
    message?: string;
  };
  const status =
    typeof anyError.status === "number" ? anyError.status : 500;
  const rawMessage = anyError.error?.message || anyError.message;
  const message =
    rawMessage && /no body/i.test(rawMessage) && status === 400
      ? "LXID rejected the request (400). Check model, size, n, seed, or plan."
      : rawMessage ||
        (status === 400
          ? "LXID rejected the request (400). Check model, size, n, or seed."
          : fallback);

  return { message, status };
}

export async function POST(request: Request) {
  if (!process.env.LLM7_API_KEY) {
    return Response.json(
      { error: "Missing LLM7_API_KEY. Check .env.local." },
      { status: 500 },
    );
  }

  let payload: GenerateImagePayload;
  try {
    payload = (await request.json()) as GenerateImagePayload;
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const prompt =
    typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return Response.json({ error: "prompt is required." }, { status: 400 });
  }

  const size =
    typeof payload.size === "string" && payload.size.trim()
      ? payload.size.trim()
      : DEFAULT_SIZE;
  if (!isValidSize(size)) {
    return Response.json(
      { error: "size must be in WIDTHxHEIGHT format (e.g., 1024x1024)." },
      { status: 400 },
    );
  }

  const n =
    typeof payload.n === "number" && Number.isFinite(payload.n)
      ? Math.max(1, Math.min(MAX_IMAGES, Math.floor(payload.n)))
      : 1;

  const seed =
    typeof payload.seed === "number" && Number.isFinite(payload.seed)
      ? Math.floor(payload.seed)
      : undefined;
  const requestedModel =
    typeof payload.model === "string"
      ? payload.model.trim()
      : typeof payload.model === "number" && Number.isFinite(payload.model)
        ? String(payload.model)
        : "";
  const model = requestedModel || (await getDefaultModel());

  try {
    const payload = {
      model,
      prompt,
      size,
      n,
      ...(seed !== undefined ? { seed } : {}),
      nologo: true,
    };

    let imageResponse: { data?: { url?: string }[] };

    try {
      imageResponse = await llm7.images.generate(
        payload as Parameters<typeof llm7.images.generate>[0],
      );
    } catch (error) {
      const { status } = parseLlm7Error(error);
      if (status !== 400) {
        throw error;
      }
      const fallback = await fetch(
        "https://api.llm7.io/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LLM7_API_KEY}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const fallbackText = await fallback.text();
      if (!fallback.ok) {
        if (
          fallback.status === 400 &&
          /invalid model/i.test(fallbackText || "")
        ) {
          cachedModel = null;
          cachedAt = 0;
          const retryModel = await getDefaultModel(true);
          const retryResponse = await fetch(
            "https://api.llm7.io/v1/images/generations",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.LLM7_API_KEY}`,
              },
              body: JSON.stringify({ ...payload, model: retryModel }),
            },
          );
          const retryText = await retryResponse.text();
          if (!retryResponse.ok) {
            return Response.json(
              { error: retryText || "LXID image generation failed." },
              { status: retryResponse.status },
            );
          }
          imageResponse = JSON.parse(retryText);
        } else {
          return Response.json(
            { error: fallbackText || "LXID image generation failed." },
            { status: fallback.status },
          );
        }
      } else {
        imageResponse = JSON.parse(fallbackText);
      }
    }

    const urls =
      imageResponse.data?.map((item) => item.url).filter(Boolean) ?? [];

    if (!urls.length) {
      return Response.json(
        { error: "No image URLs returned by LXID." },
        { status: 502 },
      );
    }

    return Response.json({ images: urls, model, size, n, seed });
  } catch (error) {
    console.error("LXID image generation error", error);
    const { message, status } = parseLlm7Error(error);
    return Response.json({ error: message }, { status });
  }
}
