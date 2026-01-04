import { Test, TestingModule } from '@nestjs/testing';
import { PayPalService } from '@/features/donation/services/paypal.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('PayPalService', () => {
    let service: PayPalService;
    let httpService: HttpService;

    const mockHttpService = {
        post: vi.fn(),
        get: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayPalService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn((key) => {
                            if (key === 'PAYPAL_CLIENT_ID') return 'client_id';
                            if (key === 'PAYPAL_CLIENT_SECRET') return 'client_secret';
                            if (key === 'PAYPAL_WEBHOOK_ID') return 'webhook_id';
                            return null;
                        }),
                    },
                },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile();

        service = module.get<PayPalService>(PayPalService);
        httpService = module.get<HttpService>(HttpService);
        vi.clearAllMocks();
    });

    describe('createPaymentIntent', () => {
        it('should create order and return id', async () => {
            // Mock Auth Token Call
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { access_token: 'token' } }),
            );
            // Mock Order Create Call
            mockHttpService.post.mockReturnValueOnce(of({ data: { id: 'order_1' } }));

            const result = await service.createPaymentIntent(1000, 'USD');

            expect(result).toEqual({ id: 'order_1', clientSecret: 'order_1' });
            expect(mockHttpService.post).toHaveBeenCalledTimes(2);
        });
    });

    describe('constructEventFromPayload', () => {
        it('should verify signature via API', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { access_token: 'token' } }),
            );
            // Verify
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { verification_status: 'SUCCESS' } }),
            );

            const payload = Buffer.from(JSON.stringify({ event_type: 'TEST' }));
            const result = await service.constructEventFromPayload({}, payload);

            expect(result).toEqual({ event_type: 'TEST' });
        });

        it('should throw if verification fails', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { access_token: 'token' } }),
            );
            // Verify Fail
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { verification_status: 'FAILURE' } }),
            );

            const payload = Buffer.from(JSON.stringify({}));
            await expect(
                service.constructEventFromPayload({}, payload),
            ).rejects.toThrow('Invalid Signature');
        });
    });
});
