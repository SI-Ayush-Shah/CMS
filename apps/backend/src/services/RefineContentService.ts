import {
  RefineContentRequestDto,
  RefineContentResponseDto,
} from "../types/dtos";
import { z } from "zod";
import { createGoogleGenaiModel } from "../llms/google-genai/model";

export interface RefineContentService {
  refine(request: RefineContentRequestDto): Promise<RefineContentResponseDto>;
}

export function createRefineContentService(): RefineContentService {
  // Minimal service that asks the LLM to apply the prompt to the provided Editor.js body
  // and returns a normalized Editor.js body
  return {
    async refine(
      request: RefineContentRequestDto
    ): Promise<RefineContentResponseDto> {
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

      const responseSchema = z.object({
        updatedBody: editorJsSchema,
        message: z.string(),
      });

      const model = createGoogleGenaiModel({
        modelName: "gemini-2.5-flash",
        temperature: 0.4,
      });

      const structuredModel = model.withStructuredOutput(responseSchema);

      // Provide explicit instructions to keep structure and fix table blocks
      const result = await structuredModel.invoke([
        {
          role: "human",
          content: `You are refining an existing Editor.js article body according to a human prompt. 
Apply edits conservatively to improve clarity, grammar, structure, and incorporate the user's intent. 
Preserve existing block types and IDs where possible; when adding new blocks, generate descriptive IDs. 
Do not produce code blocks unless the source body already contained them and the prompt requires them.
Do not use delimiter blocks at all; use clear headers to separate sections.
CRITICAL TABLE RULES: Each table block must contain data.content as a 2D array (array of row arrays). If the input contains 
multiple table rows as separate blocks or a 1D content array, merge/fix them into a single table block with 2D content.

User prompt: ${request.prompt}
Refinement type: ${request.refinementType ?? "custom"}

Input body (Editor.js JSON): ${JSON.stringify(request.body)}

Return ONLY JSON with { updatedBody, message }.`,
        },
      ]);

      // As an extra safety, normalize and strip unwanted blocks
      const normalized = normalizeEditorJsBody(result.updatedBody as any);
      return {
        updatedBody: normalized as any,
        message: result.message ?? "Refinement applied",
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

  for (const block of body.blocks) {
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
