import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventConfigService } from '@/features/event/configuration/event-config.service';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs/promises
vi.mock('fs/promises');
const mockedFs = fs as unknown as { readFile: ReturnType<typeof vi.fn> };

// Mock module for createRequire
vi.mock('module', () => ({
    createRequire: vi.fn(() => ({
        resolve: vi.fn((id: string) => {
            if (id === '@fundraising/white-labeling/css') return '/path/to/default/theme.default.css';
            return id;
        }),
    })),
}));

import { PrismaService } from '@/database/prisma.service';

// Mock Prisma
const mockPrismaService = {
    event: {
        findFirst: vi.fn(),
    },
};

describe('EventConfigService', () => {
    let service: EventConfigService;
    let configService: ConfigService;

    const mockConfigService = {
        get: vi.fn((key: string) => {
            if (key === 'EVENT_CONFIG_PATH') return '/path/to/event-config.json';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventConfigService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<EventConfigService>(EventConfigService);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getThemeVariable', () => {
        it('should return variable from custom theme if it exists', async () => {
            // Mock custom theme file existing and containing the variable
            mockedFs.readFile.mockImplementation(async (filePath: string) => {
                if (filePath === '/path/to/theme.css') {
                    return ':root { --primary: blue; }';
                }
                throw new Error('File not found');
            });

            const result = await service.getThemeVariable('--primary');
            expect(result).toBe('blue');
        });

        it('should fallback to default theme if custom file misses variable', async () => {
            // Mock custom theme exists but variable matching fails, default matches
            mockedFs.readFile.mockImplementation(async (filePath: string) => {
                if (filePath === '/path/to/theme.css') {
                    return ':root { --other: red; }'; // no primary
                }
                if (filePath === '/path/to/default/theme.default.css') {
                    return ':root { --primary: #ec4899; }';
                }
                throw new Error('File not found');
            });

            const result = await service.getThemeVariable('--primary');
            expect(result).toBe('#ec4899');
        });

        it('should fallback to default theme if custom file does not exist', async () => {
            // Mock custom theme missing, default matches
            mockedFs.readFile.mockImplementation(async (filePath: string) => {
                if (filePath === '/path/to/theme.css') {
                    throw new Error('ENOENT');
                }
                if (filePath === '/path/to/default/theme.default.css') {
                    return ':root { --primary: #ec4899; }';
                }
                throw new Error('File not found');
            });

            const result = await service.getThemeVariable('--primary');
            expect(result).toBe('#ec4899');
        });

        it('should return provided fallback if variable not found anywhere', async () => {
            mockedFs.readFile.mockRejectedValue(new Error('File not found')); // Fail all reads

            const result = await service.getThemeVariable('--primary', 'fallback-color');
            expect(result).toBe('fallback-color');
        });
    });
});
