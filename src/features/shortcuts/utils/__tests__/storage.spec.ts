import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  clearHistory,
  readHistory,
  storageKey,
  writeHistory,
} from '@/features/shortcuts/utils/storage'
import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'

const entry: ShortcutVisit = {
  name: 'users-detail',
  params: { id: '3' },
  visits: 7,
  lastVisitedAt: '2026-08-21T09:00:00.000Z',
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('per-account keys', () => {
  /** One browser profile, several people: a shared key would hand over the previous one's pages. */
  it('gives every account its own key', () => {
    expect(storageKey(1)).not.toBe(storageKey(2))
  })

  it('reads back only what the same account wrote', () => {
    writeHistory(1, [entry])

    expect(readHistory(1)).toEqual([entry])
    expect(readHistory(2)).toEqual([])
  })

  it('forgets one account without touching the other', () => {
    writeHistory(1, [entry])
    writeHistory(2, [entry])

    clearHistory(1)

    expect(readHistory(1)).toEqual([])
    expect(readHistory(2)).toEqual([entry])
  })
})

describe('reading what is already there', () => {
  it('treats an empty slot as no history', () => {
    expect(readHistory(1)).toEqual([])
  })

  it('survives a value that is not even JSON', () => {
    localStorage.setItem(storageKey(1), 'not json')

    expect(readHistory(1)).toEqual([])
  })

  it('survives JSON that is not a list of visits', () => {
    localStorage.setItem(storageKey(1), '{"visits":3}')

    expect(readHistory(1)).toEqual([])
  })

  /** A hand-edited or half-written row costs that row, not the whole history. */
  it('drops only the rows that do not parse', () => {
    localStorage.setItem(storageKey(1), JSON.stringify([entry, { name: 'users-list' }, null]))

    expect(readHistory(1)).toEqual([entry])
  })

  it('answers with no history when storage itself is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    expect(readHistory(1)).toEqual([])
  })
})

describe('writing', () => {
  /** Shortcuts are a convenience; a full or blocked storage must not break a navigation. */
  it('says nothing when the write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => writeHistory(1, [entry])).not.toThrow()
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})
