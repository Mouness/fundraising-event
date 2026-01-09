import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n, { syncLocales } from '@/core/lib/i18n'
import { loadLocales } from '@fundraising/white-labeling'

vi.mock('@fundraising/white-labeling', () => ({
    loadLocales: vi.fn(() => ({ en: { test: 'value' }, fr: { test: 'valeur' } })),
}))

describe('i18n lib', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should sync locales', () => {
        const addResourceBundleSpy = vi.spyOn(i18n, 'addResourceBundle')
        syncLocales()
        expect(loadLocales).toHaveBeenCalled()
        expect(addResourceBundleSpy).toHaveBeenCalledWith(
            'en',
            'common',
            { test: 'value' },
            true,
            true,
        )
        expect(addResourceBundleSpy).toHaveBeenCalledWith(
            'fr',
            'common',
            { test: 'valeur' },
            true,
            true,
        )
    })
})
