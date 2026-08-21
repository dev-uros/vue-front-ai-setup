import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Sidebar navigation. App chrome, not feature code — it only references route names, so it
 * never imports from `features/`.
 *
 * An entry with `children` renders as an expandable group; without it, as a single link.
 * The outer array creates visually separated groups.
 *
 * Which entry is lit is computed here instead of being left to link matching, because the two
 * answer different questions: a link matches the page it points at, while a menu entry stands
 * for a whole section. Opening a user's detail page has to leave "Korisnici" lit even though
 * the entry links to the list.
 *
 * Leaving it to link matching was also what made "Početna" light up everywhere: `home` is an
 * index route (`path: ''`), and Vue Router matches those through the parent record — which
 * every page under `MainLayout` shares.
 */
export function mainNavigation(routeName: string): NavigationMenuItem[][] {
  /**
   * Route names are feature-prefixed by convention (`users-list`, `users-detail`), so a
   * section is a prefix and a new route in that feature lights the entry without being listed
   * here. Leaves inside a group match their own name instead: `settings-profile` and
   * `settings-appearance` share a prefix, and matching on it would light both at once.
   */
  const inSection = (feature: string) => routeName.startsWith(`${feature}-`)

  return [
    [
      {
        label: 'Početna',
        icon: 'i-lucide-house',
        to: { name: 'home' },
        active: routeName === 'home',
      },
      {
        label: 'Korisnici',
        icon: 'i-lucide-users',
        to: { name: 'users-list' },
        active: inSection('users'),
      },
    ],
    [
      {
        label: 'Podešavanja',
        icon: 'i-lucide-settings',
        defaultOpen: true,
        children: [
          {
            label: 'Moj nalog',
            icon: 'i-lucide-user',
            to: { name: 'settings-profile' },
            active: routeName === 'settings-profile',
          },
          {
            label: 'Izgled',
            icon: 'i-lucide-palette',
            to: { name: 'settings-appearance' },
            active: routeName === 'settings-appearance',
          },
        ],
      },
    ],
  ]
}
