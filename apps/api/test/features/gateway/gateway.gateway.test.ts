import { Test, TestingModule } from '@nestjs/testing';
import { GatewayGateway } from '@/features/gateway/gateway.gateway';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServer = {
  emit: vi.fn(),
};

const mockClient = {
  id: 'client-1',
  join: vi.fn(),
};

describe('GatewayGateway', () => {
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayGateway],
    }).compile();

    gateway = module.get<GatewayGateway>(GatewayGateway);
    gateway.server = mockServer as any;
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinEvent', () => {
    it('should join client to room', () => {
      gateway.handleJoinEvent('evt_1', mockClient as any);
      expect(mockClient.join).toHaveBeenCalledWith('evt_1');
    });
  });

  describe('emitDonation', () => {
    it('should emit broadcast event', () => {
      const payload = {
        amount: 100,
        currency: 'usd',
        donorName: 'Test',
        isAnonymous: false,
      };
      gateway.emitDonation(payload);
      expect(mockServer.emit).toHaveBeenCalledWith('donation.created', payload);
    });
  });
});
