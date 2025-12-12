/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0F2027',
                    light: '#203A43',
                    dark: '#091418',
                },
                accent: {
                    DEFAULT: '#EE9CA7',
                    light: '#FFDDE1',
                    dark: '#D47B86',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    light: '#F2D06B',
                },
                bg: {
                    primary: '#FDFBF7',
                    secondary: '#F5F2EB',
                    dark: '#0F2027',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                'gradient-accent': 'linear-gradient(135deg, #EE9CA7 0%, #FFDDE1 100%)',
                'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F2D06B 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 30px rgba(238, 156, 167, 0.3)',
            },
            keyframes: {
                'scroll-down': {
                    '0%, 100%': { transform: 'translateY(0) translateZ(0)', opacity: '0.5' },
                    '50%': { transform: 'translateY(6px) translateZ(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px) translateZ(0)' },
                    '100%': { opacity: '1', transform: 'translateY(0) translateZ(0)' },
                }
            },
            animation: {
                'scroll-down': 'scroll-down 2s infinite ease-in-out',
                'fade-in': 'fade-in 0.5s ease-out',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            }
        },
    },
    plugins: [],
}
