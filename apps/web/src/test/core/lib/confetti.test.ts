import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireConfetti, fireGoalCelebration } from '@/core/lib/confetti';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('confetti lib', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should fire confetti multiple times', () => {
        fireConfetti();

        // Fast-forward 100ms
        vi.advanceTimersByTime(100);
        expect(confetti).toHaveBeenCalled();

        // Fast-forward to end (3000ms total)
        vi.advanceTimersByTime(3000);
        const callCount = vi.mocked(confetti).mock.calls.length;

        // Advance more - should not call anymore
        vi.advanceTimersByTime(1000);
        expect(vi.mocked(confetti).mock.calls.length).toBe(callCount);
    });

    it('should fire goal celebration', () => {
        fireGoalCelebration();

        vi.advanceTimersByTime(250);
        expect(confetti).toHaveBeenCalled();

        vi.advanceTimersByTime(15000);
        const callCount = vi.mocked(confetti).mock.calls.length;

        vi.advanceTimersByTime(1000);
        expect(vi.mocked(confetti).mock.calls.length).toBe(callCount);
    });
});
