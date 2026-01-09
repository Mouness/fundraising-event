import type { PropsWithChildren } from 'react'
import { LandingBackground } from '../components/LandingBackground'
import { PublicHeader } from '../components/PublicHeader'
import { PublicFooter } from '../components/PublicFooter'

export const PublicLayout = ({ children }: PropsWithChildren) => {
    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-background text-foreground overflow-hidden relative">
            {/* Animated Background Mesh */}
            <LandingBackground />

            {/* Header */}
            <PublicHeader />

            {/* Main Content */}
            <main className="flex-grow flex flex-col relative z-10">{children}</main>

            {/* Footer */}
            <PublicFooter />
        </div>
    )
}
