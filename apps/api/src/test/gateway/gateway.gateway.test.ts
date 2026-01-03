import { Test, TestingModule } from '@nestjs/testing';
import { GatewayGateway } from '@/features/gateway/gateway.gateway';
import { EventsService } from '@/features/events/events.service';
import { Socket } from 'socket.io';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('GatewayGateway', () => {
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayGateway],
    }).compile();

    gateway = module.get<GatewayGateway>(GatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log connection', () => {
      const client = { id: 'client-1' } as Socket;
      const consoleSpy = vi.spyOn(console, 'log');
      gateway.handleConnection(client);
      expect(consoleSpy).toHaveBeenCalledWith('Client connected: client-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection', () => {
      const client = { id: 'client-1' } as Socket;
      const consoleSpy = vi.spyOn(console, 'log');
      gateway.handleDisconnect(client);
      expect(consoleSpy).toHaveBeenCalledWith('Client disconnected: client-1');
    });
  });

  describe('handleJoinEvent', () => {
    it('should join the room and return status', () => {
      const client = {
        id: 'client-1',
        join: vi.fn(),
      } as unknown as Socket;
      const eventId = 'evt_1';

      const result = gateway.handleJoinEvent(eventId, client);

      expect(client.join).toHaveBeenCalledWith(eventId);
      expect(result).toEqual({ event: 'joined', eventId });
    });
  });
});
