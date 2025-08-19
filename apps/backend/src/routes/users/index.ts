import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type, Static } from '@sinclair/typebox'
import '../../types/container' // Import type declarations

// TypeBox Runtime Validation Schemas
const GetUserParamsSchema = Type.Object({
  id: Type.String({ description: 'User ID' })
})

const CreateUserBodySchema = Type.Object({
  email: Type.String({ format: 'email', description: 'User email address' }),
  name: Type.String({ minLength: 1, maxLength: 100, description: 'User full name' })
})

const UpdateUserParamsSchema = Type.Object({
  id: Type.String({ description: 'User ID' })
})

const UpdateUserBodySchema = Type.Object({
  email: Type.Optional(Type.String({ format: 'email', description: 'User email address' })),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100, description: 'User full name' }))
})

// Response Schemas
const UserResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' })
})

const UsersListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(UserResponseSchema)
})

const UserSingleResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: UserResponseSchema
})

const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String()
})

// TypeScript types (auto-generated from schemas)
type GetUserParams = Static<typeof GetUserParamsSchema>
type CreateUserBody = Static<typeof CreateUserBodySchema>
type UpdateUserParams = Static<typeof UpdateUserParamsSchema>
type UpdateUserBody = Static<typeof UpdateUserBodySchema>

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // GET /users - Get all users
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: UsersListResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { userController } = fastify.diContainer.cradle
      return userController.getAllUsers(request, reply)
    }
  })

  // GET /users/:id - Get user by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: GetUserParamsSchema,
      response: {
        200: UserSingleResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { userController } = fastify.diContainer.cradle
      return userController.getUserById(request, reply)
    }
  })

  // POST /users - Create new user
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      body: CreateUserBodySchema,
      response: {
        201: UserSingleResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { userController } = fastify.diContainer.cradle
      return userController.createUser(request, reply)
    }
  })

  // PUT /users/:id - Update user
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      params: UpdateUserParamsSchema,
      body: UpdateUserBodySchema,
      response: {
        200: UserSingleResponseSchema,
        404: ErrorResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { userController } = fastify.diContainer.cradle
      return userController.updateUser(request, reply)
    }
  })

  // DELETE /users/:id - Delete user
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: GetUserParamsSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { userController } = fastify.diContainer.cradle
      return userController.deleteUser(request, reply)
    }
  })
}

export default userRoutes
