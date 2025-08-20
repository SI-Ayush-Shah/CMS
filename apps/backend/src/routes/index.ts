import { FastifyPluginAsync } from "fastify";

const rootRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /
  fastify.get("/", async (request, reply) => {
    return {
      hello: "world",
      message: "Fastify with Functional Awilix DI and Autoload is running!",
      endpoints: {
        health: "/health",
        readiness: "/readiness",
        users: "/users",
        generateContent: "/generate-content",
        summarize: "/summarize",
        content: "/content",
        refineContent: "/refine-content",
        socialMediaPosts: "/social-media-posts",
      },
    };
  });
};

export default rootRoutes;
