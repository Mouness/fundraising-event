import { render, screen } from '@testing-library/react';
import { RootLandingPage } from '@features/public/pages/RootLandingPage';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePublicEvents } from '@features/events/hooks/usePublicEvents';

// Mock dependencies
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(),
}));

vi.mock('@features/events/hooks/usePublicEvents', () => ({
    usePublicEvents: vi.fn(),
}));

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options: any) => {
            if (typeof options === 'string') return options;
            return options?.defaultValue || key;
        },
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
        p: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <p {...props}>{children}</p>,
    },
    useScroll: () => ({
        scrollY: { get: () => 0 },
        scrollYProgress: { get: () => 0 }
    }),
    useTransform: () => 0,
}));

describe('RootLandingPage', () => {
    const mockConfig = {
        id: 'platform',
        slug: 'platform',
        content: {
            title: 'Fundraising Platform',
            goalAmount: 0
        },
        theme: { variables: {} },
        communication: { legalName: 'Platform Inc' }
    };

    const mockEvents = [
        {
            id: 'evt_1',
            slug: 'event-1',
            name: 'Event One',
            goalAmount: 1000,
            raised: 500,
            date: '2025-12-25'
        },
        {
            id: 'evt_2',
            slug: 'event-2',
            name: 'Event Two',
            goalAmount: 2000,
            raised: 0
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppConfig as any).mockReturnValue({ config: mockConfig, isLoading: false });
        (usePublicEvents as any).mockReturnValue({ events: mockEvents, isLoading: false });
    });

    it('renders platform title and subtitle', () => {
        render(
            <MemoryRouter>
                <RootLandingPage />
            </MemoryRouter>
        );

        const titles = screen.getAllByText('Fundraising Platform');
        expect(titles.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Discover and support/i)).toBeInTheDocument();
    });

    it('renders list of events', () => {
        render(
            <MemoryRouter>
                <RootLandingPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Event One')).toBeInTheDocument();
        expect(screen.getByText('Event Two')).toBeInTheDocument();
    });

    it('displays empty state when no events found', () => {
        (usePublicEvents as any).mockReturnValue({ events: [], isLoading: false });

        render(
            <MemoryRouter>
                <RootLandingPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/No active campaigns found/i)).toBeInTheDocument();
    });

    it('renders loading state', () => {
        (usePublicEvents as any).mockReturnValue({ events: [], isLoading: true });

        const { container } = render(
            <MemoryRouter>
                <RootLandingPage />
            </MemoryRouter>
        );

        expect(container.firstChild).toHaveClass('flex justify-center items-center h-screen');
    });
});
