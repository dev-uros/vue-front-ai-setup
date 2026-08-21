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
     * Nuxt UI's theme configuration. This is the plain-Vue equivalent of Nuxt's `app.config.ts`
     * — the plugin takes the very same `AppConfigUI` object — and it is the only place semantic
     * colours and component defaults are set. Everything expressed as a CSS value (palette,
     * fonts, radius, shadows, shell tokens) lives in `src/assets/css/main.css` instead.
     *
     * See design-systems/business-navy.md; density there is "compact".
     */
    ui({
      ui: {
        colors: {
          primary: 'navy',
          secondary: 'blue',
          neutral: 'slate',
          success: 'green',
          info: 'blue',
          warning: 'amber',
          error: 'red',
        },

        // Shell — solid-dark. The sidebar block itself is coloured in main.css.
        dashboardGroup: {
          base: 'bg-shell-bg',
        },
        dashboardPanel: {
          slots: { root: 'bg-shell-body' },
        },
        dashboardNavbar: {
          slots: { root: 'bg-topbar-bg border-topbar-border' },
        },

        // Compact density: 36px navigation rows, 11px uppercase section labels.
        navigationMenu: {
          slots: {
            label: 'text-[11px]/4 uppercase tracking-[0.06em] text-dimmed',
          },
          variants: {
            orientation: {
              vertical: {
                link: 'py-2',
              },
            },
          },
        },

        // Compact density: 36px controls. `text-base/5` in the theme is a 20px line box.
        input: {
          variants: { size: { md: { base: 'py-2' } } },
        },
        inputNumber: {
          variants: { size: { md: { base: 'py-2' } } },
        },
        select: {
          variants: { size: { md: { base: 'py-2' } } },
        },
        selectMenu: {
          variants: { size: { md: { base: 'py-2' } } },
        },
        /*
         * Button hierarchy from the theme: primary navy/white, secondary white/navy/border,
         * destructive red. "Secondary" is `color="neutral" variant="outline"` throughout this
         * app, so the navy label is set here once rather than by recolouring each call site.
         */
        button: {
          variants: { size: { md: { base: 'py-2' } } },
          compoundVariants: [
            {
              color: 'neutral',
              variant: 'outline',
              class: 'text-primary ring-default hover:bg-primary/5 hover:text-primary',
            },
          ],
        },

        // Compact: cards stay white and bordered, with tighter padding than the default.
        card: {
          slots: {
            header: 'px-4 py-3 sm:px-5',
            body: 'p-4 sm:p-5',
            footer: 'px-4 py-3 sm:px-5',
          },
        },

        // Compact density: 40px table rows, subtle separators, restrained hover.
        table: {
          slots: {
            th: 'px-4 py-2.5 text-xs uppercase tracking-[0.06em]',
            td: 'px-4 py-2.5',
          },
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
