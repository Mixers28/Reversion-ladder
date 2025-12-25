import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0a0e27',
        cosmic: '#1a1f3a',
        sigil: '#d4af37',
      }
    },
  },
  plugins: [],
}
export default config
