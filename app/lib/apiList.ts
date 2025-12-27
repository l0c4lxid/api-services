export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiEndpoint = {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  category: string;
  description: string;
  status: "ready" | "beta";
  testable: boolean;
  defaultHeaders?: string;
  defaultBody?: string;
  modelOptions?: string[];
  defaultModel?: string;
};

const LXID_MODELS = [
  "gpt-4.1-nano-2025-04-14",
  "gpt-5-mini",
  "deepseek-v3.1",
  "mistral-small-3.1-24b-instruct-2503",
  "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  "codestral-2405",
  "codestral-2501",
  "ministral-8b-2512",
  "gemini-2.5-flash-lite",
  "gemini-search",
  "bidara",
  "glm-4.5-flash",
  "roblox-rp",
];

const DEFAULT_LXID_MODEL = "gemini-2.5-flash-lite";

export const apiList: ApiEndpoint[] = [
  {
    id: "llm7-ask",
    name: "Ask LXID",
    method: "POST",
    path: "/api/ask",
    category: "LXID",
    description: "Kirim prompt ke LXID dan terima response text.",
    status: "ready",
    testable: true,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultBody: `{
  "prompt": "Hello LXID",
  "model": "${DEFAULT_LXID_MODEL}"
}`,
    modelOptions: LXID_MODELS,
    defaultModel: DEFAULT_LXID_MODEL,
  },
  {
    id: "health-check",
    name: "Service Health",
    method: "GET",
    path: "/api/health",
    category: "System",
    description: "Cek status layanan internal.",
    status: "ready",
    testable: true,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultBody: "",
  },
  {
    id: "image-recognition",
    name: "Image Recognition",
    method: "POST",
    path: "/api/image-recognition",
    category: "Vision",
    description: "Kirim prompt + image URL untuk analisis visual.",
    status: "ready",
    testable: true,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultBody: `{
  "prompt": "Describe the image briefly.",
  "imageUrl": "https://example.com/image.jpg",
  "model": "${DEFAULT_LXID_MODEL}"
}`,
    modelOptions: LXID_MODELS,
    defaultModel: DEFAULT_LXID_MODEL,
  },
  {
    id: "generate-image",
    name: "Image Generation",
    method: "POST",
    path: "/api/generate-image",
    category: "Vision",
    description: "Generate image dari prompt menggunakan LXID.",
    status: "ready",
    testable: true,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultBody: `{
  "prompt": "A minimal dashboard UI on a dark background",
  "size": "1024x1024",
  "n": 1,
  "seed": 123
}`,
  },
];
