import { computed, type ComputedRef } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'
import { rankVisits, shortcutKey } from '@/features/shortcuts/utils/history'
import { useShortcutsStore } from '@/features/shortcuts/stores/shortcuts'

/** How many make it onto the home page. Beyond a handful it stops being a shortcut. */
const DEFAULT_LIMIT = 6

/**
 * Reads one string out of a route's `meta`.
 *
 * `router/meta.d.ts` declares `title` and `icon`, but that augmentation does not reach here:
 * Vue Router 5 ships a bundled `.d.ts` in which `RouteMeta` is declared in an internal chunk
 * and only re-exported from `vue-router`, so `declare module 'vue-router'` no longer merges
 * into the interface that `RouteLocation.meta` actually uses — every key arrives as `unknown`.
 * Narrowing here is honest about that, and is what a route with no title needs anyway.
 */
function metaText(meta: Record<PropertyKey, unknown>, key: 'title' | 'icon'): string | undefined {
  const value = meta[key]

  return typeof value === 'string' ? value : undefined
}

/** A tracked destination, ready to render. */
export interface Shortcut {
  key: string
  to: RouteLocationRaw
  label: string
  icon: string
  visits: number
}

export interface ShortcutsOptions {
  /**
   * Names a page that only its own feature can name — `users-detail` with an id is a person,
   * and this store has no idea who. Return `undefined` to fall back to the route's title.
   *
   * It is read inside a computed, so a resolver backed by a query relabels the shortcuts by
   * itself once the data lands.
   */
  resolveLabel?: (visit: ShortcutVisit) => string | undefined
  limit?: number
}

/**
 * The shortcuts to show, ranked and labelled.
 *
 * Titles and icons come from the route records, so a page that is renamed is renamed here too,
 * and a route that no longer exists — an old entry from a previous version of the app — is
 * dropped instead of rendering a dead link.
 */
export function useShortcuts(options: ShortcutsOptions = {}): {
  shortcuts: ComputedRef<Shortcut[]>
  clear: () => void
} {
  const router = useRouter()
  const store = useShortcutsStore()

  const shortcuts = computed<Shortcut[]>(() =>
    rankVisits(store.visits)
      .filter((visit) => router.hasRoute(visit.name))
      .slice(0, options.limit ?? DEFAULT_LIMIT)
      .map((visit) => {
        const to = { name: visit.name, params: visit.params }
        const { meta } = router.resolve(to)

        return {
          key: shortcutKey(visit),
          to,
          label: options.resolveLabel?.(visit) ?? metaText(meta, 'title') ?? visit.name,
          icon: metaText(meta, 'icon') ?? 'i-lucide-arrow-up-right',
          visits: visit.visits,
        }
      }),
  )

  return { shortcuts, clear: store.clear }
}
