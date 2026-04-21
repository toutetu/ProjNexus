import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Noto Sans JP"',
                    'Figtree',
                    ...defaultTheme.fontFamily.sans,
                ],
                mono: [
                    '"JetBrains Mono"',
                    '"Roboto Mono"',
                    ...defaultTheme.fontFamily.mono,
                ],
            },
            colors: {
                brand: {
                    red: '#E60013',
                    dark: '#212429',
                    bg: '#F8F9FA',
                    muted: '#6C757D',
                    border: '#DEE2E6',
                    accent: '#EDB100',
                    cyan: '#01CFFF',
                    blue: '#106EBE',
                    purple: '#6D28D9',
                },
                status: {
                    draft: '#6C757D',
                    'pending-dept': '#01CFFF',
                    'pending-hq': '#106EBE',
                    approved: '#16A34A',
                    rejected: '#E60013',
                },
            },
            keyframes: {
                'brand-pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 0 3px rgba(16,110,190,0.25)',
                    },
                    '50%': {
                        boxShadow: '0 0 0 6px rgba(16,110,190,0.10)',
                    },
                },
            },
            animation: {
                'brand-pulse': 'brand-pulse 1.6s ease-in-out infinite',
            },
        },
    },

    plugins: [forms, animate],
};
