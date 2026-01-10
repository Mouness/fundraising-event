import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { PrismaService } from '@/database/prisma.service'
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { vi, describe, beforeEach, afterAll, it, expect } from 'vitest'

// Mock white-labeling package to avoid FS/ESM issues during E2E
vi.mock('@fundraising/white-labeling', () => {
    return {
        loadConfigs: () => ({
            id: 'e2e-config',
            theme: { primaryColor: 'test-color' },
            communication: {},
        }),
        deepMerge: (a: any, b: any) => ({ ...a, ...b }),
        defaultConfig: { id: 'default' },
        EventConfig: {}, // Class/interface mock
    }
})

describe('EventController (e2e)', () => {
    let app: INestApplication

    const mockEvent = {
        id: 'evt_1',
        slug: 'gala-2024',
        name: 'Gala 2024',
        goalAmount: 1000,
        themeConfig: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                event: {
                    findMany: vi.fn().mockResolvedValue([mockEvent]),
                    findFirst: vi.fn().mockResolvedValue(mockEvent),
                    create: vi.fn().mockResolvedValue(mockEvent),
                },
                donation: {
                    groupBy: vi.fn().mockResolvedValue([]),
                    aggregate: vi
                        .fn()
                        .mockResolvedValue({ _sum: { amount: null }, _count: { id: 0 } }),
                    findMany: vi.fn().mockResolvedValue([]),
                },
                staffMember: {
                    findUnique: vi.fn(),
                },
            })
            .overrideProvider(WhiteLabelingService)
            .useValue({
                getEventSettings: vi.fn().mockResolvedValue({
                    id: 'mock-e2e',
                    content: { title: 'Mock Event' },
                    theme: { primaryColor: 'blue' },
                }),
            })
            .overrideProvider(ThrottlerStorageRedisService)
            .useValue({
                getRecord: vi.fn().mockResolvedValue([]),
                increment: vi.fn().mockResolvedValue({ totalHits: 1, timeToExpire: 60 }),
            })
            .compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    it('/events/public (GET)', () => {
        return request(app.getHttpServer())
            .get('/events/public')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveLength(1)
                expect(res.body[0].slug).toEqual('gala-2024')
            })
    })

    it('/events/:slug (GET)', () => {
        return request(app.getHttpServer())
            .get('/events/gala-2024')
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Gala 2024')
            })
    })

    // Test Protected Routes (Require JWT)
    // For this we need to sign a token first or mock the Guard.
    // Mocking the guard is often easier for controller e2e, but for full app e2e logging in is better.
    // We can mock JwtService or just bypass AuthGuard using .overrideGuard().

    // Let's rely on 401 check for now to prove it's protected
    it('/events (POST) - Fail without JWT', () => {
        return request(app.getHttpServer())
            .post('/events')
            .send({ name: 'New', slug: 'new', goalAmount: 500 })
            .expect(401)
    })
})
