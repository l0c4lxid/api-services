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
  defaultQuery?: string;
  defaultBody?: string;
};

export const apiList: ApiEndpoint[] = [
  {
    id: "llm7-ask",
    name: "Ask LLM7",
    method: "POST",
    path: "/api/ask",
    category: "LLM7",
    description: "Kirim prompt ke LLM7.io dan terima response text.",
    status: "ready",
    testable: true,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultQuery: "",
    defaultBody: `{
  "prompt": "Hello LLM7",
  "model": "gpt-4o-mini"
}`,
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
    defaultQuery: "verbose=true",
  },
  {
    id: "usage-metrics",
    name: "Usage Metrics",
    method: "GET",
    path: "/api/metrics",
    category: "Analytics",
    description: "Ringkasan metrik penggunaan API.",
    status: "beta",
    testable: false,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultQuery: "range=7d",
  },
  {
    id: "api-keys",
    name: "API Keys",
    method: "POST",
    path: "/api/keys",
    category: "Security",
    description: "Buat atau rotasi API key internal.",
    status: "beta",
    testable: false,
    defaultHeaders: `{
  "Content-Type": "application/json"
}`,
    defaultBody: `{
  "name": "dev-key",
  "scope": "read:llm7"
}`,
  },
];
