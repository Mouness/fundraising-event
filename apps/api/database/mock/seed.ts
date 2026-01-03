import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { BRAND_ASSETS, BRAND_COLORS } from './theme';
import { GLOBAL_SETTINGS } from './global';
import { EVENTS } from './events';
import { STAFF_MEMBERS } from './staff';

dotenv.config({ path: join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const main = async () => {
    console.log('🌱 Starting Seed...');

    // 1. Clean Database (Optional: remove if you want to keep data)
    console.log('🧹 Cleaning existing data...');
    await prisma.donation.deleteMany();
    // await (prisma as any)._EventToStaffMember.deleteMany();
    await prisma.staffMember.deleteMany();
    await prisma.configuration.deleteMany();
    await prisma.event.deleteMany();

    // 2. Seed Global Configuration
    console.log('🌍 Seeding Global Configuration...');
    await prisma.configuration.create({
        data: {
            scope: 'GLOBAL',
            entityId: 'GLOBAL',
            ...GLOBAL_SETTINGS
        }
    });

    // 3. Seed Events & Their Configs
    console.log('📅 Seeding Events...');
    const createdEvents: any[] = [];

    for (const evt of EVENTS) {
        // Create Event
        const { config, ...eventData } = evt;
        const createdEvent = await prisma.event.create({
            data: eventData
        });

        createdEvents.push(createdEvent);

        // Create Event-Specific Configuration (Override)
        if (config) {
            await prisma.configuration.create({
                data: {
                    scope: 'EVENT',
                    entityId: createdEvent.id,
                    ...config
                }
            });
        }

        // Add dummy donations
        console.log(`   💰 Adding donations to ${evt.name}...`);
        await prisma.donation.createMany({
            data: [
                {
                    amount: 50,
                    currency: 'CHF',
                    donorName: 'Anonymous',
                    eventId: createdEvent.id,
                    status: 'SUCCEEDED',
                    paymentMethod: 'CASH',
                },
                {
                    amount: 120,
                    currency: 'CHF',
                    donorName: 'Fatima Al-Sayed',
                    eventId: createdEvent.id,
                    status: 'SUCCEEDED',
                    paymentMethod: 'STRIPE',
                },
                {
                    amount: 500,
                    currency: 'CHF',
                    donorName: 'Local Business Inc',
                    eventId: createdEvent.id,
                    status: 'SUCCEEDED',
                    paymentMethod: 'STRIPE',
                }
            ]
        });
    }

    // 4. Seed Staff
    console.log('👥 Seeding Staff...');
    for (const staff of STAFF_MEMBERS) {
        await prisma.staffMember.create({
            data: {
                ...staff,
                // Assign to all events for demo
                events: {
                    connect: createdEvents.map(e => ({ id: e.id }))
                }
            }
        });
    }

    console.log('✅ Seeding completed!');
    console.log('   Events created:', createdEvents.length);
    console.log('   Staff created:', STAFF_MEMBERS.length);
    console.log('   Use PIN 1111, 2222, etc. for Staff login.');
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
