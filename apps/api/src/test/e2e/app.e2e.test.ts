import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { vi, describe, beforeEach, afterAll, it, expect } from 'vitest';

vi.mock('@fundraising/white-labeling', async () => ({
  loadConfigs: () => ({ content: { title: 'Default' }, theme: {}, communication: {} }),
  deepMerge: (a: any, b: any) => ({ ...a, ...b }),
  defaultConfig: { id: 'default' },
  EventConfig: {}
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: vi.fn(),
        onModuleInit: vi.fn(),
        event: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
