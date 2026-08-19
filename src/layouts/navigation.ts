import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Sidebar navigation. App chrome, not feature code — it only references route names, so it
 * never imports from `features/`.
 *
 * An entry with `children` renders as an expandable group; without it, as a single link.
 * The outer array creates visually separated groups.
 */
export const mainNavigation: NavigationMenuItem[][] = [
  [
    { label: 'Home', icon: 'i-lucide-house', to: { name: 'home' } },
    { label: 'Reports', icon: 'i-lucide-chart-line', to: { name: 'reports' } },
  ],
  [
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      children: [
        { label: 'Profile', icon: 'i-lucide-user', to: { name: 'settings-profile' } },
        { label: 'Appearance', icon: 'i-lucide-palette', to: { name: 'settings-appearance' } },
      ],
    },
  ],
]
