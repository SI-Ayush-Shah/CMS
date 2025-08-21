import {
  GenerateContentRequestDto,
  GenerateContentResponseDto,
} from "../types/dtos";
import { z } from "zod";
import { GeneratedContentRepository } from "../repositories/GeneratedContentRepository";
import { type NewGeneratedContent } from "../db/schema";
import { createGoogleGenaiModel } from "../llms/google-genai/model";

export interface SummarizeContentService {
  summarize(
    request: GenerateContentRequestDto
  ): Promise<GenerateContentResponseDto>;
}

interface Dependencies {
  generatedContentRepository: GeneratedContentRepository;
}

export function createSummarizeContentService({
  generatedContentRepository,
}: Dependencies): SummarizeContentService {
  return {
    async summarize(
      request: GenerateContentRequestDto
    ): Promise<GenerateContentResponseDto> {
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
        temperature: 0.65,
      });

      const structuredModel = model.withStructuredOutput(articleSchema);

      // Support content as string or object (feed item payload)
      const payload: any = request as any;
      const input = payload?.content;
      const isObjectInput =
        input && typeof input === "object" && !Array.isArray(input);

      // Prefer explicit bannerUrl on payload; fallback to feed item's image field when summarizing feeds
      const bannerUrl = (payload?.bannerUrl as string | undefined)
        ?? (isObjectInput ? (input?.image_url || input?.imageUrl) : undefined);
      const bannerDirective = bannerUrl
        ? `(Banner image URL provided separately: ${bannerUrl}; do not include as a body image block)`
        : "(No banner image URL provided)";

      const feedContext = isObjectInput
        ? [
            `TITLE: ${input.title ?? ""}`,
            `SUMMARY: ${input.summary ?? ""}`,
            `BODY: ${input.content ?? ""}`,
            `AUTHOR: ${input.author ?? ""}`,
            `PUBLISHED_AT: ${input.publishedAt ?? ""}`,
            `LINK: ${input.link ?? input.guid ?? ""}`,
            `IMAGE_URL: ${input.imageUrl ?? ""}`,
            `CATEGORIES: ${Array.isArray(input.categories) ? input.categories.join(", ") : ""}`,
          ].join("\n")
        : String(input ?? "").trim();

      const inputHeader = isObjectInput
        ? "INPUT FORMAT: FEED_ITEM_FIELDS (normalized lines)"
        : "INPUT FORMAT: RAW_TEXT";

      const fieldMappingGuidance = isObjectInput
        ? `Field mapping guidance:
- Title → Use TITLE when present; otherwise infer from BODY.
- Summary → Use SUMMARY; expand to a concise abstract if too short.
- Body → Use BODY for main narrative facts; avoid redundancy with SUMMARY.
- Author/Published → Include factual mentions where relevant.
- Categories → Use for tags; deduplicate and lowercase.
- Link → Use for reference in linkTool block if applicable.
- Image/Banner → Do NOT add body images. ${bannerUrl ? "Use only the banner in metadata, not as an image block." : "No images should be included."}`
        : "";

      const contentPrompt = `
      You are a professional sports journalist and content creator.  
Your task is to generate a comprehensive, well-structured long-form article for: ${request.content}  

---

## CRITICAL RULES:
- The article **must strictly relate to sports** (games, players, events, rules, training, comparisons, analysis, news, or history).  
- ❌ If the topic is NOT related to sports, respond ONLY with this JSON:  
{
  "blocks": [
    {
      "id": "error_msg",
      "type": "paragraph",
      "data": { "text": "Sorry, I can only generate content related to sports." }
    }
  ]
}  

---

## ARTICLE REQUIREMENTS:
1. **Length**: ~100–200 lines (balanced between short and long blocks).  
2. **Format**: JSON in **Editor.js block format**.  
   - Allowed blocks: '"paragraph"', '"header"', '"list"', '"table"', '"quote"', '"image"', '"embed"'.  
   - ❌ Forbidden blocks: '"delimiter"'.  
3. **Block IDs**: Every block must have a **unique, descriptive id** (e.g., '"intro_header"', '"history_para1"', '"pros_table"').  
4. **Content Variety**: Use a mix of block types (paragraphs, lists, tables, quotes) for scannability.  
5. **Summary**: End with a summary paragraph (~100 words) under block id '"summary_para"'.  

---

## SPECIAL FORMATTING RULES:
- **Tables**:  
  - Must be valid 2D arrays ('array of arrays').  
  - First row = headers.  
  - Example:  
    [ ["Player", "Matches", "Goals"], ["Messi", "1000", "800"], ["Ronaldo", "1200", "850"] ]  
- **Headers**: Clearly mark sections (e.g., '"History"', '"Key Players"', '"Tactics"', '"Future Outlook"').  
- **Images**:  
  - Use ONLY user-provided images.  
  - ❌ If no images are provided, do not insert image blocks.  
- **Quotes**: Should be attributed to **real athletes, coaches, or sports analysts**.  

---

## ADAPTATION GUIDELINES:
- **Tutorials/Guides** → headers + paragraphs + ordered lists  
- **Comparisons** → tables + headers + paragraphs  
- **News** → headers + paragraphs + quotes  
- **Reviews** → headers + checklists + images  
- **Opinion pieces** → headers + quotes + paragraphs  

---

## OUTPUT RULES:
- Return **valid JSON ONLY** in Editor.js format (no explanations, no markdown, no extra text).  
- Before returning, **verify**:  
  - ✅ Is the content strictly sports-related?  
  - ✅ Are all block IDs unique and descriptive?  
  - ✅ Are all tables valid 2D arrays?  
  - ✅ Are adaptation rules followed based on content type?  

---

${inputHeader}  
${feedContext}  

Each block must have a unique id.  
${fieldMappingGuidance}


      `;

      const result = await structuredModel.invoke([
        {
          role: "human",
          content: contentPrompt,
        },
      ]);

      const normalizedBody = normalizeEditorJsBody(
        result.body as any
      ) as unknown as Record<string, unknown>;

      const toInsert: NewGeneratedContent = {
        title: result.title,
        summary: result.summary,
        category: result.category,
        tags: result.tags,
        body: normalizedBody,
        ...(bannerUrl ? { bannerUrl } : {}),
      };
      const saved = await generatedContentRepository.create(toInsert);

      return {
        blogId: saved.id,
        generatedContent: {
          ...result,
          body: normalizedBody as any,
          bannerUrl,
          images: [],
        },
        originalContent: request.content,
        timestamp: new Date().toISOString(),
      };
    },
  };
}

function normalizeEditorJsBody(body: any) {
  if (!body || !Array.isArray(body.blocks)) return body;

  const to2D = (content: any): any[] => {
    if (!Array.isArray(content)) return [];
    if (Array.isArray(content[0])) return content;
    return [content];
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
