import { AwilixContainer } from "awilix";
import { UserService } from "../services/UserService";
import { GenerateContentService } from "../services/GenerateContentService";
import { RefineContentService } from "../services/RefineContentService";
import { DatabaseConnection, db } from "../db";
import { UserRepository } from "../repositories/UserRepository";
import { HealthController } from "../controllers/HealthController";
import { UserController } from "../controllers/UserController";
import { GenerateContentController } from "../controllers/GenerateContentController";
import { RefineContentController } from "../controllers/RefineContentController";
import { GeneratedContentRepository } from "../repositories/GeneratedContentRepository";
import { RssFeedRepository } from "../repositories/RssFeedRepository";
import { RssFeedItemRepository } from "../repositories/RssFeedItemRepository";
import type { AppRedisClient } from "../config/redis";
import type { RssFeedService } from "../services/RssFeedService";
import type { RssFeedItemService } from "../services/RssFeedItemService";
import type { RssFeedItemController } from "../controllers/RssFeedItemController";

export interface Dependencies {
  // Database
  db: typeof db;
  databaseConnection: DatabaseConnection;

  // Infra
  redis: AppRedisClient | null;

  // Services
  userService: UserService;
  generateContentService: GenerateContentService;
  refineContentService: RefineContentService;
  rssFeedService: RssFeedService;
  rssFeedItemService: RssFeedItemService;

  // Repositories
  userRepository: UserRepository;
  generatedContentRepository: GeneratedContentRepository;
  rssFeedRepository: RssFeedRepository;
  rssFeedItemRepository: RssFeedItemRepository;

  // Controllers
  healthController: HealthController;
  userController: UserController;
  generateContentController: GenerateContentController;
  refineContentController: RefineContentController;
  rssFeedItemController: RssFeedItemController;
}

// TypeScript declarations for @fastify/awilix
declare module "fastify" {
  interface FastifyInstance {
    diContainer: AwilixContainer<Dependencies>;
  }
}
