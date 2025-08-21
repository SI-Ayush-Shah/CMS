import OpenAI from "openai";
import axios from "axios";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { env } from "../config/env";

export type ImageModelProvider = "deepai" | "openai" | "gemini";

export interface ImageGeneratorOptions {
  provider?: ImageModelProvider;
  modelName?: string;
  size?: "512x512" | "1024x1024" | "256x256";
}

export interface ImageGenerator {
  generateImage(
    prompt: string,
    options?: ImageGeneratorOptions
  ): Promise<Buffer>;
}

export function createImageGenerator(): ImageGenerator {
  async function generateImage(
    prompt: string,
    options?: ImageGeneratorOptions
  ): Promise<Buffer> {
    const provider: ImageModelProvider = (
      options?.provider ||
      (env.IMAGE_MODEL_PROVIDER as ImageModelProvider) ||
      "deepai"
    ).toLowerCase() as ImageModelProvider;

    if (provider === "deepai") {
      if (!env.DEEPAI_API_KEY) {
        throw new Error("DeepAI API key not configured");
      }

      // Default endpoint: text2img. Other endpoints can be supplied via IMAGE_MODEL_NAME
      const endpoint = options?.modelName || env.IMAGE_MODEL_NAME || "text2img";
      const url = `https://api.deepai.org/api/${endpoint}`;

      const form = new URLSearchParams();
      form.append("text", prompt);

      const response = await axios.post(url, form, {
        headers: {
          "Api-Key": env.DEEPAI_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // DeepAI returns a URL to the generated image. We fetch and return as Buffer to preserve existing interface.
      const imageUrl: string | undefined =
        response.data?.output_url ||
        response.data?.output?.url ||
        response.data?.output;
      if (!imageUrl) {
        throw new Error("No image URL in DeepAI response");
      }
      const imgRes = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: "arraybuffer",
      });
      return Buffer.from(imgRes.data);
    }

    if (provider === "openai") {
      const modelName =
        options?.modelName || env.IMAGE_MODEL_NAME || "gpt-image-1";
      const size = options?.size || "1024x1024";

      if (!env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const result = await client.images.generate({
        model: modelName,
        prompt,
        size,
      });

      const b64 = (result as any).data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("No image data in OpenAI response");
      }
      return Buffer.from(b64, "base64");
    }

    // Default to Gemini
    if (!env.GOOGLE_API_KEY) {
      throw new Error("Google API key not configured");
    }

    const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

    const generationConfig = {
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: "image/png" as any,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const model = genAI.getGenerativeModel({
      model:
        options?.modelName ||
        env.IMAGE_MODEL_NAME ||
        "gemini-2.0-flash-preview-image-generation",
      generationConfig,
      safetySettings,
    });

    const result = await model.generateContent([{ text: prompt }]);
    const response = result.response;
    const generatedContent = response.candidates?.[0]?.content;
    if (!generatedContent) {
      throw new Error("No content in generated response");
    }

    for (const part of generatedContent.parts) {
      const inlineData = (part as any).inlineData;
      if (inlineData && typeof inlineData.data === "string") {
        return Buffer.from(inlineData.data, "base64");
      }
    }

    throw new Error("No image data in the response");
  }

  return { generateImage };
}
