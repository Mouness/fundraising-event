// import './theme.default.css';

/**
 * Helper to get the default theme CSS import.
 * In a Vite environment, importing this file (or the css directly) handles the injection.
 * For now, this file mainly ensures the default CSS is included in the bundle when imported.
 */
export const loadDefaultTheme = () => {
    // No-op: check side-effects (import './theme.default.css')
    console.log('Default theme loaded');
};
