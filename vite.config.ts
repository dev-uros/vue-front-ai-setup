import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'

/**
 * Business Navy, part one. The tokens themselves live in `src/assets/css/main.css`; what
 * belongs here is the runtime half of the Nuxt UI theme — which palette each semantic color
 * draws from, and the handful of component defaults the design system asks for.
 *
 * `text-success` and its siblings resolve to whatever shade `--ui-success` names, and the
 * theme names Tailwind's 600 shades. That reads well as a fill, but as 12–14px text on the
 * matching 10% tint it lands near 3:1 — under the 4.5:1 floor. So every variant that draws
 * colored text steps one shade darker in light mode; dark mode already uses shade 400 on a
 * dark canvas and clears the floor as it is.
 *
 * The classes are written out rather than built from the color name because Tailwind finds
 * utilities by scanning source text — an interpolated `text-${color}-700` would never be
 * generated.
 */
const ON_TINT_TEXT = {
  success: 'text-success-700 dark:text-success-400',
  info: 'text-info-700 dark:text-info-400',
  warning: 'text-warning-700 dark:text-warning-400',
  error: 'text-error-700 dark:text-error-400',
} as const

function onTintText<V extends string>(variants: readonly V[], slot?: string) {
  return Object.entries(ON_TINT_TEXT).flatMap(([color, className]) =>
    variants.map((variant) => ({
      color,
      variant,
      class: slot ? { [slot]: className } : className,
    })),
  )
}

/**
 * Controls are 40px tall at `md` and 44px at `lg`, which is the size the auth forms ask for.
 * Only the padding moves — the line height each size already carries does the rest.
 */
const CONTROL_SIZES = {
  variants: {
    size: {
      md: { base: 'px-3 py-2.5' },
      lg: { base: 'px-4 py-3' },
    },
  },
} as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      ui: {
        colors: {
          primary: 'navy',
          neutral: 'slate',
          success: 'green',
          warning: 'amber',
          error: 'red',
          info: 'blue',
        },

        input: CONTROL_SIZES,
        select: CONTROL_SIZES,
        selectMenu: CONTROL_SIZES,
        textarea: CONTROL_SIZES,

        button: {
          variants: {
            size: {
              sm: { base: 'py-2' },
              md: { base: 'px-3 py-2.5' },
              lg: { base: 'px-4 py-3' },
            },
          },
          // Square buttons replace the padding wholesale, so matching heights are set again.
          compoundVariants: [
            { size: 'sm', square: true, class: 'p-2' },
            { size: 'md', square: true, class: 'p-2.5' },
            { size: 'lg', square: true, class: 'p-3' },
            ...onTintText(['outline', 'soft', 'subtle', 'ghost', 'link']),
          ],
        },

        badge: { compoundVariants: onTintText(['soft', 'subtle']) },
        alert: { compoundVariants: onTintText(['outline', 'soft', 'subtle'], 'root') },

        // Cards are white, bordered and compact — the shadow is left to floating surfaces.
        card: {
          slots: {
            header: 'px-4 py-3 sm:px-6 sm:py-4',
            body: 'p-4 sm:p-6',
            footer: 'px-4 py-3 sm:px-6 sm:py-4',
          },
        },

        // Tables are first-class here: tinted header, compact rows, subtle separators and a
        // hover that only just registers.
        table: {
          slots: {
            thead: 'border-b border-default',
            th: 'px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide bg-elevated/50',
            td: 'px-4 py-3 text-sm text-toned',
            tbody: '[&>tr]:hover:bg-elevated/40 [&>tr]:transition-colors',
          },
        },

        // "Light navy active state" — the pill background follows the brand instead of the
        // neutral ramp, for both the top-level entries and the ones nested under a group.
        navigationMenu: {
          variants: {
            active: {
              true: {
                childLink: 'before:bg-primary/10 text-primary',
                childLinkIcon: 'text-primary',
              },
            },
          },
          compoundVariants: [
            {
              variant: 'pill',
              active: true,
              highlight: false,
              class: { link: 'before:bg-primary/10' },
            },
          ],
        },

        // The app canvas is the tinted background; the sidebar and navbar stay on the surface.
        dashboardPanel: { slots: { body: 'bg-muted' } },
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
