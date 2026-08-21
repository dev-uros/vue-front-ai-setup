import { shortcutVisitSchema, type ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'

/**
 * Where one account's history lives between sessions.
 *
 * **The key is per account, and that is the whole point.** One machine is one browser
 * profile: a shared laptop at the front desk has several people signing in and out of this
 * app all day, and a single key would show each of them the pages the previous one opened.
 *
 * A plain `localStorage` wrapper rather than VueUse's `useStorage`, for two reasons: the key
 * changes with whoever is signed in, and a single corrupted row has to be dropped on its own
 * instead of resetting the whole history.
 */
const STORAGE_PREFIX = 'app.shortcuts'

export function storageKey(userId: number): string {
  return `${STORAGE_PREFIX}.${userId}`
}

/**
 * Anything unreadable is treated as "no history": this is a convenience, and a private
 * window, a full disk or a hand-edited entry must not be able to break the home page.
 */
export function readHistory(userId: number): ShortcutVisit[] {
  let raw: string | null

  try {
    raw = localStorage.getItem(storageKey(userId))
  } catch {
    return []
  }

  if (raw === null) {
    return []
  }

  let rows: unknown

  try {
    rows = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(rows)) {
    return []
  }

  return rows.flatMap((row) => {
    const parsed = shortcutVisitSchema.safeParse(row)

    return parsed.success ? [parsed.data] : []
  })
}

export function writeHistory(userId: number, history: readonly ShortcutVisit[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(history))
  } catch {
    // Storage is full or blocked. Losing the shortcuts is the correct casualty here.
  }
}

export function clearHistory(userId: number): void {
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // Nothing to do about it, and nothing depends on it having worked.
  }
}
