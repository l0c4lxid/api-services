export type ModelDefinition = {
  id: string;
  label: string;
  helper?: string;
  supported: boolean;
  supportsThinking: boolean;
  supportsTools: boolean;
  reason?: string;
};

export const MODEL_DEFINITIONS: ModelDefinition[] = [
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    helper: "balanced",
    supported: true,
    supportsThinking: false,
    supportsTools: true,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    helper: "cheapest",
    supported: true,
    supportsThinking: false,
    supportsTools: true,
  },
  {
    id: "gemini-2.5-flash-tts",
    label: "Gemini 2.5 Flash TTS",
    helper: "text-to-speech",
    supported: false,
    supportsThinking: false,
    supportsTools: false,
    reason: "TTS only (not text-out).",
  },
  {
    id: "gemini-3-flash",
    label: "Gemini 3 Flash",
    helper: "fast + low latency",
    supported: true,
    supportsThinking: false,
    supportsTools: true,
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash Preview",
    helper: "preview + thinking",
    supported: true,
    supportsThinking: true,
    supportsTools: true,
  },
  {
    id: "gemini-robotics-er-1.5-preview",
    label: "Gemini Robotics ER 1.5 Preview",
    helper: "specialized",
    supported: false,
    supportsThinking: false,
    supportsTools: false,
    reason: "Robotics-only model.",
  },
  {
    id: "gemma-3-12b",
    label: "Gemma 3 12B",
    helper: "open model",
    supported: true,
    supportsThinking: false,
    supportsTools: false,
  },
  {
    id: "gemma-3-1b",
    label: "Gemma 3 1B",
    helper: "open model",
    supported: true,
    supportsThinking: false,
    supportsTools: false,
  },
  {
    id: "gemma-3-27b",
    label: "Gemma 3 27B",
    helper: "open model",
    supported: true,
    supportsThinking: false,
    supportsTools: false,
  },
  {
    id: "gemma-3-2b",
    label: "Gemma 3 2B",
    helper: "open model",
    supported: true,
    supportsThinking: false,
    supportsTools: false,
  },
  {
    id: "gemma-3-4b",
    label: "Gemma 3 4B",
    helper: "open model",
    supported: true,
    supportsThinking: false,
    supportsTools: false,
  },
  {
    id: "gemini-2.5-flash-native-audio-dialog",
    label: "Gemini 2.5 Flash Native Audio Dialog",
    helper: "live audio",
    supported: false,
    supportsThinking: false,
    supportsTools: false,
    reason: "Live API only.",
  },
];

export const DEFAULT_MODEL = "gemini-3-flash-preview";
