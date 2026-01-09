import { describe, it, expect } from 'vitest';
import { getVariableType } from '../../../../features/admin/utils/theme-utils';

describe('theme-utils', () => {
    describe('getVariableType', () => {
        it('returns "text" if key is undefined', () => {
            expect(getVariableType(undefined)).toBe('text');
        });

        it('returns "text" if key includes "font-size"', () => {
            expect(getVariableType('font-size-base')).toBe('text');
            expect(getVariableType('--font-size-lg')).toBe('text');
        });

        it('returns "radius" if key includes "radius"', () => {
            expect(getVariableType('border-radius')).toBe('radius');
            expect(getVariableType('--radius-sm')).toBe('radius');
        });

        it('returns "color" if key contains color keywords', () => {
            expect(getVariableType('primary-color')).toBe('color');
            expect(getVariableType('background-color')).toBe('color');
            expect(getVariableType('text-foreground')).toBe('color');
            expect(getVariableType('border-color')).toBe('color');
            expect(getVariableType('ring-offset')).toBe('color');
            expect(getVariableType('box-shadow')).toBe('color');
            expect(getVariableType('stroke-width')).toBe('color'); // "stroke" matches
            expect(getVariableType('fill-opacity')).toBe('color'); // "fill" matches
        });

        it('returns "color" if value looks like a color', () => {
            expect(getVariableType('some-var', '#ffffff')).toBe('color');
            expect(getVariableType('some-var', 'rgb(0,0,0)')).toBe('color');
            expect(getVariableType('some-var', 'hsl(0,0%,0%)')).toBe('color');
        });

        it('returns "none" for other properties', () => {
            expect(getVariableType('padding')).toBe('none');
            expect(getVariableType('margin-top')).toBe('none');
            expect(getVariableType('width')).toBe('none');
            expect(getVariableType('height')).toBe('none');
            expect(getVariableType('z-index')).toBe('none');
        });
    });
});
