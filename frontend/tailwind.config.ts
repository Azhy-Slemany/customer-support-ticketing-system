// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    corePlugins: {
        preflight: false, // prevents Tailwind resetting Ant Design's base styles
    },
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config