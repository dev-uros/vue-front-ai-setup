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
     * Nuxt UI's global theme. `app.config.ts` is a Nuxt file and does nothing in a plain Vue
     * app — the `ui` option here is its equivalent, and it is the only place a component
     * default is changed. The palette itself lives in src/assets/css/main.css; what follows
     * is only the structural half of design-systems/dark-console.md.
     */
    ui({
      ui: {
        /*
         * The theme's Nuxt UI mapping. These pick the hue family for each generated palette;
         * the exact hexes are pinned on `--ui-primary` and friends in main.css, which is what
         * components actually resolve. `neutral` only accepts Nuxt UI's nine named greys, so
         * the blue-tinted greys the theme lists arrive through `--ui-bg-*`/`--ui-text-*`.
         */
        colors: {
          primary: 'blue',
          secondary: 'blue',
          success: 'green',
          warning: 'amber',
          error: 'red',
          info: 'blue',
          neutral: 'zinc',
        },

        /* Content area: the theme's tight spacing, rather than growing to 24px on desktop. */
        dashboardPanel: { slots: { body: 'gap-4 p-4 sm:gap-4 sm:p-4' } },

        /* Cards are a Surface sitting on the Background, not a hole cut into it. */
        card: {
          slots: {
            header: 'px-4 py-3 sm:px-4',
            body: 'p-4 sm:p-4',
            footer: 'px-4 py-3 sm:px-4',
            title: 'text-sm',
          },
          variants: {
            variant: {
              outline: { root: 'bg-muted' },
              subtle: { root: 'bg-muted' },
              soft: { root: 'bg-muted' },
            },
          },
        },

        /*
         * Tables are the primary component of this theme: 34px rows, hairline separators,
         * 11px uppercase headers. Nuxt UI's default `p-4` cells would give 52px rows.
         */
        table: {
          slots: {
            th: 'px-3 py-2 text-xs font-medium uppercase tracking-wide text-dimmed',
            td: 'px-3 py-2 text-sm text-muted',
            tr: 'hover:bg-console-row-hover',
            empty: 'py-6 text-sm text-muted',
          },
        },

        /*
         * Sidebar items: 13px labels, 16px icons, and an active state that is the theme's
         * primary tint rather than the neutral `bg-elevated` fill. The tint has to be set as
         * a compound variant because the fill is applied by one — a slot class would be
         * overruled by it, and would also paint the inactive items.
         */
        navigationMenu: {
          slots: {
            link: 'text-sm',
            linkLeadingIcon: 'size-4',
            childLinkIcon: 'size-4',
          },
          compoundVariants: [
            {
              variant: 'pill',
              active: true,
              highlight: false,
              class: { link: 'before:bg-console-primary-tint' },
            },
          ],
        },

        /*
         * Inputs: Surface background, Border Strong outline. `ring-accented` is already
         * #313D4C through the token layer, so only the fill moves off the page background.
         */
        input: { variants: { variant: { outline: 'bg-muted' } } },
        textarea: { variants: { variant: { outline: 'bg-muted' } } },
        select: {
          variants: { variant: { outline: 'bg-muted' } },
          slots: { content: 'bg-accented' },
        },
        selectMenu: {
          variants: { variant: { outline: 'bg-muted' } },
          slots: { content: 'bg-accented' },
        },
        inputMenu: {
          variants: { variant: { outline: 'bg-muted' } },
          slots: { content: 'bg-accented' },
        },

        /*
         * Overlays float above the Surface, so they take Surface Raised — the one place the
         * theme allows a shadow, which `--shadow-lg` already redefines to its single value.
         */
        dropdownMenu: { slots: { content: 'bg-accented' } },
        contextMenu: { slots: { content: 'bg-accented' } },
        popover: { slots: { content: 'bg-accented' } },
        tooltip: { slots: { content: 'bg-accented' } },
        modal: { slots: { content: 'bg-accented' } },
        slideover: { slots: { content: 'bg-accented' } },
        toast: { slots: { root: 'bg-accented' } },
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
