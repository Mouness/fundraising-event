/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadTheme } from '../theme';
import { WhiteLabelStore } from '../store';

describe('loadTheme', () => {
    beforeEach(() => {
        WhiteLabelStore.getInstance().setDbConfig({} as any);
    });

    it('should return empty object if no db config', () => {
        const theme = loadTheme();
        expect(theme).toEqual({});
    });

    it('should return db variables', () => {
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'test',
            goalAmount: 100,
            themeConfig: {
                variables: {
                    '--primary': 'red'
                }
            }
        });

        const theme = loadTheme();
        expect(theme['--primary']).toBe('red');
    });

    it('should apply variables to document if requested', () => {
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'test',
            goalAmount: 100,
            themeConfig: {
                variables: {
                    '--test-var': 'blue'
                }
            }
        });

        loadTheme(true);
        expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('blue');
    });
});
