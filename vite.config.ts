import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    /*
     * Which Tailwind palette answers to each Nuxt UI semantic colour — the Minimal Neutral
     * design system, whose ramps are Tailwind's `zinc`, `green`, `amber`, `red` and `blue`.
     * The shades those names resolve to, and everything else about the theme, live in
     * `src/assets/css/main.css`.
     */
    ui({
      ui: {
        colors: {
          primary: 'zinc',
          neutral: 'zinc',
          secondary: 'blue',
          success: 'green',
          warning: 'amber',
          error: 'red',
          info: 'blue',
        },
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
