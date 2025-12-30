import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DonationEventPayload } from './interfaces/donation-event.payload';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinEvent')
  handleJoinEvent(
    @MessageBody() eventId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(eventId);
    console.log(`Client ${client.id} joined event: ${eventId}`);
    return { event: 'joined', eventId };
  }

  emitDonation(donation: DonationEventPayload) {
    // Broadcast to everyone for now, or specific room if we had eventId
    this.server.emit('donation.created', donation);
  }
}
