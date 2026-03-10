import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4f2',
                    100: '#dbe7e0',
                    200: '#bad0c4',
                    300: '#8eb1a0',
                    400: '#5a8b73',
                    500: '#3e6f56',
                    600: '#2b5842',
                    700: '#234736',
                    800: '#1e3b2e',
                    900: '#064E3B', // Sacred Emerald
                    950: '#0e231a',
                },
                'accent-gold': '#D4AF37',
                'pearl': '#FDFBF7',
                accent: {
                    50: '#fdf5f0',
                    100: '#fce8db',
                    200: '#f8cbb0',
                    300: '#f3a87c',
                    400: '#e67e22',
                    500: '#e06516',
                    600: '#d04c0f',
                    700: '#ac3610',
                    800: '#892c14',
                    900: '#6e2613',
                    950: '#3b1108',
                },
                dark: {
                    50: '#F4F7F5',
                    100: '#E8EFEB',
                    200: '#D1DED6',
                    300: '#A8BFB0',
                    400: '#7A9A87',
                    500: '#567563',
                    600: '#3D5448',
                    700: '#2A3B32',
                    800: '#1A2A22',
                    900: '#0F1D16',
                    950: '#080F0B',
                },
            },
            borderRadius: {
                'lg': '2rem',
                'xl': '3rem',
                '4xl': '2.4rem',
                '5xl': '3rem',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Cinzel', 'serif'],
                arabic: ['Amiri', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
