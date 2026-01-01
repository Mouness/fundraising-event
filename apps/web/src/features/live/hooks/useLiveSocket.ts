import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';

export interface DonationEvent {
    amount: number;
    currency: string;
    donorName: string;
    message?: string;
    isAnonymous: boolean;
}

/**
 * Manages the WebSocket connection for real-time donation events on the live screen.
 * Listens for 'donation.created' events and maintains connection status.
 */
export const useLiveSocket = (slug: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<DonationEvent | null>(null);

    useEffect(() => {
        if (!slug) return;

        // Connect to the root namespace (GatewayGateway handles it)
        const socket: Socket = io(API_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            socket.emit('joinEvent', slug);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
        });

        socket.on('donation.created', (data) => {
            console.log('Donation received:', data);
            setLastEvent(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [slug]);

    return { isConnected, lastEvent };
};
