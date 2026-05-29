import { asc, count, desc, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../infra/db'
import { schema } from '../../infra/db/schema'
import { type Either, makeRight } from '../shared/either'

const getUploadsInput = z.object({
    searchQuery: z.string().optional(),
    sortBy: z.enum(['createdAt']).default('createdAt'),
    sortDirection: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(15),
})

type GetUploadsInput = z.input<typeof getUploadsInput>

type GetUploadsOutput = {
    uploads: Array<{
        id: string
        name: string
        remoteKey: string
        remoteUrl: string
        createdAt: Date
    }>
    total: number
}

export async function getUploads(
    input: GetUploadsInput
): Promise<Either<never, GetUploadsOutput>> {
    const { searchQuery, sortBy, sortDirection, page, pageSize } =
        getUploadsInput.parse(input)

    const [uploads, [{ total }]] = await Promise.all([
        db
            .select({
                id: schema.uploads.id,
                name: schema.uploads.name,
                remoteKey: schema.uploads.remoteKey,
                remoteUrl: schema.uploads.remoteUrl,
                createdAt: schema.uploads.createdAt,
            })
            .from(schema.uploads)
            .where(
                searchQuery
                    ? ilike(schema.uploads.name, `%${searchQuery}%`)
                    : undefined
            )
            .orderBy(fields => {
                if (sortBy && sortDirection === 'desc') {
                    return desc(fields[sortBy])
                }

                if (sortBy && sortDirection === 'asc') {
                    return asc(fields[sortBy])
                }

                return desc(fields.id)
            })
            .offset((page - 1) * pageSize)
            .limit(pageSize),

        db
            .select({ total: count(schema.uploads.id) })
            .from(schema.uploads)
            .where(
                searchQuery
                    ? ilike(schema.uploads.name, `%${searchQuery}%`)
                    : undefined
            ),
    ])

    return makeRight({ uploads, total })
}
