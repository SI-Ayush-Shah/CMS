import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type, Static } from "@sinclair/typebox";
import {
  GenerateContentRequestSchema,
  GenerateContentResponseSchema,
  GenerateContentRequestDto,
  GenerateContentResponseDto,
} from "../../types/dtos";
import "../../types/container";

const JobsSchema = Type.Object({
  twitterJobId: Type.Optional(Type.String({ description: 'Job ID for Twitter post generation' })),
  instagramJobId: Type.Optional(Type.String({ description: 'Job ID for Instagram post generation' })),
})

const SummarizeApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: GenerateContentResponseSchema,
  jobs: JobsSchema,
});

const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String(),
});

export type SummarizeApiResponse = Static<typeof SummarizeApiResponseSchema>;
export type SummarizeErrorResponse = Static<typeof ErrorResponseSchema>;

const summarizeRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  server.route({
    method: "POST",
    url: "/",
    schema: {
      consumes: ["multipart/form-data", "application/json"],
      response: {
        200: SummarizeApiResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { summarizeContentController } = fastify.diContainer.cradle;
      return summarizeContentController.summarize(request, reply);
    },
  });
};

export default summarizeRoutes;


