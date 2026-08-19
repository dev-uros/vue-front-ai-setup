import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { userSchema, type User } from '@/features/shared/schemas/user'

export const SESSION_STORAGE_KEY = 'app.session.user'

/**
 * localStorage is an external boundary, so whatever comes back is parsed through the schema.
 * A stale, truncated or tampered payload therefore logs the user out instead of crashing
 * the app with a half-shaped user object.
 */
function readPersistedUser(): User | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = userSchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return parsed.data
    }
  } catch {
    // malformed JSON — fall through and drop the session
  }

  localStorage.removeItem(SESSION_STORAGE_KEY)
  return null
}

/**
 * Client-only session state: who is signed in, persisted across reloads.
 * Server data never lives here — that belongs in a feature's `query/` folder.
 */
export const useSessionStore = defineStore('session', () => {
  const user = shallowRef<User | null>(readPersistedUser())
  const isAuthenticated = computed(() => user.value !== null)

  function start(nextUser: User) {
    user.value = nextUser
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser))
  }

  function end() {
    user.value = null
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  return { user, isAuthenticated, start, end }
})
