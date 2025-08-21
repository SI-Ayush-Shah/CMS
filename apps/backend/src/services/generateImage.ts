import { createImageGenerator } from "./ImageGenerator";
import { env } from "../config/env";

// Plug-and-play helper to generate an image Buffer from a text prompt
// Defaults: OpenAI for image generation (configurable via env)
export async function generateImage(prompt: string): Promise<Buffer> {
  const imageGenerator = createImageGenerator();
  return imageGenerator.generateImage(prompt, {
    provider: (env.IMAGE_MODEL_PROVIDER as any) || "openai",
    modelName: env.IMAGE_MODEL_NAME,
  });
}
