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
  })
})

// Response DTO Schema  
export const GenerateContentResponseSchema = Type.Object({
  generatedContent: Type.String({
    description: 'The generated/processed content'
  }),
  originalContent: Type.String({
    description: 'The original input content'
  }),
  timestamp: Type.String({
    format: 'date-time',
    description: 'When the content was generated'
  })
})

// Auto-generated TypeScript DTOs from schemas
export type GenerateContentRequestDto = Static<typeof GenerateContentRequestSchema>
export type GenerateContentResponseDto = Static<typeof GenerateContentResponseSchema>

// Export schemas for validation usage
export {
  GenerateContentRequestSchema as GenerateContentRequestValidation,
  GenerateContentResponseSchema as GenerateContentResponseValidation
}
