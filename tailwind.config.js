/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0D2B5E', mid: '#1E3A7A', light: '#EBF1FB' },
        idma:    { blue: '#3B82F6', cyan: '#06B6D4', green: '#10B981',
                   red: '#EF4444', amber: '#F59E0B', purple: '#7C3AED' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
    }
  },
  plugins: []
}
