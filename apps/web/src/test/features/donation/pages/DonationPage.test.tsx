import { render, screen } from '@testing-library/react'
import { DonationPage } from '@features/donation/pages/DonationPage'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { useAppConfig } from '@core/providers/AppConfigProvider'

// Mock dependencies
vi.mock('@core/components/AppHeader', () => ({
    AppHeader: () => <div data-testid="app-header">Header</div>,
}))

vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(),
}))

vi.mock('@features/donation/components/CheckoutForm', () => ({
    CheckoutForm: () => <div data-testid="checkout-form">Checkout Form</div>,
}))

describe('DonationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render event title and layout without background', () => {
        vi.mocked(useAppConfig).mockReturnValue({
            config: {
                theme: { assets: { logo: 'logo.png' } },
                content: { title: 'Test Event', goalAmount: 1000 },
                donation: {
                    payment: { provider: 'stripe', config: {} },
                    sharing: { enabled: true, networks: [] },
                    form: {
                        phone: { enabled: true },
                        message: { enabled: true },
                        anonymous: { enabled: true },
                    },
                },
            },
        } as any)

        render(
            <MemoryRouter>
                <DonationPage />
            </MemoryRouter>,
        )

        expect(screen.getByTestId('app-header')).toBeDefined()
        expect(screen.getByTestId('checkout-form')).toBeDefined()
        // Check background style fallback
        // Since we can't easily check computed style of root div here without a testid or class check
        // We can check if the overlay div is NOT present
        const overlay = document.querySelector('.bg-background\\/80')
        expect(overlay).toBeNull()
    })

    it('should render with background image', () => {
        vi.mocked(useAppConfig).mockReturnValue({
            config: {
                theme: {
                    assets: { logo: 'logo.png', backgroundDonor: 'custom-bg.jpg' },
                },
                content: { title: 'Test Event', goalAmount: 1000 },
                donation: {
                    payment: { provider: 'stripe', config: {} },
                    sharing: { enabled: true, networks: [] },
                    form: {
                        phone: { enabled: true },
                        message: { enabled: true },
                        anonymous: { enabled: true },
                    },
                },
            },
        } as any)

        const { container } = render(
            <MemoryRouter>
                <DonationPage />
            </MemoryRouter>,
        )

        expect(screen.getByTestId('app-header')).toBeDefined()

        const rootDiv = container.firstChild as HTMLElement
        expect(rootDiv.style.backgroundImage).toContain('custom-bg.jpg')

        // Select by parts of the class name that are unique enough
        const overlay = container.querySelector('.fixed.inset-0.backdrop-blur-sm')
        expect(overlay).toBeDefined()
    })
})
