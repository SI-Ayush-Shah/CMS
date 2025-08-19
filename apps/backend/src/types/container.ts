import { AwilixContainer } from 'awilix'
import { UserService } from '../services/UserService'
import { GenerateContentService } from '../services/GenerateContentService'
import { UserRepository } from '../repositories/UserRepository'
import { HealthController } from '../controllers/HealthController'
import { UserController } from '../controllers/UserController'
import { GenerateContentController } from '../controllers/GenerateContentController'

export interface Dependencies {
  // Services
  userService: UserService
  generateContentService: GenerateContentService
  
  // Repositories
  userRepository: UserRepository
  
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
