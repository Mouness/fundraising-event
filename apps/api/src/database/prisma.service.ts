import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = `${process.env.DATABASE_URL}`
        const pool = new Pool({ connectionString })
        const adapter = new PrismaPg(pool)

        super({
            adapter,
            log: ['warn', 'error'],
        })
    }

    async onModuleInit() {
        // With adapter, explicit connect is sometimes not needed or handled differently, but keeping it is safe.
        // However, PrismaClient with adapter might behave differently.
        // Let's keep strict connect for now.
        await this.$connect()
    }
}
