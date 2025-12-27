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
  "model": "gpt-4o-mini"
}`,
    modelOptions: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    defaultModel: "gpt-4o-mini",
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
  "imageUrl": "https://example.com/image.jpg"
}`,
    modelOptions: ["gpt-4o-mini", "gpt-4o"],
    defaultModel: "gpt-4o-mini",
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
