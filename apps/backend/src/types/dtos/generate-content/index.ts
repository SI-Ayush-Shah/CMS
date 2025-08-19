import { Type, Static } from '@sinclair/typebox'

/**
 * Generate Content Module DTOs
 * 
 * This file contains all TypeBox schemas and auto-generated TypeScript types
 * for the generate-content module. These DTOs serve as the single source of truth
 * for data contracts across all layers (service, controller, routes).
 */

// Request DTO Schema
export const GenerateContentRequestSchema = Type.Object({
  content: Type.String({
    minLength: 1,
    maxLength: 10000,
    description: 'Content to process/generate from'
  }),
  bannerUrl: Type.Optional(Type.String({ format: 'uri', description: 'Banner image URL (Cloudinary)' })),
  images: Type.Optional(Type.Array(Type.String({ format: 'uri' }), { description: 'Hosted image URLs' }))
})

// Editor.js block schema
const EditorJsBlockSchema = Type.Object({
  id: Type.String({ description: 'Unique block identifier' }),
  type: Type.Union([
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
    Type.Literal("linkTool")
  ], { description: 'Editor.js block type' }),
  data: Type.Any({ description: 'Block-specific data structure - flexible object' })
})

// Editor.js document schema
const EditorJsSchema = Type.Object({
  time: Type.Optional(Type.Number({ description: 'Creation timestamp' })),
  blocks: Type.Array(EditorJsBlockSchema, { description: 'Content blocks array' }),
  version: Type.Optional(Type.String({ description: 'Editor.js version' }))
})

// Response DTO Schema  
export const GenerateContentResponseSchema = Type.Object({
  generatedContent: Type.Object({
    title: Type.String({ description: 'Article title' }),
    summary: Type.String({ description: 'Article summary' }),
    category: Type.String({ description: 'Article category' }),
    tags: Type.Array(Type.String(), { description: 'Article tags' }),
    bannerUrl: Type.Optional(Type.String({ format: 'uri', description: 'Banner image URL' })),
    images: Type.Array(Type.String(), { description: 'Gallery image URLs', default: [] }),
    body: EditorJsSchema
  }),
  originalContent: Type.String({
    description: 'The original input content'
  }),
  timestamp: Type.String({
    format: 'date-time',
    description: 'When the content was generated'
  })
})

// PATCH DTO Schema
export const PatchGeneratedContentSchema = Type.Object({
  title: Type.Optional(Type.String()),
  summary: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  bannerUrl: Type.Optional(Type.String({ format: 'uri' })),
  images: Type.Optional(Type.Array(Type.String({ format: 'uri' }))),
  body: Type.Optional(EditorJsSchema)
})

export type GenerateContentRequestDto = Static<typeof GenerateContentRequestSchema>
export type GenerateContentResponseDto = Static<typeof GenerateContentResponseSchema>
export type PatchGeneratedContentDto = Static<typeof PatchGeneratedContentSchema>

// Export schemas for validation usage
export {
  GenerateContentRequestSchema as GenerateContentRequestValidation,
  GenerateContentResponseSchema as GenerateContentResponseValidation
}
