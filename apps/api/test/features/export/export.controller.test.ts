import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from '../../../src/features/export/export.controller';
import { ExportService } from '../../../src/features/export/export.service';
import { RolesGuard } from '../../../src/features/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';

describe('ExportController', () => {
    let controller: ExportController;
    let exportService: ExportService;

    const mockExportService = {
        exportReceipts: vi.fn(),
        getReceipt: vi.fn(),
    };

    const mockResponse = {
        set: vi.fn(),
        end: vi.fn(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExportController],
            providers: [
                {
                    provide: ExportService,
                    useValue: mockExportService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ExportController>(ExportController);
        exportService = module.get<ExportService>(ExportService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('downloadAllReceipts', () => {
        it('should call exportService.exportReceipts and return StreamableFile', async () => {
            const mockStream = new StreamableFile(Buffer.from('zip content'));
            mockExportService.exportReceipts.mockResolvedValue(mockStream);

            const result = await controller.downloadAllReceipts(
                mockResponse as unknown as Response,
                'evt_1',
            );

            expect(mockResponse.set).toHaveBeenCalledWith({
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="receipts-evt_1.zip"',
            });
            expect(mockExportService.exportReceipts).toHaveBeenCalledWith('evt_1');
            expect(result).toBe(mockStream);
        });

        it('should use "global" filename if no eventId provided', async () => {
            const mockStream = new StreamableFile(Buffer.from('zip content'));
            mockExportService.exportReceipts.mockResolvedValue(mockStream);

            await controller.downloadAllReceipts(
                mockResponse as unknown as Response,
                undefined,
            );

            expect(mockResponse.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    'Content-Disposition': 'attachment; filename="receipts-global.zip"',
                }),
            );
        });
    });

    describe('downloadSingleReceipt', () => {
        it('should download receipt if found', async () => {
            const mockBuffer = Buffer.from('pdf content');
            mockExportService.getReceipt.mockResolvedValue(mockBuffer);

            await controller.downloadSingleReceipt(
                'don_1',
                mockResponse as unknown as Response,
            );

            expect(mockResponse.set).toHaveBeenCalledWith({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="receipt-don_1.pdf"',
                'Content-Length': mockBuffer.length,
            });
            expect(mockResponse.end).toHaveBeenCalledWith(mockBuffer);
        });

        it('should return 404 if receipt generation fails', async () => {
            mockExportService.getReceipt.mockRejectedValue(new Error('Not found'));

            await controller.downloadSingleReceipt(
                'don_invalid',
                mockResponse as unknown as Response,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith({
                message: 'Receipt not found',
            });
        });
    });
});
