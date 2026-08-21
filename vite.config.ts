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
     * Which palette each semantic colour maps to — the Vue equivalent of Nuxt's
     * `app.config.ts`, which does not apply here. `terracotta` is defined in
     * `src/assets/css/main.css`; the rest are Tailwind's, picked in
     * `design-systems/warm-editorial.md`. Shades and every other token live in that CSS file.
     */
    ui({
      ui: {
        colors: {
          primary: 'terracotta',
          neutral: 'stone',
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
