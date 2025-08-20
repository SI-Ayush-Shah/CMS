import {
  GenerateContentRequestDto,
  GenerateContentResponseDto,
} from "../types/dtos";
import { z } from "zod";
import { GeneratedContentRepository } from "../repositories/GeneratedContentRepository";
import { type NewGeneratedContent } from "../db/schema";
import { createGoogleGenaiModel } from "../llms/google-genai/model";

export interface SummarizeContentService {
  summarize(request: GenerateContentRequestDto): Promise<GenerateContentResponseDto>;
}

interface Dependencies {
  generatedContentRepository: GeneratedContentRepository;
}

export function createSummarizeContentService({
  generatedContentRepository,
}: Dependencies): SummarizeContentService {
  return {
    async summarize(request: GenerateContentRequestDto): Promise<GenerateContentResponseDto> {
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
      const isObjectInput = input && typeof input === "object" && !Array.isArray(input);

      const bannerUrl = payload?.bannerUrl as string | undefined;
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

      const contentPrompt = `Summarize into a comprehensive, well-structured sports article using Editor.js blocks.

${inputHeader}
${feedContext}

RULES:
1. Keep the article focused on sports. If the input is not sports-related, clearly state the topic is out of scope for sports content.
2. Length target: 30-60 lines across blocks, and at least 20 blocks. Use multiple sections with sub-headers. Avoid one-line paragraphs; expand narrative and context.
3. Use Editor.js blocks only: paragraph, header, list, table, quote, delimiter, checklist, warning, image, embed, linkTool, code (sparingly if absolutely necessary).
4. Do NOT include any body images. ${bannerUrl ? "Use only the provided banner URL contextually in the article header/meta (not as an image block)." : "No images should be included."}
5. Paragraphs should be substantial: 2-4 sentences each (roughly 40-80 words). Close with a short summary (about 60-100 words) at the end.
6. Use tables only for factual data; ensure table data is a 2D array.
7. Each block must have a unique id.
${fieldMappingGuidance}

IMPORTANT: For table blocks, content MUST be a 2D array where each row is an array!
${bannerDirective}
CORRECT TABLE: "content": [["Header1", "Header2"], ["Row1Col1", "Row1Col2"]]
WRONG TABLE: "content": ["Header1", "Header2", "Row1Col1", "Row1Col2"]

Return JSON ONLY in Editor.js format, no extra explanation.`;

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


