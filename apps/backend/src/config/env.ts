import { Static, Type } from '@sinclair/typebox'
import envSchema from 'env-schema'

enum NodeEnv {
  development = 'development',
  production = 'production',
  test = 'test',
}

const schema = Type.Object({
  NODE_ENV: Type.Enum(NodeEnv, { default: NodeEnv.development }),
  PORT: Type.Number({ default: 3000 }),
  GOOGLE_API_KEY: Type.String(),
  // Optional database URL - can be undefined if not using database features
  DATABASE_URL: Type.Optional(Type.String()),
  CLOUDINARY_CLOUD_NAME: Type.Optional(Type.String()),
  CLOUDINARY_API_KEY: Type.Optional(Type.String()),
  CLOUDINARY_API_SECRET: Type.Optional(Type.String()),
})

export const env = envSchema<Static<typeof schema>>({
  dotenv: true,
  schema,
})

// Export commonly used values for convenience
export const isDevelopment = env.NODE_ENV === NodeEnv.development
export const isProduction = env.NODE_ENV === NodeEnv.production
export const isTest = env.NODE_ENV === NodeEnv.test