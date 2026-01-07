import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timeAgo } from '@/core/lib/date';

describe('date lib', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return minutes_ago for 5 minutes ago', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        // Global mock returns "key count"
        expect(timeAgo(fiveMinutesAgo)).toBe('date.minutes_ago 5');
    });

    it('should return hours_ago for 2 hours ago', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(twoHoursAgo)).toBe('date.hours_ago 2');
    });

    it('should return days_ago for 3 days ago', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        expect(timeAgo(threeDaysAgo)).toBe('date.days_ago 3');
    });

    it('should return just now for dates in the future or very recent', () => {
        expect(timeAgo(new Date(Date.now() + 1000).toISOString())).toBe('date.just_now');
    });
});
