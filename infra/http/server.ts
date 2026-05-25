import fastifyCors from '@fastify/cors'
import fastify from 'fastify'

export const server = fastify()

server.register(fastifyCors, { origin: '*' })

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
