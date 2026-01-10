export type VariableType = 'color' | 'radius' | 'text' | 'none'

export const getVariableType = (key?: string, value?: string): VariableType => {
    if (!key) return 'text'

    const lowerKey = key.toLowerCase()

    // Explicit padding/margin/height/width should typically not show a text preview (like "Aa" at 20px)
    // unless specifically font-size.
    if (lowerKey.includes('font-size')) {
        return 'text'
    }

    if (lowerKey.includes('radius')) {
        return 'radius'
    }

    // Color detection
    if (
        /color|bg|background|foreground|border|ring|shadow|stroke|fill/i.test(lowerKey) ||
        value?.match(/^#|rgb|hsl/i)
    ) {
        return 'color'
    }

    // Default to none for things like padding, margin, width, height to avoid misleading previews
    return 'none'
}
