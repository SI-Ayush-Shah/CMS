/**
 * DTOs Barrel Export - Module Organization
 *
 * This file provides a centralized export for all DTOs organized by modules.
 * Import DTOs using: import { GenerateContentRequestDto } from '../types/dtos'
 *
 * Structure:
 * - src/types/dtos/generate-content/ - Content generation module DTOs
 * - src/types/dtos/user/            - User management module DTOs
 * - src/types/dtos/auth/            - Authentication module DTOs
 * - src/types/dtos/health/          - Health check module DTOs
 */

// Generate Content Module DTOs
export {
  GenerateContentRequestSchema,
  GenerateContentResponseSchema,
  GenerateContentRequestDto,
  GenerateContentResponseDto,
  GenerateContentRequestValidation,
  GenerateContentResponseValidation,
} from "./generate-content";

// Refine Content Module DTOs
export {
  RefineContentRequestSchema,
  RefineContentResponseSchema,
  RefineContentRequestDto,
  RefineContentResponseDto,
} from "./refine-content";

// Future Module DTOs (placeholder structure):
// export * from './user'
// export * from './auth'
// export * from './health'
