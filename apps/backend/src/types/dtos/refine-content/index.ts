import { Type, Static } from "@sinclair/typebox";

// Re-declare Editor.js schemas for this module
const EditorJsBlockSchema = Type.Object({
  id: Type.String({ description: "Unique block identifier" }),
  type: Type.Union(
    [
      Type.Literal("paragraph"),
      Type.Literal("header"),
      Type.Literal("list"),
      Type.Literal("table"),
      Type.Literal("code"),
      Type.Literal("quote"),
      Type.Literal("delimiter"),
      Type.Literal("image"),
      Type.Literal("embed"),
      Type.Literal("checklist"),
      Type.Literal("warning"),
      Type.Literal("linkTool"),
    ],
    { description: "Editor.js block type" }
  ),
  data: Type.Any({ description: "Block-specific data" }),
});

export const EditorJsSchema = Type.Object({
  time: Type.Optional(Type.Number({ description: "Creation timestamp" })),
  blocks: Type.Array(EditorJsBlockSchema, {
    description: "Content blocks array",
  }),
  version: Type.Optional(Type.String({ description: "Editor.js version" })),
});

// Request DTO
export const RefineContentRequestSchema = Type.Object({
  blogId: Type.Optional(Type.String({ format: "uuid" })),
  prompt: Type.String({ minLength: 1, maxLength: 5000 }),
  body: EditorJsSchema,
  refinementType: Type.Optional(Type.String({ default: "custom" })),
});

// Response DTO
export const RefineContentResponseSchema = Type.Object({
  updatedBody: EditorJsSchema,
  message: Type.String(),
});

export type RefineContentRequestDto = Static<typeof RefineContentRequestSchema>;
export type RefineContentResponseDto = Static<
  typeof RefineContentResponseSchema
>;
