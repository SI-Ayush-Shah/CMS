import {
  GenerateContentRequestDto,
  GenerateContentResponseDto,
} from "../types/dtos";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod"; // For LangChain structured output
import { env } from "../config/env";
import { GeneratedContentRepository } from "../repositories/GeneratedContentRepository";
import { type NewGeneratedContent } from "../db/schema";

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

  for (const block of body.blocks) {
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

      const model = new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        model: "gemini-2.5-flash",
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
          role: "user",
          content: `
          Generate a comprehensive, well-structured long-form article for: ${request.content}  

### Requirements:
1. Output ONLY valid **JSON** in **Editor.js format** (no extra text).  
2. The JSON must include:  
   - title (10–255 characters)  
   - description (<1000 characters)  
   - slug (URL-friendly, hyphenated, from title)  
   - tags (comma-separated relevant keywords)  
   - categories (1–3 broad categories)  
   - time (generation timestamp)  
   - version: "2.28.0"  
   - blocks (array with Editor.js block objects)  

3. **Blocks Rules:**  
   - Use at least 4–6 sections with proper **headers**.  
   - Block types allowed: 'paragraph', 'header', 'list', 'table', 'quote', 'code', 'delimiter', 'checklist', 'warning', 'image', 'embed', 'linkTool'.  
   - Every block MUST have a **unique ID** ('"block-1"', '"block-2"', etc.).  
   - Mix block types for **scannability** (not just paragraphs).  
   - Use **delimiter** to divide major sections.  
   - Include at least one **table** with correct 2D array format:  
     Example:  
     "content": [  
       ["Header1", "Header2"],  
       ["Row1Col1", "Row1Col2"]  
     ]  
   - Keep the entire comparison in a SINGLE "table" block. Do NOT split header and rows across multiple table blocks; put the header as the first row and set "withHeadings": true.  
   - End with a clear **Conclusion** section.  

4. **Content Instructions:**  
   - Make it **informative, engaging, and factually accurate**.  
   - Use **headers, paragraphs, and lists** for readability.  
   - Incorporate at least one **quote** to add authority.  
   - Add a practical **code snippet** if relevant to the topic.  
   - Balance perspectives with **pros & cons**.  
   - Include **real-world examples, stats, or trends** where possible.  

### Output Format Example (simplified):
{
  "title": "Sample Title",
  "description": "Short description under 1000 chars",
  "slug": "sample-title",
  "tags": "tag1, tag2, tag3",
  "categories": ["Category1", "Category2"],
  "time": 1692455160,
  "version": "2.28.0",
  "blocks": [
    {
      "id": "block-1",
      "type": "header",
      "data": { "text": "Header Example", "level": 2 }
    },
    {
      "id": "block-2",
      "type": "paragraph",
      "data": { "text": "Your informative content here." }
    },
    {
      "type" : "table",
      "data" : {
          "content" : [ ["Kine", "1 pcs", "100$"], ["Pigs", "3 pcs", "200$"], ["Chickens", "12 pcs", "150$"] ]
      }
    },
  ]
}
{
  here are examples of the blocks as per their types:
    "header": {
      "data": {
        "text": "Header text",
        "level": "A number between 1-6, usually 2 for section headers"
      }
    },
    "paragraph": {
      "data": {
        "text": "Paragraph text with <b>formatting</b> if needed"
      }
    },
    "list": {
      "data": {
        "style": "unordered | ordered",
        "items": ["Item 1", "Item 2", "Item 3"]
      }
    },
    "delimiter": {
      "data": {}
    },
    "code": {
      "data": {
        "code": "console.log('Hello world');",
        "language": "javascript"
      }
    },
    "quote": {
      "data": {
        "text": "Quote text",
        "caption": "Quote caption",
        "alignment": "left | center | right"
      }
    },
    "table": {
      "data": {
        "withHeadings": false,
        "stretched": false,
        "content": [
          ["Header 1", "Header 2", "Header 3"],
          ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
          ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"]
        ]
      }
    }
  }
          `,
        },
      ]);

      // normalize body (merge any consecutive table blocks and enforce 2D arrays)
      const normalizedBody = normalizeEditorJsBody(result.body);
      const normalizedResult = { ...result, body: normalizedBody };

      // persist
      const toInsert: NewGeneratedContent = {
        title: normalizedResult.title,
        summary: normalizedResult.summary,
        category: normalizedResult.category,
        tags: normalizedResult.tags,
        body: normalizedResult.body as unknown as Record<string, unknown>,
      };
      const saved = await generatedContentRepository.create(toInsert);

      return {
        generatedContent: {
          ...normalizedResult,
          bannerUrl,
          images: imagesList,
        },
        originalContent: request.content,
        timestamp: new Date().toISOString(),
      };
    },
  };
}
