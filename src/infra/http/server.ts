import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
    hasZodFastifySchemaValidationErrors,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { exportUploadsRoute } from './routes/export-uploads'
import { getUploadsRoute } from './routes/get-uploads'
import { uploadImageRoute } from './routes/upload-image'
import { transformSwaggerSchema } from './transform-swagger-schema'

export const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifyCors, { origin: '*' })

server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Validation error',
            issues: error.validation,
        })
    }

    // TODO: enviar erro para ferramenta de observabilidade
    console.log(error)

    return reply.status(500).send({ message: 'Internal server error' })
})

server.register(fastifyMultipart)
server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Upload Server',
            version: '1.0.0',
        },
    },
    transform: transformSwaggerSchema,
})

server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

server.get('/', async () => {
    return {
        message: 'Hello World!',
    }
})

server.listen({ port: 3333 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening on ${address}`)
})
