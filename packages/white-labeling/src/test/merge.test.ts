import { describe, it, expect } from 'vitest';
import { deepMerge } from '../utils/merge';

describe('deepMerge', () => {
    it('should return target if source is null or undefined', () => {
        const target = { a: 1 };
        expect(deepMerge(target, null as any)).toEqual(target);
        expect(deepMerge(target, undefined as any)).toEqual(target);
    });

    it('should merge simple properties', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };
        expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
        const target = { a: { x: 1, y: 2 } };
        const source = { a: { y: 3, z: 4 } };
        expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    it('should replace arrays (config behavior)', () => {
        const target = { a: [1, 2] };
        const source = { a: [3, 4] };
        expect(deepMerge(target, source)).toEqual({ a: [3, 4] });
    });

    it('should handle type mismatches gracefully by preferring source', () => {
        const target = { a: { x: 1 } };
        const source = { a: 5 };
        // @ts-expect-error - Testing type mismatch
        expect(deepMerge(target, source)).toEqual({ a: 5 });
    });
});
