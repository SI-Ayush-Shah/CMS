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
        data: z.any(),
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
        body: editorJsSchema,
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
          content: `
          
          You are a professional sports journalist and content creator.  
Your task is to generate a comprehensive, well-structured long-form article for: ${request.content}  

CRITICAL: The article **must strictly relate to sports** (games, players, events, rules, training, comparisons, analysis, news, or history).  
❌ If the topic is not related to sports, respond only with:  
{ "blocks": [ { "id": "error_msg", "type": "paragraph", "data": { "text": "Sorry, I can only generate content related to sports." } } ] }  

---

### Article Requirements:
1. Length: ~100–200 lines (mix of short + long blocks).  
2. Format: **Editor.js JSON** with valid blocks.  
   - Allowed blocks: 'paragraph', 'header', 'list', 'table', 'quote', 'image', 'embed'.  
   - ❌ No 'delimiter' blocks.  
3. Every block must have a **unique descriptive id** (e.g., '"intro_header"', '"history_para1"', '"pros_table"').  
4. Use multiple block types for scannability (paragraphs, lists, tables, quotes).  
5. End with a **summary paragraph (~100 words)** under block id '"summary_para"'.  

---

### Special Formatting Rules:
- **Table blocks**:  
  - Content must be a **2D array (array of arrays)**.  
  - First row = headers. Example:  
    '[ ["Player", "Matches", "Goals"], ["Messi", "1000", "800"], ["Ronaldo", "1200", "850"] ]'
- **Headers**: must clearly indicate sections (e.g., '"History"', '"Key Players"', '"Tactics"', '"Future Outlook"').  
- **Images**:  
  - If user provides, use only those.  
  - If not, generate appropriate sports-related placeholder images.  
- **Quotes**: should come from famous athletes, coaches, or sports analysts.  

---

### Adaptation Guidelines:
- Tutorials/Guides → headers + paragraphs + ordered lists  
- Comparisons → tables + headers + paragraphs  
- News → headers + paragraphs + quotes  
- Reviews → headers + checklists + images  
- Opinion pieces → headers + quotes + paragraphs  

---

### Output Rules:
- Return **valid JSON ONLY** in Editor.js format (no explanations, no markdown).  
- Ensure all blocks strictly follow the required schema.  
- Verify before output:  
  - Is the content sports-related?  
  - Are all block IDs unique and descriptive?  
  - Are all tables valid 2D arrays?  

  
          `,
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
    // Strip delimiter blocks
    if (block?.type === "delimiter") {
      continue;
    }
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
