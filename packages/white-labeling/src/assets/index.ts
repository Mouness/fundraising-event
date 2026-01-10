import logo from './images/logo.svg'
import favicon from './images/favicon.svg'
import backgroundDonor from './images/background-donor.svg'
import backgroundLive from './images/background-live.svg'
import backgroundLanding from './images/background-landing.svg'
import { getGlobalConfig, getEventConfig } from '../store'
import { deepMerge } from '../utils/merge'

const defaultAssets = {
    logo: logo,
    favicon: favicon,
    backgroundDonor: backgroundDonor,
    backgroundLive: backgroundLive,
    backgroundLanding: backgroundLanding,
}

export type AssetRegistry = typeof defaultAssets

/**
 * Loads the final assets map by merging defaults with database overrides.
 */
export const loadAssets = (): AssetRegistry => {
    const globalAssets = getGlobalConfig()?.theme?.assets || {}
    const eventAssets = getEventConfig()?.theme?.assets || {}

    // Filter out empty strings/nulls to avoid overriding defaults with empty values
    const cleanAssets = (assets: Partial<AssetRegistry>) => {
        const cleaned = { ...assets }
        ;(Object.keys(cleaned) as Array<keyof AssetRegistry>).forEach((key) => {
            if (!cleaned[key]) {
                delete cleaned[key]
            }
        })
        return cleaned
    }

    // Merge: Default < Global < Event
    return deepMerge(
        defaultAssets,
        cleanAssets(globalAssets),
        cleanAssets(eventAssets),
    ) as AssetRegistry
}
