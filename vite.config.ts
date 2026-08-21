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
     * The design system's global layer: which palette each semantic colour resolves to, and the
     * handful of component defaults the theme changes for every instance. Anything narrower than
     * "every instance of this component" belongs on the component itself, not here.
     *
     * `brand` is declared in `src/assets/css/main.css`; the rest are Tailwind palettes whose 500
     * shade is already the exact colour the theme asks for (green #22C55E, amber #F59E0B,
     * red #EF4444, blue #3B82F6), and zinc is the neutral ramp its greys are taken from.
     */
    ui({
      ui: {
        colors: {
          primary: 'brand',
          success: 'green',
          info: 'blue',
          warning: 'amber',
          error: 'red',
          neutral: 'zinc',
        },
        // Cards: white surface, soft ring, one resting elevation, 16px corners.
        card: {
          slots: {
            root: 'rounded-xl shadow-card',
          },
        },
        pageCard: {
          slots: {
            root: 'rounded-xl',
          },
        },
        // Badges are the theme's pills.
        badge: {
          slots: {
            base: 'rounded-full',
          },
        },
        // A modal is a floating surface: same corner as a card, the softer of the two shadows.
        modal: {
          slots: {
            content: 'rounded-xl shadow-floating',
          },
        },
        /*
         * The active sidebar entry. Nuxt UI already colours its label and icon `primary`; only the
         * pill behind it stays neutral, which reads as "hovered" rather than "you are here".
         * Appended after the built-in compound variants so `before:bg-*` resolves in favour of this.
         */
        navigationMenu: {
          compoundVariants: [
            {
              color: 'primary' as const,
              variant: 'pill' as const,
              active: true,
              class: {
                link: 'before:bg-primary/10 hover:before:bg-primary/15',
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
