import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getUploads } from '../../../app/functions/get-upload'
import { unwrapEither } from '../../../app/shared/either'

export const getUploadsRoute: FastifyPluginAsyncZod = async server => {
    server.get(
        '/uploads',
        {
            schema: {
                summary: 'Get uploads',
                tags: ['uploads'],
                querystring: z.object({
                    searchQuery: z.string().optional(),
                    page: z.coerce.number().optional().default(1),
                    pageSize: z.coerce.number().optional().default(15),
                    sortBy: z.enum(['createdAt']).optional(),
                    sortDirection: z.enum(['asc', 'desc']).optional(),
                }),
                response: {
                    200: z.object({
                        uploads: z.array(
                            z.object({
                                id: z.string(),
                                name: z.string(),
                                remoteKey: z.string(),
                                remoteUrl: z.string(),
                                createdAt: z.date(),
                            })
                        ),
                        total: z.number(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { searchQuery, page, pageSize, sortBy, sortDirection } =
                request.query

            const result = await getUploads({
                searchQuery,
                page,
                pageSize,
                sortBy,
                sortDirection,
            })

            const { uploads, total } = unwrapEither(result)

            return reply.status(200).send({ uploads, total })
        }
    )
}
