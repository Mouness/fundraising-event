import { describe, it, expect } from 'vitest';
import { mergeLocales, defaultLocales } from '../locales';

describe('mergeLocales', () => {
    it('should return default locales if no custom translations provided', () => {
        const result = mergeLocales('en');
        expect(result).toEqual(defaultLocales.en);
    });

    it('should merge custom translations', () => {
        const custom = {
            donation: {
                title: "Custom Title"
            }
        };
        const result = mergeLocales('en', custom);
        expect(result.donation.title).toBe("Custom Title");
        expect(result.donation.submit).toBe(defaultLocales.en.donation.submit);
    });
});
