import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import { join } from 'path'
import { ISLAMIC_SCENARIO } from './scenario/islamic'
import { GREEN_SCENARIO } from './scenario/green'
import { WhiteLabelingMapper } from '../../src/features/white-labeling/white-labeling.mapper'

dotenv.config({ path: join(__dirname, '../../.env') })

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const main = async () => {
    // 1. Parse Args
    const args = process.argv.slice(2)
    const scenarioArg = args.find((arg) => arg.startsWith('--scenario='))
    const scenarioName = scenarioArg ? scenarioArg.split('=')[1] : 'islamic' // Default to islamic

    console.log(`🌱 Starting Seed with scenario: ${scenarioName.toUpperCase()}...`)

    let scenarioData: any

    if (scenarioName === 'green') {
        scenarioData = GREEN_SCENARIO
    } else {
        scenarioData = ISLAMIC_SCENARIO
    }

    // 2. Clean Database
    console.log('🧹 Cleaning existing data...')
    try {
        await prisma.donation.deleteMany()
        // await (prisma as any)._EventToStaffMember.deleteMany(); // If applicable
        await prisma.staffMember.deleteMany()
        // Important: Delete Configuration LAST if it has dependencies (but here it's usually mostly independent or linked to event)
        // Actually, check dependencies. Configuration might be linked to Event if we had foreign keys, but typical schema uses entityId string.
        await prisma.configuration.deleteMany()
        await prisma.event.deleteMany()
    } catch (error) {
        console.warn('⚠️  Cleanup warning (might be empty db):', error)
    }

    // 3. Seed Global Configuration
    console.log('🌍 Seeding Global Configuration...')
    await prisma.configuration.create({
        data: {
            scope: 'GLOBAL',
            entityId: 'GLOBAL',
            ...(WhiteLabelingMapper.toDbPayload(scenarioData.globalSettings) as any),
        },
    })

    // 4. Seed Staff
    console.log('👥 Seeding Staff...')
    const createdStaffMembers: any[] = []

    // Fallback to empty if not defined
    const staffList = (scenarioData as any).staff || []

    for (const staff of staffList) {
        const createdStaff = await prisma.staffMember.create({
            data: staff,
        })
        createdStaffMembers.push(createdStaff)
    }

    // 5. Seed Events & Donations
    console.log('📅 Seeding Events & Donations...')
    const createdEvents: any[] = []

    const donorFirstNames = (scenarioData as any).donors?.firstNames || ['John', 'Jane']
    const donorLastNames = (scenarioData as any).donors?.lastNames || ['Doe']

    // Combine generic messages with scenario specific ones
    const MESSAGES = (scenarioData as any).messages || [
        ...scenarioData.donationKeywords.map((k: string) => `Message containing ${k}...`),
        'Great cause!',
        'Happy to help.',
        'Keep going!',
        ...scenarioData.donationKeywords,
    ]

    for (const evt of scenarioData.events) {
        // Create Event
        const { config, ...eventData } = evt
        const createdEvent = await prisma.event.create({
            data: {
                ...eventData,
                // Connect all staff to this event
                staffMembers: {
                    connect: createdStaffMembers.map((s) => ({ id: s.id })),
                },
            },
        })
        createdEvents.push(createdEvent)

        // Create Event-Specific Configuration
        if (config) {
            await prisma.configuration.create({
                data: {
                    scope: 'EVENT',
                    entityId: createdEvent.id,
                    ...(WhiteLabelingMapper.toDbPayload(config) as any),
                },
            })
        }

        // Generate Smart Mock Data
        console.log(`   💰 Generating smart donations for ${evt.name}...`)

        const generateRandomDonation = (index: number) => {
            const isAnonymous = Math.random() > 0.75 // 25% anonymous
            const hasMessage = Math.random() > 0.4
            // Weighted amounts: more small/medium, fewer large
            const amountTiers = [
                ...Array(10).fill(1000), // 10
                ...Array(8).fill(2500), // 25
                ...Array(6).fill(5000), // 50
                ...Array(4).fill(10000), // 100
                ...Array(2).fill(25000), // 250
                ...Array(2).fill(50000), // 500
                100000,
                250000,
                1000000, // High rollers
            ]
            const amount = amountTiers[Math.floor(Math.random() * amountTiers.length)]

            // Time distribution: Weighted towards recent dates
            const date = new Date()
            const daysBack = Math.floor(Math.pow(Math.random(), 3) * 90) // Skews towards 0 (recent)
            date.setDate(date.getDate() - daysBack)
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

            const statusRoll = Math.random()
            let status = 'COMPLETED'
            if (statusRoll > 0.96) status = 'FAILED'
            else if (statusRoll > 0.93) status = 'PENDING'
            else if (statusRoll > 0.91) status = 'REFUNDED'
            else if (statusRoll > 0.9) status = 'CANCELLED'

            const paymentMethods = ['STRIPE', 'STRIPE', 'STRIPE', 'CASH', 'CASH', 'CHECK', 'PLEDGE']
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

            let staffMemberId = undefined
            if (
                ['CASH', 'CHECK', 'PLEDGE'].includes(paymentMethod) &&
                createdStaffMembers.length > 0
            ) {
                staffMemberId =
                    createdStaffMembers[Math.floor(Math.random() * createdStaffMembers.length)].id
            }

            const rawMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
            const message = hasMessage ? rawMessage : null

            // Determine currency: Event override > Global > Default EUR
            const currency =
                (config as any)?.donation?.payment?.currency ||
                (scenarioData.globalSettings.donation?.payment as any)?.currency ||
                'EUR'

            return {
                amount,
                currency,
                donorName: isAnonymous
                    ? null
                    : `${donorFirstNames[Math.floor(Math.random() * donorFirstNames.length)]} ${donorLastNames[Math.floor(Math.random() * donorLastNames.length)]}`,
                donorEmail: isAnonymous
                    ? null
                    : `donor${Math.floor(Math.random() * 5000)}@example.com`,
                isAnonymous,
                message,
                eventId: createdEvent.id,
                status,
                paymentMethod,
                transactionId: require('crypto').randomUUID(),
                staffMemberId,
                createdAt: date,
            }
        }

        // Generate between 40 and 150 donations per event for volume
        const donationCount = Math.floor(Math.random() * 110) + 40
        const donations = Array.from({ length: donationCount }).map((_, i) =>
            generateRandomDonation(i),
        )

        await prisma.donation.createMany({
            data: donations,
        })
    }

    console.log('✅ Seeding completed!')
    console.log(`   Scenario: ${scenarioName}`)
    console.log('   Events created:', createdEvents.length)
    console.log('   Staff created:', createdStaffMembers.length)
    console.log('   Use PIN numbers defined in scenario.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
