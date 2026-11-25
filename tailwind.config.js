module.exports = {
    content: ['./index.html', './src/**/*.jsx', './pdf-import.js'],
    theme: { extend: { borderRadius: { lg: '0.625rem', xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem' }, colors: { th: Object.fromEntries(['bg', 'bg2', 'card', 'elevated', 'line', 'accent', 'accent-hover', 'accent-dark', 'ink', 'muted', 'on-accent'].map(k => [k, `rgb(var(--c-${k}) / <alpha-value>)`])) }, fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'] } } },
    plugins: []
};
