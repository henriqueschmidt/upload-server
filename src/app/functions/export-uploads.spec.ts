import * as upload from '@/infra/storage/upload-file-to-storage'
import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { makeUpload } from '../../test/factories/make-upload'
import { unwrapEither } from '../shared/either'
import { exportUploads } from './export-uploads'

describe('export uploads', () => {
    beforeAll(() => {
        vi.mock('@/infra/storage/upload-file-to-storage', () => ({
            uploadFileToStorage: vi.fn().mockImplementation(() => ({
                key: `${randomUUID()}.jpg`,
                url: `https://example.com/${randomUUID()}.jpg`,
            })),
        }))
    })

    it('should be able to export uploads', async () => {
        const namePattern = randomUUID()
        const uploadStub = vi
            .spyOn(upload, 'uploadFileToStorage')
            .mockImplementationOnce(async () => {
                return {
                    key: `${randomUUID()}.csv`,
                    url: `https://example.com/${namePattern}.csv`,
                }
            })

        const upload1 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload2 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload3 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload4 = await makeUpload({ name: `${namePattern}.jpg` })
        const upload5 = await makeUpload({ name: `${namePattern}.jpg` })

        const sut = await exportUploads({ searchQuery: namePattern })

        const generatedCSVStream = uploadStub.mock.calls[0][0].contentStream
        const csvAsString = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []

            generatedCSVStream.on('data', chunk => chunks.push(chunk))
            generatedCSVStream.on('end', () =>
                resolve(Buffer.concat(chunks).toString('utf-8'))
            )
            generatedCSVStream.on('error', reject)
        })

        const csvAsArray = csvAsString
            .trim()
            .split('\n')
            .map(line => line.split(','))

        expect(unwrapEither(sut)).toEqual({
            reportUrl: `https://example.com/${namePattern}.csv`,
        })

        expect(csvAsArray.some(line => line.includes(upload1.name))).toBe(true)
        expect(csvAsArray.some(line => line.includes(upload2.name))).toBe(true)
        expect(csvAsArray.some(line => line.includes(upload3.name))).toBe(true)
        expect(csvAsArray.some(line => line.includes(upload4.name))).toBe(true)
        expect(csvAsArray.some(line => line.includes(upload5.name))).toBe(true)
    })
})
