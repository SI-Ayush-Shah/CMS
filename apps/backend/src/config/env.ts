import { Static, Type } from "@sinclair/typebox";
import envSchema from "env-schema";

enum NodeEnv {
  development = "development",
  production = "production",
  test = "test",
}

const schema = Type.Object({
  NODE_ENV: Type.Enum(NodeEnv, { default: NodeEnv.development }),
  PORT: Type.Number({ default: 3000 }),
  GOOGLE_API_KEY: Type.String({ default: "development_key" }),
  // OpenAI API key for image/text generation when using OpenAI provider
  OPENAI_API_KEY: Type.Optional(Type.String()),
  // DeepAI API key for image generation when using DeepAI provider
  DEEPAI_API_KEY: Type.Optional(Type.String()),
  // Provider selection and model names (defaults: Gemini for text, OpenAI for image)
  TEXT_MODEL_PROVIDER: Type.Optional(Type.String({ default: "gemini" })),
  TEXT_MODEL_NAME: Type.Optional(Type.String({ default: "gemini-1.5-flash" })),
  IMAGE_MODEL_PROVIDER: Type.Optional(Type.String({ default: "deepai" })),
  // For DeepAI, this is the endpoint name (e.g. "text2img"); for OpenAI, the model name (e.g. "gpt-image-1")
  IMAGE_MODEL_NAME: Type.Optional(Type.String({ default: "text2img" })),
  // Optional database URL - can be undefined if not using database features
  DATABASE_URL: Type.Optional(Type.String()),
  // Redis configuration (either REDIS_URL or discrete host/port/credentials)
  REDIS_URL: Type.Optional(Type.String({ default: "redis://localhost:6379" })),
  REDIS_HOST: Type.Optional(Type.String()),
  REDIS_PORT: Type.Optional(Type.Number()),
  REDIS_USERNAME: Type.Optional(Type.String()),
  REDIS_PASSWORD: Type.Optional(Type.String()),
  CLOUDINARY_CLOUD_NAME: Type.Optional(Type.String()),
  CLOUDINARY_API_KEY: Type.Optional(Type.String()),
  CLOUDINARY_API_SECRET: Type.Optional(Type.String()),
  // Twitter credentials for publishing
  TWITTER_API_KEY: Type.Optional(Type.String()),
  TWITTER_API_SECRET: Type.Optional(Type.String()),
  TWITTER_ACCESS_TOKEN: Type.Optional(Type.String()),
  TWITTER_ACCESS_TOKEN_SECRET: Type.Optional(Type.String()),
  TWITTER_BEARER_TOKEN: Type.Optional(Type.String()),
  // Instagram Graph API credentials for publishing
  IG_BUSINESS_ACCOUNT_ID: Type.Optional(Type.String()),
  IG_ACCESS_TOKEN: Type.Optional(Type.String()),
  // Self-ping configuration
  SELF_PING_URL: Type.Optional(Type.String()),
  SELF_PING_INTERVAL_MS: Type.Optional(Type.Number({ default: 30000 })),
  // Workers
  ENABLE_WORKERS: Type.Optional(Type.Boolean({ default: true })),
  // Milvus
  MILVUS_ADDRESS: Type.Optional(Type.String()),
  MILVUS_USERNAME: Type.Optional(Type.String()),
  MILVUS_PASSWORD: Type.Optional(Type.String()),
  MILVUS_DB: Type.Optional(Type.String({ default: 'default' })),
  MILVUS_TLS: Type.Optional(Type.Boolean({ default: false })),
});

export const env = envSchema<Static<typeof schema>>({
  schema,
  // Make .env file optional
  env: true,
});

// Export commonly used values for convenience
export const isDevelopment = env.NODE_ENV === NodeEnv.development;
export const isProduction = env.NODE_ENV === NodeEnv.production;
export const isTest = env.NODE_ENV === NodeEnv.test;
