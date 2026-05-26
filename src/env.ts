import 'dotenv/config'

import { z } from 'zod'

export const envSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('production'),
    DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
