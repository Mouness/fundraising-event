import { Test, TestingModule } from '@nestjs/testing';
import { EventConfigService } from '@/features/event/configuration/event-config.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../src/database/prisma.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';

// Mock fs
vi.mock('fs/promises');

const mockConfigService = {
    get: vi.fn(),
};

const mockPrismaService = {
    event: {
        findFirst: vi.fn(),
    },
};

describe('EventConfigService', () => {
    let service: EventConfigService;

    beforeEach(async () => {
        console.log('PrismaService token:', PrismaService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventConfigService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<EventConfigService>(EventConfigService);
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should load config and merge with DB', async () => {
            // Mock DB
            mockPrismaService.event.findFirst.mockResolvedValue({
                name: 'DB Event',
                goalAmount: 5000,
                themeConfig: {
                    content: { title: 'Overridden Title' }
                }
            });

            // Mock File read failure (clean slate)
            (fs.readFile as any).mockRejectedValue(new Error('No file'));

            await service.onModuleInit();

            const config = service.getConfig();
            expect(config.content.goalAmount).toBe(5000);
            expect(config.content.title).toBe('DB Event');
            // Check if themeConfig merged. Wait, the code maps `title` from name, 
            // AND merges `themeConfig` from DB.
            // If DB `themeConfig` overrides title, it should win or be merged?
            // Code does: 
            // 1. defaults
            // 2. file
            // 3. DB themeConfig
            // 4. DB explicit mapping (name, goal) -> LAST wins!

            // So DB explicit mapping: title = event.name ('DB Event')
            // DB themeConfig: title = 'Overridden Title' (if merged earlier)
            // Code sequence:
            // final = merge(final, event.themeConfig)
            // final = merge(final, dbConfig) where dbConfig has event.name
            // So event.name wins.
        });
    });
});
