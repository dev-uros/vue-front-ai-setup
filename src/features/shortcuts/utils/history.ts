import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'

/**
 * The rules behind the list of shortcuts, as plain functions: what is worth tracking, how a
 * visit is folded into the history, and which entries surface.
 *
 * Kept out of the store because these are the parts worth testing, and none of them need a
 * session, a router or storage to be exercised.
 */

/** How many destinations are remembered. Enough for the pages one person actually returns to. */
export const MAX_TRACKED = 24

/** What a visit needs to look like to be recorded — a subset of `RouteLocationNormalized`. */
export interface TrackableRoute {
  name?: string | symbol | null
  params: Record<string, string | string[]>
  meta: { public?: boolean; guestOnly?: boolean }
}

/**
 * Routes that would only ever be noise:
 *
 * - the home page, which is where the shortcuts are shown in the first place,
 * - the catch-all miss, which is not a destination anyone wants back,
 * - anything reachable while signed out — the sign-in and password pages belong to nobody.
 */
const IGNORED = new Set(['home', 'not-found'])

export function isTrackable(route: TrackableRoute): route is TrackableRoute & { name: string } {
  if (typeof route.name !== 'string' || IGNORED.has(route.name)) {
    return false
  }

  return !route.meta.guestOnly && !route.meta.public
}

/**
 * Repeated params (`/tags/a/b`) have no route here, and one that appeared later would be
 * ambiguous as a key, so an array param disqualifies the visit rather than being flattened.
 */
export function toStringParams(
  params: Record<string, string | string[]>,
): Record<string, string> | null {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== 'string') {
      return null
    }

    result[key] = value
  }

  return result
}

/** Two visits are the same shortcut when they lead to the same page with the same params. */
export function shortcutKey(visit: Pick<ShortcutVisit, 'name' | 'params'>): string {
  const params = Object.entries(visit.params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return params === '' ? visit.name : `${visit.name}?${params}`
}

/**
 * Folds one visit into the history: a counter goes up, or a new entry starts at one.
 *
 * Pure, and returns a new array — the store hands the result straight to storage, so an
 * in-place mutation would be a saved state nobody could reason about.
 *
 * The cap drops the *least* used entry, so browsing through twenty accounts once each cannot
 * push out a page opened every morning.
 */
export function recordVisit(
  history: readonly ShortcutVisit[],
  visit: Pick<ShortcutVisit, 'name' | 'params'>,
  at: Date,
): ShortcutVisit[] {
  const key = shortcutKey(visit)
  const lastVisitedAt = at.toISOString()
  let found = false

  const next = history.map((entry) => {
    if (shortcutKey(entry) !== key) {
      return entry
    }

    found = true

    return { ...entry, visits: entry.visits + 1, lastVisitedAt }
  })

  if (!found) {
    next.push({ name: visit.name, params: visit.params, visits: 1, lastVisitedAt })
  }

  return rankVisits(next).slice(0, MAX_TRACKED)
}

/** Most visited first; between two equally used pages, the more recent one wins. */
export function rankVisits(history: readonly ShortcutVisit[]): ShortcutVisit[] {
  return [...history].sort(
    (a, b) => b.visits - a.visits || b.lastVisitedAt.localeCompare(a.lastVisitedAt),
  )
}
