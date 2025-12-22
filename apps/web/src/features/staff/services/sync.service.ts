import { StorageService } from "./storage.service";
import type { PendingDonation } from "../types";

export const SyncService = {
    async submitDonation(donation: Omit<PendingDonation, 'status' | 'error' | 'id' | 'createdAt'>): Promise<{ success: boolean; offline?: boolean }> {
        const fullDonation: PendingDonation = {
            ...donation,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            status: 'pending'
        };

        // If offline immediately, save and return
        if (!navigator.onLine) {
            StorageService.saveToQueue(fullDonation);
            return { success: true, offline: true };
        }

        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: fullDonation.amount,
                    type: fullDonation.type,
                    donorName: fullDonation.name,
                    donorEmail: fullDonation.email,
                    isOfflineCollected: true,
                    collectedAt: new Date(fullDonation.createdAt).toISOString()
                })
            });

            if (!response.ok) throw new Error('API Error');

            // Success - no need to store, or store as synced log if desired.
            // For now, we don't store synced items locally to keep generic clean.
            return { success: true };

        } catch (error) {
            console.error("Submission failed, queueing", error);
            fullDonation.error = error instanceof Error ? error.message : 'Unknown error';
            StorageService.saveToQueue(fullDonation);
            return { success: true, offline: true }; // Treat as success (queued)
        }
    },

    async processQueue(): Promise<number> {
        if (!navigator.onLine) return 0;

        const queue = StorageService.getQueue().filter(d => d.status === 'pending');
        let processed = 0;

        for (const item of queue) {
            try {
                const response = await fetch('/api/donations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: item.amount,
                        type: item.type,
                        donorName: item.name,
                        donorEmail: item.email,
                        isOfflineCollected: true,
                        collectedAt: new Date(item.createdAt).toISOString()
                    })
                });

                if (response.ok) {
                    StorageService.removeFromQueue(item.id);
                    processed++;
                } else {
                    StorageService.updateStatus(item.id, 'failed', 'API rejected');
                }
            } catch (error) {
                // Network error, keep in queue
                console.error("Retry failed for", item.id);
            }
        }

        return processed;
    }
};
