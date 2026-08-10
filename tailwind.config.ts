import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        salomon: {
          red:    '#E8002D',
          black:  '#0A0E1A',
          dark:   '#0D1529',
          navy:   '#111D3A',
          card:   'rgba(10,20,50,0.72)',
          glass:  'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.12)',
          cyan:   '#00C8FF',
          teal:   '#0AFFE0',
          gold:   '#FFD966',
          text:   '#E8EDF8',
          muted:  '#7B8DB0',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'mountain': "url('https://salomon-next.vercel.app/mountain-photo.jpeg')",
        'hero-gradient': 'linear-gradient(180deg, rgba(5,10,25,0.30) 0%, rgba(5,10,25,0.80) 100%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,200,255,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        glass:       '0 4px 24px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-red':  '0 0 20px rgba(232,0,45,0.5), 0 0 40px rgba(232,0,45,0.2)',
        'glow-cyan': '0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.2)',
        'glow-teal': '0 0 16px rgba(10,255,224,0.4)',
        'card-hover':'0 8px 40px 0 rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      animation: {
        fadeIn:       'fadeIn 0.6s ease forwards',
        fadeInUp:     'fadeInUp 0.7s ease forwards',
        fadeInLeft:   'fadeInLeft 0.7s ease forwards',
        fadeInRight:  'fadeInRight 0.7s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
        particle:     'particle 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInLeft: { '0%': { opacity: '0', transform: 'translateX(-24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        fadeInRight:{ '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        glowPulse:  { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        particle:   {
          '0%':   { opacity: '0',   transform: 'translateY(0) scale(0.5)' },
          '20%':  { opacity: '1',   transform: 'translateY(-20px) scale(1)' },
          '80%':  { opacity: '0.6', transform: 'translateY(-80px) scale(0.8)' },
          '100%': { opacity: '0',   transform: 'translateY(-120px) scale(0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
