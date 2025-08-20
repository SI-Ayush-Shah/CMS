import { FastifyRequest, FastifyReply } from "fastify";
import { RefineContentService } from "../services/RefineContentService";
import { RefineContentRequestDto } from "../types/dtos";

export interface RefineContentController {
  refine(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

interface Dependencies {
  refineContentService: RefineContentService;
}

export function createRefineContentController({
  refineContentService,
}: Dependencies): RefineContentController {
  if (!refineContentService) {
    throw new Error(
      "refineContentService is required for refineContentController"
    );
  }

  return {
    async refine(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const payload = request.body as RefineContentRequestDto;
        const result = await refineContentService.refine(payload);
        reply.code(200).send({ success: true, data: result });
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Bad request",
        });
      }
    },
  };
}
