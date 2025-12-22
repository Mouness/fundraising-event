import type { PendingDonation } from "../types";

const STORAGE_KEY = "staff_donation_queue";

export const StorageService = {
    getQueue: (): PendingDonation[] => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to parse donation queue", e);
            return [];
        }
    },

    saveToQueue: (donation: PendingDonation): void => {
        const queue = StorageService.getQueue();
        queue.push(donation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    },

    removeFromQueue: (id: string): void => {
        const queue = StorageService.getQueue().filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    },

    updateStatus: (id: string, status: PendingDonation['status'], error?: string): void => {
        const queue = StorageService.getQueue().map(d => {
            if (d.id === id) {
                return { ...d, status, error };
            }
            return d;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    },

    clearQueue: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
