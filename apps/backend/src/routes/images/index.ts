import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type, Static } from "@sinclair/typebox";
import "../../types/container";

const UploadImageResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    url: Type.String({ format: "uri" }),
    // Optional publicId for future deletes/versioning
    publicId: Type.Optional(Type.String()),
  }),
  error: Type.Optional(Type.String()),
});

type UploadImageResponse = Static<typeof UploadImageResponseSchema>;

const imagesRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  server.route<{ Reply: UploadImageResponse }>({
    method: "POST",
    url: "/upload",
    schema: {
      // Fastify v5 does not support 'consumes' on schema. We rely on @fastify/multipart.
      response: {
        200: UploadImageResponseSchema,
        400: UploadImageResponseSchema,
        500: UploadImageResponseSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        if (!(request as any).isMultipart || !(request as any).isMultipart()) {
          return reply.code(400).send({
            success: false,
            error: "Expected multipart/form-data",
            data: { url: "" } as any,
          });
        }

        const parts = (request as any).parts();
        let uploadedUrl: string | undefined;

        // Accept either field name: 'image' or 'banner'
        for await (const part of parts) {
          if (
            part.type === "file" &&
            (part.fieldname === "image" ||
              part.fieldname === "banner" ||
              part.fieldname === "file")
          ) {
            const chunks: Buffer[] = [];
            for await (const chunk of part.file) chunks.push(chunk as Buffer);
            const buffer = Buffer.concat(chunks);

            const { cloudinaryService } = (fastify as any).diContainer.cradle;
            const url = await cloudinaryService.uploadBuffer({
              buffer,
              filename: part.filename,
              mimeType: part.mimetype,
            });
            uploadedUrl = url;
            break;
          }
        }

        if (!uploadedUrl) {
          return reply.code(400).send({
            success: false,
            error: "No image file found in form data",
            data: { url: "" } as any,
          });
        }

        return reply
          .code(200)
          .send({ success: true, data: { url: uploadedUrl } });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
          data: { url: "" } as any,
        });
      }
    },
  });
};

export default imagesRoutes;
