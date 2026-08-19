import { useColorMode } from '@vueuse/core'

export type ThemePreference = 'light' | 'dark' | 'auto'

/**
 * Thin wrapper over VueUse's `useColorMode`, which is what Nuxt UI itself registers in a
 * plain Vue app (it installs `useDark()` as a plugin). Both share the `vueuse-color-scheme`
 * storage key, so this stays in sync with Nuxt UI's own color mode components.
 *
 * - `preference` is what the user picked, including `'auto'` (follow the OS).
 * - `resolved` is the mode actually applied right now.
 */
export function useAppTheme() {
  const mode = useColorMode()

  return {
    preference: mode.store,
    resolved: mode.state,
  }
}
