"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { ApiEndpoint } from "@/app/lib/apiList";
import { fetchWithTiming } from "@/app/lib/fetcher";

type ApiTesterProps = {
  endpoint: ApiEndpoint;
};

type ParsedPayload = {
  headers: Record<string, string>;
  query: string;
  body?: string;
};

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

function buildQueryString(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("{")) {
    const parsed = parseJsonField(trimmed, "query params");
    return new URLSearchParams(parsed).toString();
  }

  return trimmed.replace(/^\?/, "");
}

export default function ApiTester({ endpoint }: ApiTesterProps) {
  const initialHeaders =
    endpoint.defaultHeaders ?? `{\n  "Content-Type": "application/json"\n}`;
  const initialQuery = endpoint.defaultQuery ?? "";
  const initialBody = endpoint.defaultBody ?? "";

  const [headers, setHeaders] = useState(initialHeaders);
  const [query, setQuery] = useState(initialQuery);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError(null);
    setResponse("");
    setStatus(null);
    setDuration(null);

    let parsed: ParsedPayload;
    try {
      const parsedHeaders = parseJsonField(headers, "headers");
      const queryString = buildQueryString(query);
      const parsedBody =
        endpoint.method === "GET" || !body.trim()
          ? undefined
          : JSON.stringify(JSON.parse(body));

      parsed = {
        headers: parsedHeaders,
        query: queryString,
        body: parsedBody,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON body");
      return;
    }

    const url = parsed.query
      ? `${endpoint.path}?${parsed.query}`
      : endpoint.path;

    setLoading(true);
    try {
      const result = await fetchWithTiming(url, {
        method: endpoint.method,
        headers: parsed.headers,
        body: parsed.body,
      });

      setStatus(result.status);
      setDuration(result.durationMs);

      let output = result.text;
      try {
        const parsedJson = JSON.parse(result.text);
        output = JSON.stringify(parsedJson, null, 2);
      } catch {
        // keep raw text
      }

      setResponse(output);
      if (!result.ok) {
        setError(`API Error: ${result.text || "Unknown error"}`);
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
    setQuery(initialQuery);
    setBody(initialBody);
    setStatus(null);
    setResponse("");
    setDuration(null);
    setError(null);
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
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Query Params
          </p>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="limit=10&sort=desc"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Opsional. Bisa pakai query string atau JSON object, lalu akan
            diubah jadi query string (contoh: limit=10&sort=desc atau
            {"{ \"limit\": 10, \"sort\": \"desc\" }"}).
          </p>
        </div>
      </div>

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
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Response
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <pre className="max-h-[320px] overflow-auto rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-xs text-foreground">
          {response || "Response akan tampil di sini."}
        </pre>
      </div>
    </div>
  );
}
