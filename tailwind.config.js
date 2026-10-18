module.exports = {
    content: ['./index.html', './src/**/*.jsx', './pdf-import.js'],
    theme: { extend: { borderRadius: { lg: '0.3rem', xl: '0.4rem', '2xl': '0.5rem', '3xl': '0.6rem' }, colors: { th: Object.fromEntries(['bg', 'bg2', 'card', 'elevated', 'line', 'accent', 'accent-hover', 'accent-dark', 'ink', 'muted', 'on-accent'].map(k => [k, `rgb(var(--c-${k}) / <alpha-value>)`])) }, fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] } } },
    plugins: []
};
