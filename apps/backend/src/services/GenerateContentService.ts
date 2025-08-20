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
4. The article should be releted to sports, and if user asks for a topic that is not related to sports, you should say that you are not able to generate content for that topic.
5. Make sure to use the images provided by the user, and if its not there then generate your own images.

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
- short summary of the article should be 100 words in the end.
- never show any code in the article, it should be a pure text article.

IMPORTANT: For table blocks, content MUST be a 2D array where each row is an array!
(Banner image URL provided separately: ${bannerUrl ?? "N/A"}; do not duplicate banner as a body image block)
${imagesSection}
CORRECT TABLE: \"content\": [[\"Header1\", \"Header2\"], [\"Row1Col1\", \"Row1Col2\"]]
WRONG TABLE: \"content\": [\"Header1\", \"Header2\", \"Row1Col1\", \"Row1Col2\"]

Return JSON ONLY in Editor.js format, no extra explanation.`,
        },
      ]);

      // persist
      // Normalize tables to ensure 2D arrays and merge consecutive table rows
      const normalizedBody = normalizeEditorJsBody(
        result.body as any
      ) as unknown as Record<string, unknown>;
      const toInsert: NewGeneratedContent = {
        title: result.title,
        summary: result.summary,
        category: result.category,
        tags: result.tags,
        body: normalizedBody,
      };
      const saved = await generatedContentRepository.create(toInsert);

      return {
        blogId: saved.id,
        generatedContent: {
          ...result,
          body: normalizedBody as any,
          bannerUrl,
          images: imagesList,
        },
        originalContent: request.content,
        timestamp: new Date().toISOString(),
      };
    },
  };
}

// Normalize Editor.js body data to ensure tables are single blocks with 2D content
function normalizeEditorJsBody(body: any) {
  if (!body || !Array.isArray(body.blocks)) return body;

  const to2D = (content: any): any[] => {
    if (!Array.isArray(content)) return [];
    if (Array.isArray(content[0])) return content; // already 2D
    return [content]; // wrap single row
  };

  const mergedBlocks: any[] = [];
  let pendingTable: any | null = null;

  for (const block of (body as any).blocks) {
    if (block?.type === "table") {
      const content2D = to2D(block?.data?.content);
      const withHeadings = !!block?.data?.withHeadings;

      if (pendingTable) {
        pendingTable.data = pendingTable.data || {};
        const existing = to2D(pendingTable.data.content);
        pendingTable.data.content = [...existing, ...content2D];
        if (withHeadings) pendingTable.data.withHeadings = true;
      } else {
        pendingTable = {
          ...block,
          data: {
            ...(block.data || {}),
            content: content2D,
          },
        };
        if (withHeadings) pendingTable.data.withHeadings = true;
      }
      continue;
    }

    if (pendingTable) {
      mergedBlocks.push(pendingTable);
      pendingTable = null;
    }
    mergedBlocks.push(block);
  }

  if (pendingTable) mergedBlocks.push(pendingTable);

  return { ...body, blocks: mergedBlocks };
}
