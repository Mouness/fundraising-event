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

        // Generate Smart Mock Data
        console.log(`   💰 Generating smart donations for ${evt.name}...`);

        const DONOR_FIRST_NAMES = ['Ahmed', 'Fatima', 'Mohamed', 'Aisha', 'Ibrahim', 'Sarah', 'Youssef', 'Layla', 'Omar', 'Zainab', 'Ali', 'Mariam', 'Jean', 'Pierre', 'Marie', 'Sophie', 'Thomas', 'Lucas'];
        const DONOR_LAST_NAMES = ['Al-Sayed', 'Benali', 'Dubois', 'Martin', 'Khan', 'Rahman', 'Lopez', 'Silva', 'Muller', 'Weber', 'Hassan', 'Othman'];
        const MESSAGES = [
            'Barak Allah oufikoum pour cette initiative.',
            'Qu\'Allah accepte nos dons.',
            'For the orphans ❤️',
            'Keep up the great work!',
            'Un petit geste pour une grande cause.',
            'Douas pour vous tous.',
            'Ramadan Mubarak!',
            undefined, undefined, undefined // Higher chance of no message
        ];

        const generateRandomDonation = () => {
            const isAnonymous = Math.random() > 0.7;
            const hasMessage = Math.random() > 0.6;
            const amountTiers = [1000, 2000, 5000, 10000, 20000, 50000, 100000]; // in Cents
            const amount = amountTiers[Math.floor(Math.random() * amountTiers.length)];

            // Random date within last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            const statusRoll = Math.random();
            let status = 'SUCCEEDED';
            if (statusRoll > 0.95) status = 'FAILED';
            else if (statusRoll > 0.90) status = 'PENDING';

            return {
                amount,
                currency: 'CHF', // Could vary based on config if needed
                donorName: isAnonymous ? null : `${DONOR_FIRST_NAMES[Math.floor(Math.random() * DONOR_FIRST_NAMES.length)]} ${DONOR_LAST_NAMES[Math.floor(Math.random() * DONOR_LAST_NAMES.length)]}`,
                donorEmail: isAnonymous ? null : `donor${Math.floor(Math.random() * 1000)}@example.com`,
                isAnonymous,
                message: hasMessage ? MESSAGES[Math.floor(Math.random() * MESSAGES.length)] : null,
                eventId: createdEvent.id,
                status,
                paymentMethod: Math.random() > 0.3 ? 'STRIPE' : 'CASH',
                createdAt: date
            };
        };

        const donations = Array.from({ length: Math.floor(Math.random() * 50) + 20 }).map(generateRandomDonation);

        await prisma.donation.createMany({
            data: donations
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
