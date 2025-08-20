import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createGoogleGenaiModel } from '../llms/google-genai/model'
import { createCloudinaryService } from './CloudinaryService'
import { env } from '../config/env'
import axios from 'axios'
import { GoogleGenerativeAI, GenerativeModel, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

export interface GenerateSocialMediaContentParams {
  title: string
  content: string
  summary: string
  link?: string
  platform: 'instagram' | 'twitter'
}

export interface SocialMediaContentResult {
  imageUrl?: string
  caption: string
  hashtags: string[]
  prompt?: string
}

export interface SocialMediaContentService {
  generateContent(params: GenerateSocialMediaContentParams): Promise<SocialMediaContentResult>
}

export function createSocialMediaContentService(): SocialMediaContentService {
  const cloudinaryService = createCloudinaryService()

  async function generateImagePrompt(params: GenerateSocialMediaContentParams): Promise<string> {
    const model = createGoogleGenaiModel({
      modelName: 'gemini-1.5-flash',
      temperature: 0.2,
    })

    const prompt = `
      Generate a detailed prompt for creating an image based on this article:
      
      Title: ${params.title}
      Summary: ${params.summary}
      
      Create a prompt that would work well with DALL-E or Stable Diffusion to generate
      an eye-catching, social media friendly image. The prompt should be detailed, descriptive,
      and visually compelling. Focus on the main theme and emotional tone of the article.
      
      Return ONLY the prompt text, with no explanations or additional commentary.
    `

    const result = await model.invoke([
      {
        role: 'human',
        content: prompt
      }
    ])

    // Extract the text content from the result
    return result.content.toString().trim()
  }

  async function generateImage(prompt: string): Promise<Buffer> {
    if (!env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured')
    }

    const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
    
    // Initialize model with harm block thresholds appropriate for image generation
    const generationConfig = {
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
      // Request image bytes in the response
      responseMimeType: 'image/png' as any,
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

    // Initialize model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig,
      safetySettings,
    });

    console.log('Generating image with prompt:', prompt);

    try {
      const result = await model.generateContent([{ text: prompt }]);
      const response = result.response;
      const generatedContent = response.candidates?.[0]?.content;

      if (!generatedContent) {
        throw new Error('No content in generated response');
      }

      // With responseMimeType set to image/png, the SDK returns inlineData with image bytes
      for (const part of generatedContent.parts) {
        const inlineData = (part as any).inlineData
        if (inlineData && typeof inlineData.data === 'string') {
          return Buffer.from(inlineData.data, 'base64')
        }
      }
      
      throw new Error('No image data in the response');
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image: ${error?.message || 'Unknown error'}`);
    }
  }

  async function generateCaptionAndHashtags(
    params: GenerateSocialMediaContentParams,
    prompt?: string
  ): Promise<{ caption: string; hashtags: string[] }> {
    const model = createGoogleGenaiModel({
      modelName: 'gemini-1.5-flash',
      temperature: 0.7,
    })

    const captionPrompt = params.platform === 'twitter'
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
      Image Description: ${prompt ?? ''}

      The caption should be attention-grabbing, conversational, and encourage engagement.
      Include 5-7 relevant hashtags that would help the post reach a wider audience.

      Return ONLY JSON:
      {
        "caption": "Your engaging caption here",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    `

    const result = await model.invoke([
      {
        role: 'human',
        content: captionPrompt
      }
    ])

    const resultText = result.content.toString()
    
    try {
      // Extract JSON from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const jsonResponse = JSON.parse(jsonMatch[0])

      if (params.platform === 'twitter') {
        const tweet: string = jsonResponse.tweet || jsonResponse.caption || ''
        const hashtags: string[] = Array.isArray(jsonResponse.hashtags) ? jsonResponse.hashtags : []
        return { caption: tweet, hashtags }
      }

      return {
        caption: jsonResponse.caption || '',
        hashtags: Array.isArray(jsonResponse.hashtags) ? jsonResponse.hashtags : []
      }
    } catch (err) {
      console.error('Error parsing caption JSON:', err)
      // Fallback with basic parsing
      const caption = params.platform === 'twitter'
        ? (resultText.split('tweet')[1]?.split('"')[2] || '')
        : (resultText.split('caption')[1]?.split('"')[2] || '')
      const hashtagsText = resultText.split('hashtags')[1] || ''
      const hashtags = hashtagsText.match(/"([^"]+)"/g)?.map(tag => tag.replace(/"/g, '')) || []
      
      return { caption, hashtags }
    }
  }

  return {
    async generateContent(params: GenerateSocialMediaContentParams): Promise<SocialMediaContentResult> {
      try {
        if (params.platform === 'instagram') {
          // Generate the image prompt
          const prompt = await generateImagePrompt(params)
          console.log('Generated image prompt:', prompt)

          // Generate the image
          const imageBuffer = await generateImage(prompt)

          // Upload the image to Cloudinary
          const imageUrl = await cloudinaryService.uploadBuffer({
            buffer: imageBuffer,
            folder: 'social-media-content',
            filename: `${params.title.substring(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
            mimeType: 'image/png'
          })

          // Generate caption and hashtags
          const { caption, hashtags } = await generateCaptionAndHashtags(params, prompt)

          return { imageUrl, caption, hashtags, prompt }
        }

        // Twitter/X: only tweet text and hashtags
        const { caption, hashtags } = await generateCaptionAndHashtags(params)
        return { caption, hashtags }
      } catch (err: any) {
        console.error('Error generating social media content:', err)
        throw new Error(`Failed to generate social media content: ${err?.message || 'Unknown error'}`)
      }
    }
  }
}
