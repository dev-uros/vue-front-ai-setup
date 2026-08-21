import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      ui: {
        /*
         * The Eco Gamification palettes, defined shade by shade in `src/assets/css/main.css`.
         * `secondary` is pointed at the brand green too: nothing in the app asks for it, and
         * leaving it on Nuxt UI's blue would let an unrelated hue in through a default.
         */
        colors: {
          primary: 'evergreen',
          secondary: 'evergreen',
          success: 'sprout',
          info: 'periwinkle',
          warning: 'apricot',
          error: 'poppy',
          /*
           * Nuxt UI only accepts one of its own neutral ramps here. `gray` is the closest —
           * the same cool cast — and `main.css` then pins `--ui-color-neutral-*` to the
           * graphite scale so the border and text tokens are the design system's exact values.
           */
          neutral: 'gray',
        },
        button: {
          /* The design system's button lift — green-tinted, and only on the filled variants. */
          compoundVariants: [
            { variant: 'solid', class: 'shadow-button' },
            { color: 'neutral', variant: 'solid', class: 'shadow-none' },
          ],
        },
        /*
         * Soft status colors read as a tint plus the color's own text, and at #34C759 /
         * #FF8D28 that text lands around 2:1 on the tint. The fills stay the named colors;
         * only the lettering steps down the scale far enough to be legible. Dark mode is
         * already fine — the palette flips to shade 400 on a near-black background.
         */
        badge: {
          compoundVariants: [
            {
              color: 'success',
              variant: 'subtle',
              class: 'text-success-800 dark:text-success-400',
            },
            {
              color: 'warning',
              variant: 'subtle',
              class: 'text-warning-800 dark:text-warning-400',
            },
            { color: 'error', variant: 'subtle', class: 'text-error-700 dark:text-error-400' },
          ],
        },
        alert: {
          compoundVariants: [
            {
              color: 'success',
              variant: 'subtle',
              class: { root: 'text-success-800 dark:text-success-400' },
            },
            {
              color: 'warning',
              variant: 'subtle',
              class: { root: 'text-warning-800 dark:text-warning-400' },
            },
            {
              color: 'error',
              variant: 'subtle',
              class: { root: 'text-error-700 dark:text-error-400' },
            },
          ],
        },
        table: {
          slots: {
            /* Every table is its own bordered surface, tinted header included. */
            root: 'rounded-card border border-default bg-default',
            thead: 'bg-muted',
          },
        },
        card: {
          slots: {
            /* Cards are 16px; Nuxt UI's `rounded-lg` is 8px off this radius ramp. */
            root: 'rounded-card',
          },
        },
        navigationMenu: {
          /*
           * An active entry is green on a light green pill rather than on a gray one — the
           * text and icon are already `text-primary` by default.
           */
          compoundVariants: [
            {
              variant: 'pill',
              active: true,
              highlight: false,
              class: { link: 'before:bg-primary/10' },
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
