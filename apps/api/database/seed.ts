import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('Seeding database...');

    const event = await prisma.event.upsert({
        where: { slug: 'demo-gala-2024' },
        update: {},
        create: {
            slug: 'demo-gala-2024',
            name: 'Demo Charity Gala 2024',
            goalAmount: 50000,
            status: 'active',
            date: new Date('2024-12-25'),
            description: 'A demo event seeded for testing.',
            themeConfig: {
                primary: '#ec4899',
                secondary: '#8b5cf6',
            },
        } as any,
    });

    console.log({ event });

    // Add some dummy donations
    await prisma.donation.createMany({
        data: [
            {
                amount: 100,
                currency: 'EUR',
                donorName: 'John Doe',
                eventId: event.id,
                status: 'SUCCEEDED',
                paymentMethod: 'CASH',
            },
            {
                amount: 500,
                currency: 'EUR',
                donorName: 'Jane Smith',
                eventId: event.id,
                status: 'SUCCEEDED',
                paymentMethod: 'STRIPE',
            },
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
