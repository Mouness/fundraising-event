import { api } from "@core/lib/api";
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

        } catch (error: unknown) { // Use unknown instead of any
            console.error("Submission failed", error);

            // If it's a network error (no response), queue it
            // If it's a network error (no response), queue it
            const isNetworkError = error instanceof Error && !(error as any).response;
            // Since we know we are using axios (implied by previous context) but code might not explicitly import it here.

            if (isNetworkError) {
                fullDonation.error = error instanceof Error ? error.message : 'Network Error';
                StorageService.saveToQueue(fullDonation);
                return { success: true, offline: true };
            }

            const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed';
            return { success: false, error: errorMsg };
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
                // Removed unused variable if not used, or log it
                console.error("Retry failed for", item.id, error);
            }
        }

        return processed;
    }
};
