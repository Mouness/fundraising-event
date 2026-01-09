import { describe, it, expect } from 'vitest'
import { WhiteLabelingMapper } from '../../../src/features/white-labeling/white-labeling.mapper'
import { Configuration, Prisma } from '@prisma/client'

describe('WhiteLabelingMapper', () => {
    describe('toEventConfig', () => {
        it('should map flat DB columns to modular structure', () => {
            const config = {
                organization: 'Test Org',
                address: 'Test Address',
                logo: 'https://logo.com',
            } as any

            const result = WhiteLabelingMapper.toEventConfig(config)

            expect(result.content.title).toBe('Test Org')
            expect(result.communication.legalName).toBe('Test Org')
            expect(result.communication.address).toBe('Test Address')
            expect(result.theme!.assets!.logo).toBe('https://logo.com')
        })

        it('should overlay JSON blobs correctly', () => {
            const config = {
                themeVariables: { '--primary': '#ffffff' },
                event: { totalLabel: 'Custom Total' },
            } as any

            const result = WhiteLabelingMapper.toEventConfig(config)

            expect(result.theme!.variables!['--primary']).toBe('#ffffff')
            expect(result.content.totalLabel).toBe('Custom Total')
        })

        it('should incorporate dynamic Event props', () => {
            const config = { entityId: 'event_1' } as any
            const event = { id: 'evt_123', name: 'Charity Gala', goalAmount: 5000 }

            const result = WhiteLabelingMapper.toEventConfig(config, event)

            expect(result.id).toBe('evt_123')
            expect(result.name).toBe('Charity Gala')
            expect(result.content.goalAmount).toBe(5000)
        })
    })

    describe('toDbPayload', () => {
        it('should map modular paths to flat DB columns', () => {
            const data = {
                communication: { legalName: 'New Org', address: 'New Addr' },
                theme: { assets: { logo: 'new-logo' } },
            }

            const result = WhiteLabelingMapper.toDbPayload(data)

            expect(result.organization).toBe('New Org')
            expect(result.address).toBe('New Addr')
            expect(result.logo).toBe('new-logo')
        })

        it('should recursively clean empty values for persistence', () => {
            const data = {
                communication: { legalName: 'Org', website: '' },
                theme: { variables: { '--primary': '#000', '--secondary': null } },
            } as any

            const result = WhiteLabelingMapper.toDbPayload(data)

            expect((result.communication as any).legalName).toBe('Org')
            expect((result.communication as any).website).toBeUndefined()
            expect((result.themeVariables as any)['--primary']).toBe('#000')
            expect((result.themeVariables as any)['--secondary']).toBeUndefined()
        })

        it('should sync content.title to organization if communication.legalName is missing', () => {
            const data = {
                content: { title: 'Sync Title' },
            }

            const result = WhiteLabelingMapper.toDbPayload(data)

            expect(result.organization).toBe('Sync Title')
        })
    })
})
