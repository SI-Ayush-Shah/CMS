import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  RefineContentRequestSchema,
  RefineContentResponseSchema,
} from "../../types/dtos";
import "../../types/container";

const refineContentRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  const RefineContentApiResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: RefineContentResponseSchema,
  });

  server.route({
    method: "POST",
    url: "/",
    schema: {
      body: RefineContentRequestSchema,
      response: {
        200: RefineContentApiResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { refineContentController } = fastify.diContainer.cradle as any;
      return refineContentController.refine(request, reply);
    },
  });
};

export default refineContentRoutes;
