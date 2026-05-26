import { uploadImage } from '@/app/functions/upload-image'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { isRight, unwrapEither } from '../../../app/shared/either'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    server.post(
        '/uploads',
        {
            schema: {
                summary: 'Upload an image',
                consumes: ['multipart/form-data'],
                response: {
                    201: z.void(),
                    400: z.object({ message: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const uploadedFile = await request.file({
                limits: {
                    fileSize: 1024 * 1024 * 2, // 2mb
                },
            })

            if (!uploadedFile) {
                return reply.status(400).send({ message: 'No file uploaded.' })
            }

            const result = await uploadImage({
                contentStream: uploadedFile.file,
                contentType: uploadedFile.mimetype,
                fileName: uploadedFile.filename,
            })

            if (isRight(result)) {
                console.log(unwrapEither(result))
                return reply.status(201).send()
            }

            const error = unwrapEither(result)

            switch (error.constructor.name) {
                case 'InvalidFileFormat':
                    return reply.status(400).send({ message: error.message })
            }
        }
    )
}
