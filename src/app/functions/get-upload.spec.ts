import dayjs from 'dayjs'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { makeUpload } from '../../test/factories/make-upload'
import { isRight, unwrapEither } from '../shared/either'
import { getUploads } from './get-upload'

describe('get uploads', () => {
    it('should be able to get the uploads', async () => {
        const namePattern = randomUUID()

        const upload1 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload2 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload3 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload4 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload5 = await makeUpload({ name: `${namePattern}.jpg` })

        const sut = await getUploads({ searchQuery: namePattern })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toBe(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload1.id }),
        ])
    })

    it('should be able to get paginated the uploads', async () => {
        const namePattern = randomUUID()

        const upload1 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload2 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload3 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload4 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload5 = await makeUpload({ name: `${namePattern}.jpg` })

        const sut = await getUploads({
            searchQuery: namePattern,
            page: 1,
            pageSize: 3,
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toBe(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
        ])
    })

    it('should be able to get sorted uploads', async () => {
        const namePattern = randomUUID()

        const upload1 = await makeUpload({
            name: `${namePattern}.jpg`,
            createdAt: new Date(),
        })
        const upload2 = await makeUpload({
            name: `${namePattern}.jpg`,
            createdAt: dayjs().subtract(1, 'day').toDate(),
        })
        const upload3 = await makeUpload({
            name: `${namePattern}.jpg`,
            createdAt: dayjs().subtract(2, 'day').toDate(),
        })
        const upload4 = await makeUpload({
            name: `${namePattern}.jpg`,
            createdAt: dayjs().subtract(3, 'day').toDate(),
        })
        const upload5 = await makeUpload({
            name: `${namePattern}.jpg`,
            createdAt: dayjs().subtract(4, 'day').toDate(),
        })

        let sut = await getUploads({
            searchQuery: namePattern,
            sortBy: 'createdAt',
            sortDirection: 'asc',
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toBe(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload1.id }),
        ])

        sut = await getUploads({
            searchQuery: namePattern,
            sortBy: 'createdAt',
            sortDirection: 'desc',
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toBe(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload1.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload5.id }),
        ])
    })
})
