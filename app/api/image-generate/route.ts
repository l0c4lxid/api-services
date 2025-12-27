export const runtime = "nodejs";

type ImageGeneratePayload = {
  prompt?: string;
  model?: string;
  quality?: string;
};

const SUPPORTED_MODELS = [
  "gpt-image-1",
  "dall-e-3",
  "gemini-2.5-flash-image-preview",
  "stabilityai/stable-diffusion-3-medium",
  "black-forest-labs/FLUX.1-schnell",
];

const DEFAULT_MODEL = "gpt-image-1";

const QUALITY_BY_MODEL: Record<string, string[]> = {
  "gpt-image-1": ["standard", "hd"],
  "dall-e-3": ["standard", "hd"],
  "gemini-2.5-flash-image-preview": ["default"],
  "stabilityai/stable-diffusion-3-medium": ["standard"],
  "black-forest-labs/FLUX.1-schnell": ["standard"],
};

function normalizeValue(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: ImageGeneratePayload;
  try {
    payload = (await request.json()) as ImageGeneratePayload;
  } catch {
    return Response.json(
      { code: 400, success: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const prompt = normalizeValue(payload.prompt);
  if (!prompt || prompt.length < 5) {
    return Response.json(
      {
        code: 400,
        success: false,
        error: "prompt is required and must be at least 5 characters.",
      },
      { status: 400 },
    );
  }

  const model = normalizeValue(payload.model) || DEFAULT_MODEL;
  if (!SUPPORTED_MODELS.includes(model)) {
    return Response.json(
      { code: 400, success: false, error: "Model is not supported." },
      { status: 400 },
    );
  }

  const quality = normalizeValue(payload.quality);
  const allowedQualities = QUALITY_BY_MODEL[model] ?? [];
  if (quality && !allowedQualities.includes(quality)) {
    return Response.json(
      {
        code: 400,
        success: false,
        error: "Quality is not supported for this model.",
      },
      { status: 400 },
    );
  }

  return Response.json({
    code: 200,
    success: true,
    image: "",
    config: {
      prompt,
      model,
      ...(quality ? { quality } : {}),
    },
    instructions:
      'Use puter.ai.txt2img(prompt, { model, quality }) in the client.',
  });
}
