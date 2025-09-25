// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  // This section MUST be correct to scan your files
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      colors: {
        gunmetal: '#2D3748',
        charcoal: '#4A5568',
        'slate-gray': '#A0AEC0',
        'ghost-white': '#F7FAFC',
        'vivid-cyan': '#00C4B3',
      },
    },
  },
  plugins: [],
}
export default config