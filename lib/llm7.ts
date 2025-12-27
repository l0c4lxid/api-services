import OpenAI from "openai";

export function getLlm7Client() {
  const apiKey = process.env.LLM7_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LLM7_API_KEY.");
  }
  return new OpenAI({
    baseURL: "https://api.llm7.io/v1",
    apiKey,
  });
}
