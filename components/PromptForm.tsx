type Preset = {
  label: string;
  value: string;
};

type PromptFormProps = {
  prompt: string;
  presets: Preset[];
  loading: boolean;
  error?: string | null;
  onPromptChange: (value: string) => void;
  onPreset: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
};

export default function PromptForm({
  prompt,
  presets,
  loading,
  error,
  onPromptChange,
  onPreset,
  onClear,
  onSubmit,
}: PromptFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <label htmlFor="prompt" className="font-semibold text-slate-100">
            Prompt
          </label>
          <span className="text-xs text-slate-400">{prompt.length} chars</span>
        </div>
        <textarea
          id="prompt"
          name="prompt"
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/40 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
          placeholder="Ask Gemini anything..."
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
        />
        {error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : (
          <p className="text-xs text-slate-400">
            Tips: Use clear instructions or add constraints for better results.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPreset(preset.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-indigo-400/50 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" />
          Streaming ready
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Regenerate" : "Generate"}
            {loading ? (
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            ) : null}
          </button>
        </div>
      </div>
    </form>
  );
}
