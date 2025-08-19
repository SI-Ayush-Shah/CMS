import { AwilixContainer } from 'awilix'
import { UserService } from '../services/UserService'
import { GenerateContentService } from '../services/GenerateContentService'
import { DatabaseConnection, db } from '../db'
import { UserRepository } from '../repositories/UserRepository'
import { HealthController } from '../controllers/HealthController'
import { UserController } from '../controllers/UserController'
import { GenerateContentController } from '../controllers/GenerateContentController'
import { GeneratedContentRepository } from '../repositories/GeneratedContentRepository'
import { RssFeedRepository } from '../repositories/RssFeedRepository'

export interface Dependencies {
  // Database
  db: typeof db
  databaseConnection: DatabaseConnection
  
  // Services
  userService: UserService
  generateContentService: GenerateContentService
  
  // Repositories
  userRepository: UserRepository
  generatedContentRepository: GeneratedContentRepository
  rssFeedRepository: RssFeedRepository
  
  // Controllers
  healthController: HealthController
  userController: UserController
  generateContentController: GenerateContentController
}

// TypeScript declarations for @fastify/awilix
declare module 'fastify' {
  interface FastifyInstance {
    diContainer: AwilixContainer<Dependencies>
  }
}
