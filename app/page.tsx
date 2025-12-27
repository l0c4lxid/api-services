/**
 * Tutorial singkat:
 * 1) Ambil API key di Google AI Studio: https://aistudio.google.com/apikey
 * 2) Buat `.env.local` di root project dan isi:
 *    GEMINI_API_KEY=YOUR_API_KEY_HERE
 * 3) Jalankan project: npm install && npm run dev
 * 4) Test API streaming:
 *    curl -N -H "Content-Type: application/json" -d '{"prompt":"Hello Gemini"}' http://localhost:3000/api/gemini
 */
"use client";

import { useCallback, useRef, useState } from "react";
import PromptForm from "@/components/PromptForm";
import ResponseViewer from "@/components/ResponseViewer";
import { DEFAULT_MODEL, MODEL_DEFINITIONS } from "@/lib/models";

const PRESET_PROMPTS = [
  {
    label: "Explain",
    value: "Explain quantum computing like I am 12 years old.",
  },
  {
    label: "Summarize",
    value: "Summarize this in 5 bullet points: The rise of edge computing.",
  },
  {
    label: "Code",
    value: "Write a TypeScript function to debounce user input by 300ms.",
  },
];

const MODEL_OPTIONS = MODEL_DEFINITIONS.map((model) => ({
  label: model.label,
  value: model.id,
  helper: model.helper,
  disabled: !model.supported,
  reason: model.reason,
}));

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const currentModel = MODEL_DEFINITIONS.find((item) => item.id === model);
  const thinkingEnabled = currentModel?.supportsThinking ?? false;
  const toolsEnabled = currentModel?.supportsTools ?? false;

  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Prompt masih kosong. Coba tulis pertanyaan terlebih dahulu.");
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse("");
    setCopied(false);

    try {
      const result = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmedPrompt, model }),
        signal: controller.signal,
      });

      if (!result.ok) {
        const message = await result.text();
        if (requestIdRef.current === requestId) {
          setError(message || "Request failed. Please try again.");
        }
        return;
      }

      if (!result.body) {
        if (requestIdRef.current === requestId) {
          setError("Response body kosong. Coba ulangi request.");
        }
        return;
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setResponse((prev) => prev + chunk);
        }
      }

      const tail = decoder.decode();
      if (tail) {
        setResponse((prev) => prev + tail);
      }
    } catch (err) {
      if ((err as DOMException).name === "AbortError") {
        return;
      }
      if (requestIdRef.current === requestId) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  }, [prompt]);

  const handlePreset = useCallback((value: string) => {
    setPrompt(value);
  }, []);

  const handleClear = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    requestIdRef.current += 1;
    setPrompt("");
    setResponse("");
    setError(null);
    setCopied(false);
    setLoading(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!response.trim()) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed.");
    }
  }, [response]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/20 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))]" />
        </div>

        <main className="relative z-10 w-full max-w-5xl">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur xl:p-10">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Gemini Playground
                  </span>
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-indigo-200">
                    Streaming
                  </span>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-200">
                    Google Search tool
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Test Gemini with real-time responses
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  Kirim prompt, lihat hasil streaming, dan iterasi cepat seperti di
                  Google AI Studio. Semua request aman lewat route internal.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <PromptForm
                  prompt={prompt}
                  presets={PRESET_PROMPTS}
                  model={model}
                  models={MODEL_OPTIONS}
                  loading={loading}
                  error={error}
                  onPromptChange={setPrompt}
                  onModelChange={setModel}
                  onPreset={handlePreset}
                  onClear={handleClear}
                  onSubmit={handleGenerate}
                />
                <ResponseViewer
                  response={response}
                  loading={loading}
                  error={error}
                  copied={copied}
                  onCopy={handleCopy}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-xs text-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Model: {model}</span>
                  <span>
                    Thinking level: {thinkingEnabled ? "HIGH" : "Off"}
                  </span>
                  <span>Tools: {toolsEnabled ? "Google Search" : "Off"}</span>
                  <span>Route: /api/gemini</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
