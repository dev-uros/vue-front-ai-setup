import { shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { useSessionStore } from '@/features/shared/stores/session'
import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'
import {
  isTrackable,
  recordVisit,
  toStringParams,
  type TrackableRoute,
} from '@/features/shortcuts/utils/history'
import { clearHistory, readHistory, writeHistory } from '@/features/shortcuts/utils/storage'

/**
 * Which pages the signed-in account keeps coming back to.
 *
 * Client-only state, so a Pinia store rather than a query: nothing here comes from the server,
 * and it is written on navigation rather than fetched.
 *
 * The history follows the session. Signing out empties it from memory but leaves it on disk,
 * so the same person finds their shortcuts again next time — while the next person to sign in
 * on the same machine reads their own key and never sees them.
 */
export const useShortcutsStore = defineStore('shortcuts', () => {
  const session = useSessionStore()

  const visits = shallowRef<ShortcutVisit[]>([])

  watch(
    () => session.user?.id,
    (userId) => {
      visits.value = userId === undefined ? [] : readHistory(userId)
    },
    { immediate: true },
  )

  /**
   * Called for every confirmed navigation. Silently ignores what it should not track, because
   * the caller is a global router hook that has no business knowing the rules.
   */
  function record(route: TrackableRoute): void {
    const userId = session.user?.id

    if (userId === undefined || !isTrackable(route)) {
      return
    }

    const params = toStringParams(route.params)

    if (params === null) {
      return
    }

    visits.value = recordVisit(visits.value, { name: route.name, params }, new Date())
    writeHistory(userId, visits.value)
  }

  /** Forgets this account's history, on disk as well as in memory. */
  function clear(): void {
    const userId = session.user?.id

    if (userId !== undefined) {
      clearHistory(userId)
    }

    visits.value = []
  }

  return { visits, record, clear }
})
