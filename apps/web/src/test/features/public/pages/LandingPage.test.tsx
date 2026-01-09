import { render, screen } from '@testing-library/react';
import { LandingPage } from '@features/public/pages/LandingPage';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(),
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'landing.hero.welcome') return 'Welcome to';
            if (key === 'landing.hero.description') return `Join us goal: ${options?.goal}`;
            return key; // Return key for others for simplicity or add specific mocks
        },
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        }
    }),
}));

// Mock LanguageSwitcher since it might use complex logic/icons
vi.mock('@core/components/LanguageSwitcher', () => ({
    LanguageSwitcher: () => <div data-testid="language-switcher">LangSwitcher</div>
}));

describe('LandingPage', () => {
    const mockConfig = {
        content: {
            title: 'Test Event 2025',
            goalAmount: 50000,
            landing: {
                impact: {
                    url: '/impact'
                },
                community: {
                    url: '/community'
                },
                interactive: {
                    url: '/interactive'
                }
            }
        },
        theme: {
            assets: {
                logo: 'http://test.com/logo.png'
            }
        },
        communication: {
            legalName: 'Test Charity',
            website: 'http://charity.com',
            supportEmail: 'support@charity.com'
        }
    };

    beforeEach(() => {
        (useAppConfig as any).mockReturnValue({ config: mockConfig });
    });

    const renderPage = () => {
        return render(
            <MemoryRouter initialEntries={['/test-event']}>
                <Routes>
                    <Route path="/:slug" element={<LandingPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders event title and welcome message', () => {
        renderPage();
        expect(screen.getAllByText('Test Event 2025')).toHaveLength(2);
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
    });

    it('displays the formatted goal amount', () => {
        renderPage();
        // The mock translation returns "Join us goal: $50,000.00" (formatted US locale)
        expect(screen.getByText(/Join us goal: \$50,000.00/i)).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        renderPage();
        expect(screen.getByText('landing.cta.donate')).toBeInTheDocument();
        expect(screen.getByText('landing.cta.live')).toBeInTheDocument();
    });

    it('renders feature cards with translated text', () => {
        renderPage();
        expect(screen.getByText('landing.features.impact.title')).toBeInTheDocument();
        expect(screen.getByText('landing.features.community.title')).toBeInTheDocument();
    });

    it('renders footer information', () => {
        renderPage();
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
        expect(screen.getByText('landing.footer.website')).toHaveAttribute('href', 'http://charity.com');
        expect(screen.getByText('landing.footer.support')).toHaveAttribute('href', 'mailto:support@charity.com');
    });

    it('uses fallback icon if no logo is provided', () => {
        (useAppConfig as any).mockReturnValue({
            config: {
                ...mockConfig,
                theme: { assets: { logo: null } }
            }
        });
        renderPage();
        expect(screen.queryByAltText('Test Event 2025')).not.toBeInTheDocument();
        // Check for the heart icon container fallback
        // Hard to query by icon specifically without test-id, but we can verify image is absent
    });
});
