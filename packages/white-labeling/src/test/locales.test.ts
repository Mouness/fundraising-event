import { describe, it, expect, beforeEach } from 'vitest';
import { loadLocales } from '../locales';
import { WhiteLabelStore } from '../store';
import enDefault from '../locales/en.default.json';

describe('loadLocales', () => {
    beforeEach(() => {
        // Reset store before each test
        WhiteLabelStore.getInstance().setEventConfig({
            id: 'default',
            content: { goalAmount: 0 },
            locales: {}
        } as any);
    });

    it('should return default locales if no DB config', () => {
        const result = loadLocales();
        expect(result.en).toEqual(enDefault);
        expect(result.fr).toBeDefined();
    });

    it('should merge database locales', () => {
        const customTitle = "Custom Donation Title";
        WhiteLabelStore.getInstance().setEventConfig({
            id: 'custom',
            content: { goalAmount: 100 },
            locales: {
                overrides: {
                    en: {
                        donation: {
                            title: customTitle
                        }
                    }
                }
            }
        } as any);

        const result = loadLocales();
        expect(result.en.donation.title).toBe(customTitle);
        // Should preserve other keys
        expect(result.en.donation.submit).toBeDefined();
    });

    it('should handle global flat overrides', () => {
        WhiteLabelStore.getInstance().setGlobalConfig({
            id: 'global',
            content: { title: 'G' },
            locales: {
                overrides: {
                    'en.donation.submit': 'Give Now'
                }
            }
        } as any);

        const result = loadLocales();
        expect(result.en.donation.submit).toBe('Give Now');
    });
});
