import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lion: {
          chrome: '#d6d6d6',
          chromeDark: '#c8c8c8',
          titlebar: '#e8e8e8',
          titlebarInactive: '#f4f4f4',
          windowBg: '#ededed',
          silver: '#b8b8b8',
          graphite: '#5f6061',
          graphiteDark: '#4a4b4c',
        },
        aqua: {
          50: '#e9f4ff',
          100: '#d2e9ff',
          200: '#a6d2ff',
          300: '#79baff',
          400: '#4da3ff',
          500: '#218cff',
          600: '#006fdb',
          700: '#0054a6',
          800: '#003971',
          900: '#001f3d'
        },
        chrome: '#f5f5f7',
        graphite: '#1a1b1f',
        dock: '#1c1c1e80'
      },
      fontFamily: {
        system: [
          '"Lucida Grande"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        window: '0 20px 60px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'window-inactive': '0 8px 24px rgba(0, 0, 0, 0.25)',
        dock: '0 0 20px rgba(0, 0, 0, 0.9), inset 0 0 0 0.5px rgba(255, 255, 255, 0.5)',
        'dock-icon': '0 2px 10px rgba(0, 0, 0, 0.5)',
        traffic: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.5)'
      },
      borderRadius: {
        window: '6px',
        traffic: '50%'
      },
      backdropBlur: {
        dock: '40px'
      },
      backgroundImage: {
        'lion-chrome': 'linear-gradient(180deg, #ebebeb 0%, #d6d6d6 100%)',
        'lion-titlebar': 'linear-gradient(180deg, #ededed 0%, #d0d0d0 100%)',
        'lion-titlebar-inactive': 'linear-gradient(180deg, #f6f6f6 0%, #e8e8e8 100%)',
        'lion-dock': 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 100%)',
      }
    }
  },
  plugins: []
};

export default config;

