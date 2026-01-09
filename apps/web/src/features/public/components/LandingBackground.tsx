import { useAppConfig } from '@core/providers/AppConfigProvider'

export const LandingBackground = () => {
    const { config } = useAppConfig()
    const backgroundImage = config.theme?.assets?.backgroundLanding

    if (backgroundImage) {
        return (
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] contrast-150 brightness-150"></div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Blob 1 */}
            <div
                className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-full blur-[120px]"
                style={{
                    backgroundColor: 'hsl(var(--landing-hero-gradient-primary))',
                    opacity: 'var(--landing-blob-opacity)',
                    animation: 'blob-float-1 var(--landing-blob-1-duration) infinite ease-in-out',
                }}
            />
            {/* Blob 2 */}
            <div
                className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px]"
                style={{
                    backgroundColor: 'hsl(var(--landing-hero-gradient-secondary))',
                    opacity: 'var(--landing-blob-opacity)',
                    animation: 'blob-float-2 var(--landing-blob-2-duration) infinite ease-in-out',
                }}
            />
            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] contrast-150 brightness-150"></div>
        </div>
    )
}
