import { Type, Static } from '@sinclair/typebox'

/**
 * Health Module DTOs
 * 
 * This file contains all TypeBox schemas and auto-generated TypeScript types
 * for the health check module.
 */

// Health Check Response Schema
export const HealthResponseSchema = Type.Object({
  status: Type.String({ enum: ['healthy', 'unhealthy'] }),
  timestamp: Type.String({ format: 'date-time' }),
  uptime: Type.Number({ description: 'Server uptime in seconds' }),
  version: Type.String({ description: 'Application version' })
})

// Readiness Check Response Schema  
export const ReadinessResponseSchema = Type.Object({
  status: Type.String({ enum: ['ready', 'not_ready'] }),
  timestamp: Type.String({ format: 'date-time' }),
  dependencies: Type.Object({
    database: Type.String({ enum: ['connected', 'disconnected'] }),
    redis: Type.String({ enum: ['connected', 'disconnected'] })
  })
})

// Auto-generated TypeScript DTOs
export type HealthResponseDto = Static<typeof HealthResponseSchema>
export type ReadinessResponseDto = Static<typeof ReadinessResponseSchema>

// Export schemas for validation
export {
  HealthResponseSchema as HealthResponseValidation,
  ReadinessResponseSchema as ReadinessResponseValidation
}
