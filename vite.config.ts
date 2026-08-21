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
     * Design system: Tech Blue (design-systems/tech-blue.md). This is the plain-Vue equivalent
     * of Nuxt's `app.config.ts` — palettes and the global component theme live here, the
     * CSS-only tokens (shades, radius, type scale, font) in `src/assets/css/main.css`.
     */
    ui({
      ui: {
        colors: {
          primary: 'blue',
          neutral: 'slate',
          success: 'green',
          warning: 'amber',
          error: 'red',
          info: 'sky',
        },

        // The canvas the theme asks for (#F8FAFC) under the white surfaces of the shell.
        dashboardPanel: {
          slots: {
            body: 'bg-(--app-bg-canvas)',
          },
        },

        // White, 1px ring from the `outline` variant, minimal shadow.
        card: {
          slots: {
            root: 'shadow-xs',
          },
        },

        /*
         * Pills, per the radius scale. The rounding lives on badge's `size` variants rather
         * than on its base slot, so overriding it has to happen there too.
         */
        badge: {
          variants: {
            size: {
              xs: { base: 'rounded-full' },
              sm: { base: 'rounded-full' },
              md: { base: 'rounded-full' },
              lg: { base: 'rounded-full' },
              xl: { base: 'rounded-full' },
            },
          },
        },

        /*
         * ~44px rows (12px of padding around a 20px line), compact headers, cell values in the
         * body text color rather than muted, and a restrained row hover.
         *
         * These merge onto the defaults — this config is serialized to JSON on its way into the
         * app, so the function form that replaces a slot outright would not survive the trip.
         */
        table: {
          slots: {
            th: 'py-2.5 text-xs text-toned',
            td: 'py-3 text-default',
            tr: 'transition-colors hover:bg-muted/60',
            empty: 'py-8',
          },
        },

        // The active section reads as the accent rather than as one more grey pill.
        navigationMenu: {
          compoundVariants: [
            {
              variant: 'pill',
              active: true,
              highlight: false,
              class: {
                link: 'before:bg-primary/10',
              },
            },
          ],
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
