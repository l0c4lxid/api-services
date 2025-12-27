"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import type { ApiEndpoint } from "@/app/lib/apiList";
import { fetchWithTiming } from "@/app/lib/fetcher";

type ApiTesterProps = {
  endpoint: ApiEndpoint;
};

type ParsedPayload = {
  headers: Record<string, string>;
  body?: string;
};

type PuterApi = {
  ai?: {
    txt2img?: (
      prompt: string,
      options?: Record<string, unknown>,
    ) => Promise<unknown>;
  };
};

declare global {
  interface Window {
    puter?: PuterApi;
  }
}

function parseJsonField(value: string, fieldName: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, String(value)]),
      );
    }
  } catch {
    // fallthrough
  }

  throw new Error(`Invalid JSON for ${fieldName}`);
}

export default function ApiTester({ endpoint }: ApiTesterProps) {
  const initialHeaders =
    endpoint.defaultHeaders ?? `{\n  "Content-Type": "application/json"\n}`;
  const initialBody = endpoint.defaultBody ?? "";
  const initialModel = endpoint.defaultModel ?? "";

  const [headers, setHeaders] = useState(initialHeaders);
  const [body, setBody] = useState(initialBody);
  const [model, setModel] = useState(initialModel);
  const [status, setStatus] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [costLabel, setCostLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateBodyWithModel = (nextModel: string) => {
    if (!endpoint.modelOptions?.length) return;
    try {
      const parsed = body.trim() ? JSON.parse(body) : {};
      const nextBody = { ...parsed, model: nextModel };
      setBody(JSON.stringify(nextBody, null, 2));
    } catch {
      try {
        const fallback = initialBody ? JSON.parse(initialBody) : {};
        const nextBody = { ...fallback, model: nextModel };
        setBody(JSON.stringify(nextBody, null, 2));
      } catch {
        setBody(JSON.stringify({ prompt: "", model: nextModel }, null, 2));
      }
    }
  };

  const handleSend = async () => {
    setError(null);
    setResponse("");
    setImageResult(null);
    setStatus(null);
    setDuration(null);

    let parsed: ParsedPayload;
    try {
      const parsedHeaders = parseJsonField(headers, "headers");
      let parsedBody =
        endpoint.method === "GET" || !body.trim()
          ? undefined
          : JSON.stringify(JSON.parse(body));

      if (endpoint.modelOptions?.length && model) {
        const bodyValue = body.trim() ? JSON.parse(body) : {};
        parsedBody = JSON.stringify({ ...bodyValue, model });
      }

      parsed = {
        headers: parsedHeaders,
        body: parsedBody,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON body");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchWithTiming(endpoint.path, {
        method: endpoint.method,
        headers: parsed.headers,
        body: parsed.body,
      });

      setStatus(result.status);
      setDuration(result.durationMs);

      let output = result.text;
      let extractedCost: string | null = "Local AI Assistant";
      let parsedJson: unknown = null;
      try {
        parsedJson = JSON.parse(result.text);
        if (typeof parsedJson?.text === "string") {
          output = parsedJson.text;
        } else if (parsedJson && typeof parsedJson === "object") {
          output = JSON.stringify(parsedJson, null, 2);
        } else {
          output = String(parsedJson);
        }
        if (typeof parsedJson?.cost === "string") {
          extractedCost = parsedJson.cost;
        }
      } catch {
        // keep raw text
      }

      setResponse(output);
      setCostLabel(extractedCost);
      if (!result.ok) {
        setError(`API Error: ${result.text || "Unknown error"}`);
      } else if (
        endpoint.id === "image-generate" &&
        parsedJson &&
        typeof parsedJson === "object"
      ) {
        const payload = parsedJson as {
          config?: { prompt?: string; model?: string; quality?: string };
          success?: boolean;
          error?: string;
        };

        if (!payload.success) {
          setError(payload.error || "Image generation failed.");
          return;
        }

        const promptValue =
          typeof payload.config?.prompt === "string"
            ? payload.config.prompt
            : "";
        const modelValue =
          typeof payload.config?.model === "string"
            ? payload.config.model
            : "";
        const qualityValue =
          typeof payload.config?.quality === "string"
            ? payload.config.quality
            : "";

        if (!window.puter?.ai?.txt2img) {
          setError("Puter.js belum siap. Refresh halaman /docs.");
          return;
        }

        try {
          const puterResult = await window.puter.ai.txt2img(promptValue, {
            model: modelValue,
            ...(qualityValue ? { quality: qualityValue } : {}),
          });
          const resolved = resolveImage(puterResult);
          setImageResult(resolved);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Puter image generation failed.",
          );
        }
      }
    } catch (err) {
      setError(
        `API Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHeaders(initialHeaders);
    setBody(initialBody);
    setModel(initialModel);
    setStatus(null);
    setResponse("");
    setImageResult(null);
    setDuration(null);
    setCostLabel(null);
    setError(null);
  };

  const resolveImage = (result: unknown) => {
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object") {
      const anyResult = result as {
        url?: string;
        image?: string;
        html?: string;
        data?: { url?: string }[];
      };
      if (anyResult.url) return anyResult.url;
      if (anyResult.image) return anyResult.image;
      if (anyResult.html) return anyResult.html;
      if (Array.isArray(anyResult.data) && anyResult.data[0]?.url) {
        return anyResult.data[0].url ?? null;
      }
    }
    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Headers (JSON)
          </p>
          <Textarea
            value={headers}
            onChange={(event) => setHeaders(event.target.value)}
            className="h-32 resize-none overflow-hidden font-mono text-xs"
          />
        </div>

        <div className="space-y-4">
          {endpoint.modelOptions?.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Model
              </p>
              <select
                value={model}
                onChange={(event) => {
                  const nextModel = event.target.value;
                  setModel(nextModel);
                  updateBodyWithModel(nextModel);
                  setStatus(null);
                  setResponse("");
                  setDuration(null);
                  setCostLabel(null);
                  setError(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
              >
                {endpoint.modelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Pilih model untuk request ke LXID.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Request Body (JSON)
            </p>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="h-40 resize-none overflow-hidden font-mono text-xs"
              disabled={endpoint.method === "GET"}
            />
            {endpoint.method === "GET" ? (
              <p className="text-xs text-muted-foreground">
                Request body diabaikan untuk method GET.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleSend} disabled={loading}>
          Send Request
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </Button>
        {loading ? (
          <span className="text-sm text-muted-foreground">
            Executing request...
          </span>
        ) : null}
        {duration !== null ? (
          <Badge variant="secondary">{duration} ms</Badge>
        ) : null}
        {status !== null ? (
          <Badge variant="outline">Status: {status}</Badge>
        ) : null}
        {endpoint.modelOptions?.length && model ? (
          <Badge variant="secondary">Model: {model}</Badge>
        ) : null}
        {costLabel ? <Badge variant="secondary">{costLabel}</Badge> : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Response
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {imageResult ? (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background/80 p-4">
            {imageResult.trim().startsWith("<img") ? (
              <div
                dangerouslySetInnerHTML={{ __html: imageResult }}
              />
            ) : imageResult.startsWith("data:") ||
              imageResult.startsWith("http") ? (
              <img
                src={imageResult}
                alt="Generated"
                className="h-auto w-full rounded-lg object-cover"
              />
            ) : (
              <pre className="max-h-[240px] overflow-auto text-xs text-foreground">
                {imageResult}
              </pre>
            )}
          </div>
        ) : null}
        <pre className="max-h-[320px] overflow-auto rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-xs text-foreground">
          {response || "Response akan tampil di sini."}
        </pre>
      </div>
    </div>
  );
}
