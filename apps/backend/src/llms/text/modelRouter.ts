import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../../config/env";

export type TextModelProvider = "gemini" | "openai";

export interface TextModelOptions {
  provider?: TextModelProvider;
  modelName?: string;
  temperature?: number;
}

export type TextChatModel = ChatGoogleGenerativeAI | ChatOpenAI;

export function createTextModel(options: TextModelOptions): TextChatModel {
  const provider: TextModelProvider = (
    options.provider ||
    (env.TEXT_MODEL_PROVIDER as TextModelProvider) ||
    "gemini"
  ).toLowerCase() as TextModelProvider;
  const temperature = options.temperature ?? 0.7;

  if (provider === "openai") {
    const modelName = options.modelName || "gpt-4o-mini";
    return new ChatOpenAI({
      apiKey: env.OPENAI_API_KEY,
      model: modelName,
      temperature,
    });
  }

  // Default to Gemini
  const modelName = options.modelName || "gemini-1.5-flash";
  return new ChatGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
    model: modelName,
    temperature,
  });
}
