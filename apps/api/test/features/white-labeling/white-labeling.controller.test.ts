import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelingController } from '../../../src/features/white-labeling/white-labeling.controller';
import { WhiteLabelingService } from '../../../src/features/white-labeling/white-labeling.service';
import { NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../src/features/auth/guards/roles.guard';

describe('WhiteLabelingController', () => {
    let controller: WhiteLabelingController;
    let service: WhiteLabelingService;

    const mockService = {
        getGlobalSettings: vi.fn(),
        updateGlobalSettings: vi.fn(),
        getEventSettings: vi.fn(),
        updateEventSettings: vi.fn(),
        resetEventSettings: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WhiteLabelingController],
            providers: [
                {
                    provide: WhiteLabelingService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<WhiteLabelingController>(WhiteLabelingController);
        service = module.get<WhiteLabelingService>(WhiteLabelingService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getEventSettings', () => {
        it('should return settings if found', async () => {
            const mockSettings = { id: 'evt_1' };
            mockService.getEventSettings.mockResolvedValue(mockSettings);

            const result = await controller.getEventSettings('slug');
            expect(result).toEqual(mockSettings);
        });

        it('should throw NotFoundException if not found', async () => {
            mockService.getEventSettings.mockResolvedValue(null);

            await expect(controller.getEventSettings('slug')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getGlobalSettings', () => {
        it('should return global settings', async () => {
            const mockSettings = { id: 'global' };
            mockService.getGlobalSettings.mockResolvedValue(mockSettings);

            expect(await controller.getGlobalSettings()).toEqual(mockSettings);
        });
    });

    describe('updateGlobalSettings', () => {
        it('should call service', async () => {
            const dto = { content: { title: 'Updated' } };
            await controller.updateGlobalSettings(dto);
            expect(mockService.updateGlobalSettings).toHaveBeenCalledWith(dto);
        });
    });

    describe('updateEventSettings', () => {
        it('should call service', async () => {
            const dto = { content: { title: 'Updated' } };
            await controller.updateEventSettings('evt_1', dto);
            expect(mockService.updateEventSettings).toHaveBeenCalledWith('evt_1', dto);
        });
    });

    describe('resetEventSettings', () => {
        it('should call service', async () => {
            await controller.resetEventSettings('evt_1');
            expect(mockService.resetEventSettings).toHaveBeenCalledWith('evt_1');
        });
    });
});
