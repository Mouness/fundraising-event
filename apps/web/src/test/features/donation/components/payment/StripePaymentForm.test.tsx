import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { StripePaymentForm } from '@features/donation/components/payment/StripePaymentForm'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            donation: {
                sharing: { enabled: true, networks: [] },
            },
        },
        isLoading: false,
    }),
    AppConfigProvider: ({ children }: any) => <>{children}</>,
}))

const mockConfirmPayment = vi.fn()

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }: any) => <div>{children}</div>,
    PaymentElement: ({ onReady }: any) => {
        // Automatically call onReady in tests to enable the button
        setTimeout(() => {
            act(() => {
                onReady && onReady()
            })
        }, 10)
        return <div data-testid="payment-element">Stripe Element</div>
    },
    useStripe: () => ({
        confirmPayment: mockConfirmPayment,
    }),
    useElements: () => ({}),
}))

vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(),
}))

describe('StripePaymentForm', () => {
    const defaultProps = {
        sessionData: { id: 'sess_123', clientSecret: 'pi_test_secret' },
        config: { publishableKey: 'pk_test_123' },
        onSuccess: vi.fn(),
        onError: vi.fn(),
        onBack: vi.fn(),
        amount: 50,
        currency: 'USD',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render error if publishable key is missing and env is empty', async () => {
        vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', '')
        const props = {
            ...defaultProps,
            config: {},
            sessionData: { clientSecret: 'pi_test' },
        }
        render(<StripePaymentForm {...props} />)
        expect(await screen.findByText('payment.error_missing_config')).toBeDefined()
        vi.unstubAllEnvs()
    })

    it('should show error if clientSecret is missing', async () => {
        const props = { ...defaultProps, sessionData: {} }
        render(<StripePaymentForm {...props} />)
        expect(await screen.findByText('payment.error_generic')).toBeDefined()
    })

    it('should initialize Stripe elements and handle successful payment', async () => {
        mockConfirmPayment.mockResolvedValue({ error: null })
        render(<StripePaymentForm {...defaultProps} />)

        const payBtn = await screen.findByRole('button', {
            name: /donation.pay_now/i,
        })
        // Wait for button to be enabled (onReady calls setIsStripeReady)
        await waitFor(() => expect(payBtn).not.toBeDisabled(), { timeout: 2000 })

        fireEvent.click(payBtn)

        await waitFor(() => expect(mockConfirmPayment).toHaveBeenCalled())
        expect(defaultProps.onSuccess).toHaveBeenCalled()
    })

    it('should handle payment confirmation error', async () => {
        mockConfirmPayment.mockResolvedValue({
            error: { message: 'Card declined' },
        })
        render(<StripePaymentForm {...defaultProps} />)

        const payBtn = await screen.findByRole('button', {
            name: /donation.pay_now/i,
        })
        await waitFor(() => expect(payBtn).not.toBeDisabled())

        fireEvent.click(payBtn)

        expect(await screen.findByText('Card declined')).toBeDefined()
        expect(defaultProps.onError).toHaveBeenCalledWith('Card declined')
    })

    it('should call onBack when clicked', async () => {
        render(<StripePaymentForm {...defaultProps} />)

        const backBtn = screen.getByText('common.back')
        fireEvent.click(backBtn)

        expect(defaultProps.onBack).toHaveBeenCalled()
    })
})
