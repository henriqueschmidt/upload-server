import { env } from '@/env'
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from './schema'

const connectionString = env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
}

export const pg = postgres(connectionString)
export const db = drizzle(pg, { schema })
