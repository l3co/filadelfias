export const colors = {
    // Primária (Emerald/Teal - identidade Filadélfias)
    primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },

    // Tons neutros (Slate)
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },

    // Feedback
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',

    // Gradientes (para usar com LinearGradient)
    gradients: {
        primary: ['#059669', '#0d9488'] as const,
        premium: ['#059669', '#047857'] as const,
        dark: ['#1e293b', '#0f172a'] as const,
    },
};
