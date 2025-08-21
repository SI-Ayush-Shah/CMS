import Fastify, { FastifyInstance } from "fastify";
import autoload from "@fastify/autoload";
import path from "path";
import { setupContainerWithAutoDiscovery } from "./config/container";
import { handleApiError } from "./shared/utils/error-handler";
import { loggerConfig } from "./shared/utils/logger-config";
import "./types/container"; // Import type declarations
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import rssSchedulerWorkerPlugin from "./infra/bullmq/rssSchedulerWorkerPlugin";

// Create Fastify instance with Pino logger
const fastify: FastifyInstance = Fastify({
  logger: loggerConfig,
});

const start = async (): Promise<void> => {
  try {
    // Register Awilix plugin for dependency injection
    const { fastifyAwilixPlugin } = require("@fastify/awilix");
    await fastify.register(fastifyAwilixPlugin, {
      disposeOnClose: true,
      disposeOnResponse: false,
    });
    // CORS
    await fastify.register(cors, {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposedHeaders: ["Content-Length", "Content-Type"],
      maxAge: 86400,
    });
    // Multipart for file uploads (images)
    await fastify.register(multipart, {
      limits: { fileSize: 10 * 1024 * 1024, files: 10 },
    });

    // Setup container with autodiscovery
    const container = await setupContainerWithAutoDiscovery();

    // Replace the default container with our autodiscovered one
    fastify.diContainer = container;

    // Log discovered dependencies
    const discoveredDeps = Object.keys(container.cradle);

    // Global error handler
    fastify.setErrorHandler(handleApiError);

    // Auto-load routes from routes directory
    await fastify.register(autoload, {
      dir: path.join(__dirname, "routes"),
      options: {
        prefix: "/content-studio/api",
      },
    });
    // Start server
    const { env } = require("./config/env");
    // Register BullMQ worker plugin before listening so lifecycle hooks are bound
    await fastify.register(rssSchedulerWorkerPlugin);
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`🚀 Server listening on http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
