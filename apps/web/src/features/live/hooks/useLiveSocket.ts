import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';

export function useLiveSocket(slug: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<any>(null);

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

        socket.on('donation', (data) => {
            console.log('Donation received:', data);
            setLastEvent(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [slug]);

    return { isConnected, lastEvent };
}
