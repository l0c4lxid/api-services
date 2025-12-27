type ResponseViewerProps = {
  response: string;
  loading: boolean;
  error?: string | null;
  copied: boolean;
  onCopy: () => void;
};

export default function ResponseViewer({
  response,
  loading,
  error,
  copied,
  onCopy,
}: ResponseViewerProps) {
  const hasResponse = response.trim().length > 0;
  const statusLabel = error
    ? "Error"
    : loading
      ? "Streaming"
      : hasResponse
        ? "Ready"
        : "Idle";
  const statusTone = error
    ? "bg-rose-500/20 text-rose-200"
    : loading
      ? "bg-cyan-500/20 text-cyan-200"
      : hasResponse
        ? "bg-emerald-500/20 text-emerald-200"
        : "bg-white/10 text-slate-200";

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-inner shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Output</h2>
          <p className="text-sm text-slate-400">
            Model response appears here in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone}`}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={onCopy}
            disabled={!hasResponse}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-[240px] rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-7 text-slate-100">
        {error ? (
          <p className="text-rose-300">{error}</p>
        ) : hasResponse ? (
          <p className="whitespace-pre-wrap font-mono">
            {response}
            {loading ? (
              <span className="animate-pulse text-cyan-300">|</span>
            ) : null}
          </p>
        ) : (
          <p className="text-slate-400">
            Response will stream here after you click Generate.
          </p>
        )}
      </div>
    </section>
  );
}
