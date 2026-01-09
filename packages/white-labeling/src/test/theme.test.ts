/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { loadTheme } from '../theme';
import { WhiteLabelStore } from '../store';

describe('loadTheme', () => {
    beforeEach(() => {
        WhiteLabelStore.getInstance().setEventConfig({} as any);
    });

    it('should return empty object if no db config', () => {
        const theme = loadTheme();
        expect(theme).toEqual({});
    });

    it('should return db variables', () => {
        WhiteLabelStore.getInstance().setEventConfig({
            id: 'test',
            content: { goalAmount: 100 },
            theme: {
                variables: {
                    '--primary': 'red'
                }
            }
        } as any);

        const theme = loadTheme();
        expect(theme['--primary']).toBe('red');
    });

    it('should apply variables to document if requested', () => {
        WhiteLabelStore.getInstance().setEventConfig({
            id: 'test',
            content: { goalAmount: 100 },
            theme: {
                variables: {
                    '--test-var': 'blue'
                }
            }
        } as any);

        loadTheme(true);
        expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('blue');
    });
});
