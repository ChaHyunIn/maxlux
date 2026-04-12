import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Pretendard', 'system-ui', 'sans-serif'],
            },
            screens: {
                'xs': '480px',
            },
        },
    },
    plugins: [],
};

export default config;
