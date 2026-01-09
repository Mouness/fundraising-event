import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { vi, describe, beforeEach, afterAll, it, expect } from 'vitest';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaHealthIndicator)
      .useValue({
        pingCheck: vi.fn().mockResolvedValue({ database: { status: 'up' } }),
      })
      .overrideProvider(PrismaService)
      .useValue({}) // Dummy
      .overrideProvider(ThrottlerStorageRedisService)
      .useValue({
        getRecord: vi.fn().mockResolvedValue([]),
        increment: vi
          .fn()
          .mockResolvedValue({ totalHits: 1, timeToExpire: 60 }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api'); // Match main.ts
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();
        expect(res.body.info.database).toBeDefined();
        // Heap memory check might vary by environment, just check it exists
        expect(res.body.info.memory_heap).toBeDefined();
      });
  });
});
