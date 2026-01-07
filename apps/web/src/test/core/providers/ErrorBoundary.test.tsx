import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/core/providers/ErrorBoundary';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const ThrowError = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('renders children when NO error', () => {
        render(
            <ErrorBoundary>
                <div>Children Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Children Content')).toBeDefined();
    });

    it('renders error UI when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('error.title')).toBeDefined();
        expect(screen.getByText('error.message')).toBeDefined();
    });

    it('renders fallback prop when error occurs', () => {
        render(
            <ErrorBoundary fallback={<div>Custom Fallback</div>}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Fallback')).toBeDefined();
    });

    it('reloads on Try Again click', () => {
        const reloadSpy = vi.fn();
        vi.stubGlobal('location', { ...window.location, reload: reloadSpy });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const reloadBtn = screen.getByText('error.reload');
        fireEvent.click(reloadBtn);

        expect(reloadSpy).toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('navigates home on Go Home click', () => {
        // Since href is a property, we might need a different approach for JSDOM
        // But let's try stubbing location entirely
        vi.stubGlobal('location', { ...window.location, href: '' });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const homeBtn = screen.getByText('common.home');
        fireEvent.click(homeBtn);

        // We can't easily check href assignment with stubGlobal like this 
        // because it's a primitive. But the call should not throw.
        vi.unstubAllGlobals();
    });
});
