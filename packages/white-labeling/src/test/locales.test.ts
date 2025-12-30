import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadLocales } from '../locales';
import { WhiteLabelStore } from '../store';
import enDefault from '../locales/en.default.json';

describe('loadLocales', () => {
    beforeEach(() => {
        // Reset store before each test
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'Default',
            goalAmount: 0,
            themeConfig: {}
        });
    });

    it('should return default locales if no DB config', () => {
        const result = loadLocales();
        expect(result.en).toEqual(enDefault);
        expect(result.fr).toBeDefined();
    });

    it('should merge database locales', () => {
        const customTitle = "Custom Donation Title";
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'Custom',
            goalAmount: 100,
            themeConfig: {
                locales: {
                    en: {
                        donation: {
                            title: customTitle
                        }
                    }
                }
            }
        });

        const result = loadLocales();
        expect(result.en.donation.title).toBe(customTitle);
        // Should preserve other keys
        expect(result.en.donation.submit).toBeDefined();
    });
});
