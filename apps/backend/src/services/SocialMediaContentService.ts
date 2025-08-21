import { createCloudinaryService } from "./CloudinaryService";
import { env } from "../config/env";
import { createImageGenerator } from "./ImageGenerator";
import { createTextModel } from "../llms/text/modelRouter";

export interface GenerateSocialMediaContentParams {
  title: string;
  content: string;
  summary: string;
  link?: string;
  platform: "instagram" | "twitter";
}

export interface SocialMediaContentResult {
  imageUrl?: string;
  caption: string;
  hashtags: string[];
  prompt?: string;
}

export interface SocialMediaContentService {
  generateContent(
    params: GenerateSocialMediaContentParams
  ): Promise<SocialMediaContentResult>;
}

export function createSocialMediaContentService(): SocialMediaContentService {
  const cloudinaryService = createCloudinaryService();
  const imageGenerator = createImageGenerator();

  async function generateImagePrompt(
    params: GenerateSocialMediaContentParams
  ): Promise<string> {
    const model = createTextModel({
      provider: (env.TEXT_MODEL_PROVIDER as any) || "gemini",
      modelName: env.TEXT_MODEL_NAME || "gemini-1.5-flash",
      temperature: 0.2,
    });

    const prompt = `
      Generate a detailed prompt for creating an image based on this article:
      
      Title: ${params.title}
      Summary: ${params.summary}
      
      Create a prompt that would work well with DALL-E or Stable Diffusion to generate
      an eye-catching, social media friendly image. The prompt should be detailed, descriptive,
      and visually compelling. Focus on the main theme and emotional tone of the article.
      
      Return ONLY the prompt text, with no explanations or additional commentary.
    `;

    const result = await model.invoke([
      {
        role: "human",
        content: prompt,
      },
    ]);
    return (
      typeof result.content === "string"
        ? result.content
        : result.content.toString()
    ).trim();
  }

  async function generateImage(prompt: string): Promise<Buffer> {
    return await imageGenerator.generateImage(prompt, {
      provider: (env.IMAGE_MODEL_PROVIDER as any) || "openai",
      modelName: env.IMAGE_MODEL_NAME,
    });
  }

  async function generateCaptionAndHashtags(
    params: GenerateSocialMediaContentParams,
    prompt?: string
  ): Promise<{ caption: string; hashtags: string[] }> {
    const model = createTextModel({
      provider: (env.TEXT_MODEL_PROVIDER as any) || "gemini",
      modelName: env.TEXT_MODEL_NAME || "gemini-1.5-flash",
      temperature: 0.7,
    });

    const captionPrompt =
      params.platform === "twitter"
        ? `
      You are generating content for Twitter (X).
      Write a concise tweet and a separate list of hashtags for this article.
      Constraints:
      - Tweet max 260 characters (exclude hashtags)
      - No hashtags inside the tweet body
      - 3-6 relevant hashtags, lowercase or PascalCase, without spaces
      - Do not include links in the tweet

      Article Title: ${params.title}
      Article Summary: ${params.summary}

      Return ONLY JSON:
      {
        "tweet": "tweet text (<=260 chars)",
        "hashtags": ["#tag1", "#tag2"]
      }
    `
        : `
      Generate an engaging Instagram caption and hashtags for this article and image:

      Article Title: ${params.title}
      Article Summary: ${params.summary}
      Image Description: ${prompt ?? ""}

      The caption should be attention-grabbing, conversational, and encourage engagement.
      Include 5-7 relevant hashtags that would help the post reach a wider audience.

      Return ONLY JSON:
      {
        "caption": "Your engaging caption here",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    `;

    const result = await model.invoke([
      {
        role: "human",
        content: captionPrompt,
      },
    ]);

    const resultText =
      typeof result.content === "string"
        ? result.content
        : result.content.toString();

    try {
      // Extract JSON from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const jsonResponse = JSON.parse(jsonMatch[0]);

      if (params.platform === "twitter") {
        const tweet: string = jsonResponse.tweet || jsonResponse.caption || "";
        const hashtags: string[] = Array.isArray(jsonResponse.hashtags)
          ? jsonResponse.hashtags
          : [];
        return { caption: tweet, hashtags };
      }

      return {
        caption: jsonResponse.caption || "",
        hashtags: Array.isArray(jsonResponse.hashtags)
          ? jsonResponse.hashtags
          : [],
      };
    } catch (err) {
      console.error("Error parsing caption JSON:", err);
      // Fallback with basic parsing
      const caption =
        params.platform === "twitter"
          ? resultText.split("tweet")[1]?.split('"')[2] || ""
          : resultText.split("caption")[1]?.split('"')[2] || "";
      const hashtagsText = resultText.split("hashtags")[1] || "";
      const hashtags =
        hashtagsText
          .match(/"([^"]+)"/g)
          ?.map((tag: string) => tag.replace(/\"/g, "")) || [];

      return { caption, hashtags };
    }
  }

  return {
    async generateContent(
      params: GenerateSocialMediaContentParams
    ): Promise<SocialMediaContentResult> {
      try {
        if (params.platform === "instagram") {
          // Generate the image prompt
          const prompt = await generateImagePrompt(params);
          console.log("Generated image prompt:", prompt);

          // Generate the image
          const imageBuffer = await generateImage(prompt);

          // Upload the image to Cloudinary
          const imageUrl = await cloudinaryService.uploadBuffer({
            buffer: imageBuffer,
            folder: "social-media-content",
            filename: `${params.title
              .substring(0, 50)
              .replace(/[^a-z0-9]/gi, "-")
              .toLowerCase()}`,
            mimeType: "image/png",
          });

          // Generate caption and hashtags
          const { caption, hashtags } = await generateCaptionAndHashtags(
            params,
            prompt
          );

          return { imageUrl, caption, hashtags, prompt };
        }

        // Twitter/X: only tweet text and hashtags
        const { caption, hashtags } = await generateCaptionAndHashtags(params);
        return { caption, hashtags };
      } catch (err: any) {
        console.error("Error generating social media content:", err);
        throw new Error(
          `Failed to generate social media content: ${err?.message || "Unknown error"}`
        );
      }
    },
  };
}
