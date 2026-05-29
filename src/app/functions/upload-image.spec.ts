import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { db } from '../../infra/db'
import { schema } from '../../infra/db/schema'
import { isLeft, isRight, unwrapEither } from '../shared/either'
import { InvalidFileFormat } from './errors/invalid-file-format'
import { uploadImage } from './upload-image'

describe('upload image', () => {
    beforeAll(() => {
        vi.mock('@/infra/storage/upload-file-to-storage', () => ({
            uploadFileToStorage: vi.fn().mockImplementation(() => ({
                key: `${randomUUID()}.jpg`,
                url: `https://example.com/${randomUUID()}.jpg`,
            })),
        }))
    })

    it('should upload an image', async () => {
        const fileName = `test-${randomUUID()}.jpg`

        const sut = await uploadImage({
            fileName,
            contentType: 'image/jpg',
            contentStream: Readable.from([]),
        })

        expect(isRight(sut)).toBe(true)

        const result = await db
            .select()
            .from(schema.uploads)
            .where(eq(schema.uploads.name, fileName))

        expect(result).toHaveLength(1)
    })

    it('should not upload an image with invalid content type', async () => {
        const fileName = `test-${randomUUID()}.jpg`

        const sut = await uploadImage({
            fileName,
            contentType: 'document/pdf',
            contentStream: Readable.from([]),
        })

        expect(isLeft(sut)).toBe(true)
        expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
    })
})
