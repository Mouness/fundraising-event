import { api } from "@/lib/api";
import { StorageService } from "./storage.service";
import type { PendingDonation } from "../types";

export const SyncService = {
    async submitDonation(donation: Omit<PendingDonation, 'status' | 'error' | 'id' | 'createdAt'>, eventId: string): Promise<{ success: boolean; offline?: boolean; error?: string }> {
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
            await api.post('/donations', {
                amount: fullDonation.amount,
                type: fullDonation.type,
                donorName: fullDonation.name,
                donorEmail: fullDonation.email,
                isOfflineCollected: true,
                collectedAt: new Date(fullDonation.createdAt).toISOString(),
                eventId
            });

            // Success
            return { success: true };

        } catch (error: any) {
            console.error("Submission failed", error);

            // If it's a network error (no response), queue it
            if (!error.response) {
                fullDonation.error = error instanceof Error ? error.message : 'Network Error';
                StorageService.saveToQueue(fullDonation);
                return { success: true, offline: true };
            }

            // If it's a server error (400, 500), return failure
            return { success: false, error: error.response?.data?.message || 'Submission failed' };
        }
    },

    async processQueue(): Promise<number> {
        if (!navigator.onLine) return 0;

        const queue = StorageService.getQueue().filter(d => d.status === 'pending');
        let processed = 0;

        for (const item of queue) {
            try {
                await api.post('/donations', {
                    amount: item.amount,
                    type: item.type,
                    donorName: item.name,
                    donorEmail: item.email,
                    isOfflineCollected: true,
                    collectedAt: new Date(item.createdAt).toISOString()
                });

                StorageService.removeFromQueue(item.id);
                processed++;
            } catch (error) {
                // Determine if retryable? For now, if API fails, mark failed or keep pending?
                // If it's a network error (axios), we might want to keep it.
                // If 400/500, maybe mark failed.
                // Simplified: Keep pending on error, unless we detect strict failure.
                // Assuming keep pending for retry.
                console.error("Retry failed for", item.id);
                // Optional: Increment retry count or mark failed after N tries.
            }
        }

        return processed;
    }
};
