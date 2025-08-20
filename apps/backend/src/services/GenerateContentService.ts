import {
  GenerateContentRequestDto,
  GenerateContentResponseDto,
} from "../types/dtos";
import { z } from "zod"; // For LangChain structured output
import { GeneratedContentRepository } from "../repositories/GeneratedContentRepository";
import { type NewGeneratedContent } from "../db/schema";
import { createGoogleGenaiModel } from "../llms/google-genai/model";

// Service interface using DTOs
export interface GenerateContentService {
  generateContent(
    request: GenerateContentRequestDto
  ): Promise<GenerateContentResponseDto>;
}

interface Dependencies {
  generatedContentRepository: GeneratedContentRepository;
}

export function createGenerateContentService({
  generatedContentRepository,
}: Dependencies): GenerateContentService {
  return {
    async generateContent(
      request: GenerateContentRequestDto
    ): Promise<GenerateContentResponseDto> {
      // Comprehensive Editor.js block schema supporting all block types (Zod for LangChain)
      const editorJsBlockSchema = z.object({
        id: z.string(),
        type: z.enum([
          "paragraph",
          "header",
          "list",
          "table",
          "code",
          "quote",
          "delimiter",
          "image",
          "embed",
          "checklist",
          "warning",
          "linkTool",
        ]),
        data: z.any(), // Flexible data object for any block type - Gemini compatible
      });

      const editorJsSchema = z.object({
        time: z.number().optional(),
        blocks: z.array(editorJsBlockSchema),
        version: z.string().optional(),
      });

      const articleSchema = z.object({
        title: z.string(),
        summary: z.string(),
        category: z.string(),
        tags: z.array(z.string()),
        body: editorJsSchema, // Always Editor.js format
      });

      const model = createGoogleGenaiModel({
        modelName: "gemini-2.5-flash",
        temperature: 0.7,
      });

      const structuredModel = model.withStructuredOutput(articleSchema);

      const imagesList = Array.isArray((request as any).images)
        ? ((request as any).images as string[])
        : [];
      const bannerUrl = (request as any).bannerUrl as string | undefined;
      const imagesSection = imagesList.length
        ? `\n\nImages (use where contextually appropriate as Editor.js image blocks with captions):\n${imagesList.map((u, i) => `- [img${i + 1}] ${u}`).join("\n")}`
        : "";

      const result = await structuredModel.invoke([
        {
          role: "human",
          content: `Generate a comprehensive, well-structured long-form article for: ${request.content}

CRITICAL: All table blocks must have content as a 2D array (array of arrays)!
Example: [ [\"Header1\", \"Header2\"], [\"Row1Col1\", \"Row1Col2\"] ]

### Instructions:
1. Article length: ~100-200 lines.
2. Cover the topic from multiple angles:
   - Introduction
   - Background/History
   - Key Concepts/Features
   - Current Trends
   - Comparisons or Alternatives
   - Case Studies / Real Examples
   - Statistics or Data Tables
   - Expert Opinions or Quotes
   - Practical Applications / How-to steps
   - Pros & Cons
   - FAQs
   - Future Outlook
   - Conclusion
3. Use **Editor.js block format**. Available blocks:
   - paragraph
   - header
   - list
   - table
   - code
   - quote
   - delimiter
   - checklist
   - warning
   - image
   - embed
   - linkTool

### Adaptation rules:
- Tutorials/Guides → headers + paragraphs + ordered lists + code blocks
- Comparisons → tables + headers + paragraphs
- Technical docs → code + headers + warning blocks
- News → headers + paragraphs + quotes
- Reviews → headers + paragraphs + checklists + images
- Opinion pieces → headers + quotes + paragraphs

### Requirements:
- Each block must have a unique descriptive id (e.g., \"intro_header\", \"history_para1\", \"pros_table\").
- Use delimiter to separate major sections.
- Headers must clearly mark new sections.
- Mix block types (not just paragraphs).
- Make content scannable (lists, tables, quotes).
- End with a \"Conclusion\" section.

IMPORTANT: For table blocks, content MUST be a 2D array where each row is an array!
(Banner image URL provided separately: ${bannerUrl ?? "N/A"}; do not duplicate banner as a body image block)
${imagesSection}
CORRECT TABLE: \"content\": [[\"Header1\", \"Header2\"], [\"Row1Col1\", \"Row1Col2\"]]
WRONG TABLE: \"content\": [\"Header1\", \"Header2\", \"Row1Col1\", \"Row1Col2\"]

Return JSON ONLY in Editor.js format, no extra explanation.`,
        },
      ]);

      // persist
      const toInsert: NewGeneratedContent = {
        title: result.title,
        summary: result.summary,
        category: result.category,
        tags: result.tags,
        body: result.body as unknown as Record<string, unknown>,
      };
      const saved = await generatedContentRepository.create(toInsert);

      return {
        generatedContent: {
          ...result,
          bannerUrl,
          images: imagesList,
        },
        originalContent: request.content,
        timestamp: new Date().toISOString(),
      };
    },
  };
}
