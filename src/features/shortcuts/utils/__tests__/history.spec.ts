import { describe, it, expect } from 'vitest'
import {
  MAX_TRACKED,
  isTrackable,
  rankVisits,
  recordVisit,
  shortcutKey,
  toStringParams,
  type TrackableRoute,
} from '@/features/shortcuts/utils/history'
import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'

function route(overrides: Partial<TrackableRoute> = {}): TrackableRoute {
  return { name: 'users-list', params: {}, meta: {}, ...overrides }
}

function visit(overrides: Partial<ShortcutVisit> = {}): ShortcutVisit {
  return {
    name: 'users-list',
    params: {},
    visits: 1,
    lastVisitedAt: '2026-08-21T09:00:00.000Z',
    ...overrides,
  }
}

describe('isTrackable', () => {
  it('tracks an ordinary page behind the session', () => {
    expect(isTrackable(route())).toBe(true)
  })

  /** A shortcut to the page the shortcuts are on. */
  it('skips the home page', () => {
    expect(isTrackable(route({ name: 'home' }))).toBe(false)
  })

  it('skips the catch-all miss', () => {
    expect(isTrackable(route({ name: 'not-found', meta: { public: true } }))).toBe(false)
  })

  /** These are visited signed out, so they belong to nobody's history. */
  it('skips the sign-in and password pages', () => {
    expect(isTrackable(route({ name: 'auth-login', meta: { guestOnly: true } }))).toBe(false)
  })

  it('skips a route with no name, since a name is what gets stored', () => {
    expect(isTrackable(route({ name: undefined }))).toBe(false)
  })
})

describe('toStringParams', () => {
  it('keeps the params a route actually carries', () => {
    expect(toStringParams({ id: '3' })).toEqual({ id: '3' })
  })

  it('refuses a repeated param rather than flattening it into an ambiguous key', () => {
    expect(toStringParams({ tags: ['a', 'b'] })).toBeNull()
  })
})

describe('shortcutKey', () => {
  it('tells two records of the same page apart', () => {
    expect(shortcutKey(visit({ name: 'users-detail', params: { id: '3' } }))).not.toBe(
      shortcutKey(visit({ name: 'users-detail', params: { id: '4' } })),
    )
  })

  it('does not care what order the params were written in', () => {
    expect(shortcutKey(visit({ params: { a: '1', b: '2' } }))).toBe(
      shortcutKey(visit({ params: { b: '2', a: '1' } })),
    )
  })
})

describe('recordVisit', () => {
  const at = new Date('2026-08-21T10:00:00.000Z')

  it('starts a new entry at one visit', () => {
    const [entry] = recordVisit([], { name: 'users-list', params: {} }, at)

    expect(entry).toEqual({
      name: 'users-list',
      params: {},
      visits: 1,
      lastVisitedAt: '2026-08-21T10:00:00.000Z',
    })
  })

  it('counts a return to the same page instead of adding a second entry', () => {
    const history = recordVisit([visit({ visits: 4 })], { name: 'users-list', params: {} }, at)

    expect(history).toHaveLength(1)
    expect(history[0]?.visits).toBe(5)
    expect(history[0]?.lastVisitedAt).toBe('2026-08-21T10:00:00.000Z')
  })

  it('keeps the same page with different params apart', () => {
    const first = recordVisit([], { name: 'users-detail', params: { id: '3' } }, at)
    const both = recordVisit(first, { name: 'users-detail', params: { id: '4' } }, at)

    expect(both).toHaveLength(2)
  })

  it('leaves the history it was given alone', () => {
    const history = [visit({ visits: 4 })]

    recordVisit(history, { name: 'users-list', params: {} }, at)

    expect(history[0]?.visits).toBe(4)
  })

  /** Browsing through twenty accounts once each must not evict the page opened daily. */
  it('drops the least used entry when it runs out of room', () => {
    const full = Array.from({ length: MAX_TRACKED }, (_, index) =>
      visit({ name: 'users-detail', params: { id: String(index) }, visits: index === 0 ? 50 : 1 }),
    )

    const history = recordVisit(full, { name: 'settings-profile', params: {} }, at)

    expect(history).toHaveLength(MAX_TRACKED)
    expect(history[0]?.visits).toBe(50)
    expect(history.some((entry) => entry.name === 'settings-profile')).toBe(true)
  })
})

describe('rankVisits', () => {
  it('puts the most visited first', () => {
    const ranked = rankVisits([visit({ name: 'a', visits: 2 }), visit({ name: 'b', visits: 9 })])

    expect(ranked.map((entry) => entry.name)).toEqual(['b', 'a'])
  })

  it('breaks a tie with whichever was opened last', () => {
    const ranked = rankVisits([
      visit({ name: 'older', visits: 3, lastVisitedAt: '2026-08-01T09:00:00.000Z' }),
      visit({ name: 'newer', visits: 3, lastVisitedAt: '2026-08-20T09:00:00.000Z' }),
    ])

    expect(ranked.map((entry) => entry.name)).toEqual(['newer', 'older'])
  })
})
