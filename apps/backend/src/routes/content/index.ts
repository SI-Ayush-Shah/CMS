import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import "../../types/container";
import { selectGeneratedContentSchema } from "../../db/schema/generatedContent";

const contentRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /content - Paginated list with filters/sort
  server.route({
    method: "GET",
    url: "/",
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ default: 1 })),
        pageSize: Type.Optional(Type.Number({ default: 10 })),
        status: Type.Optional(
          Type.Union([Type.Literal("draft"), Type.Literal("published")])
        ),
        category: Type.Optional(Type.String()),
        categories: Type.Optional(Type.Array(Type.String())),
        tags: Type.Optional(Type.Array(Type.String())),
        sort: Type.Optional(
          Type.Union([Type.Literal("asc"), Type.Literal("desc")], {
            default: "desc",
          })
        ),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            items: Type.Array(selectGeneratedContentSchema),
            total: Type.Number(),
            page: Type.Number(),
            pageSize: Type.Number(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { generatedContentRepository } = fastify.diContainer.cradle;
      const {
        page = 1,
        pageSize = 10,
        status,
        category,
        categories,
        tags,
        sort = "desc",
      } = request.query as any;
      const result = await generatedContentRepository.list({
        page,
        pageSize,
        status,
        category,
        categories,
        tags,
        sort,
      });
      const mapped = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        items: result.items.map((row: any) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          category: row.category,
          tags: row.tags || [],
          body: row.body || {},
          images: Array.isArray(row.images) ? row.images : [],
          bannerUrl: row.bannerUrl ?? null,
          status: row.status,
          createdAt: new Date(row.createdAt).toISOString(),
          updatedAt: new Date(row.updatedAt).toISOString(),
        })),
      };
      return reply.code(200).send({ success: true, data: mapped });
    },
  });

  // GET /content/:id - Single content by id
  server.route({
    method: "GET",
    url: "/:id",
    schema: {
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      response: {
        200: Type.Object({ success: Type.Boolean(), data: selectGeneratedContentSchema }),
        404: Type.Object({ success: Type.Boolean(), error: Type.String() }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { generatedContentRepository } = fastify.diContainer.cradle;
      const row = await generatedContentRepository.findById(id);
      if (!row)
        return reply.code(404).send({ success: false, error: "Not found" });
      const mapped = {
        id: row.id,
        title: row.title,
        summary: row.summary,
        category: row.category,
        tags: (row as any).tags || [],
        body: (row as any).body || {},
        images: Array.isArray((row as any).images) ? (row as any).images : [],
        bannerUrl: (row as any).bannerUrl ?? null,
        status: row.status as any,
        createdAt: new Date((row as any).createdAt).toISOString(),
        updatedAt: new Date((row as any).updatedAt).toISOString(),
      };
      return reply.code(200).send({ success: true, data: mapped });
    },
  });

  // PATCH /content/:id - Update selected fields
  server.route({
    method: "PATCH",
    url: "/:id",
    schema: {
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      body: (await import("../../types/dtos/generate-content"))
        .PatchGeneratedContentSchema,
      response: {
        200: Type.Object({ success: Type.Boolean(), data: Type.Any() }),
        404: Type.Object({ success: Type.Boolean(), error: Type.String() }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { generatedContentRepository } = fastify.diContainer.cradle;
      const updated = await generatedContentRepository.update(id, body);
      if (!updated)
        return reply.code(404).send({ success: false, error: "Not found" });
      return reply.code(200).send({ success: true, data: updated });
    },
  });
};

export default contentRoutes;
