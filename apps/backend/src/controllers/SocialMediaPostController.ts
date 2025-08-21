import { FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSocialMediaPostService } from "../services/SocialMediaPostService";

export interface SocialMediaPostController {
  list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  publish(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export function createSocialMediaPostController(): SocialMediaPostController {
  const service = createSocialMediaPostService();

  return {
    async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const {
        platform,
        page = 1,
        pageSize = 10,
      } = request.query as {
        platform?: "instagram" | "twitter";
        page?: number;
        pageSize?: number;
      };

      const result = await service.list({ platform, page, pageSize });
      reply.code(200).send({ success: true, data: result });
    },
    async publish(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const { id } = request.params as { id: string };
      try {
        const result = await service.publish(id);
        reply.code(200).send({ success: true, data: result });
      } catch (err: any) {
        const message = err?.message || "Failed to publish";
        const status =
          err?.statusCode && Number.isInteger(err.statusCode)
            ? Number(err.statusCode)
            : 400;
        reply.code(status).send({ success: false, error: message });
      }
    },
  };
}
