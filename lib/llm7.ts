import OpenAI from "openai";

export const llm7 = new OpenAI({
  baseURL: "https://api.llm7.io/v1",
  apiKey: process.env.LLM7_API_KEY!,
});
