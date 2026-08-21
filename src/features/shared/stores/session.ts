import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { setAuthToken } from '@/lib/axios'
import type { User } from '@/features/shared/schemas/user'

/**
 * Client-only session state: who is signed in right now.
 *
 * The user is **not** persisted. The bearer token is (in `@/lib/axios`), and on every start
 * the app trades it for fresh account details via `GET /auth/me` — see
 * `@/features/auth/bootstrap`. Caching the user next to the token would only mean rendering a
 * name, a role or an active/deactivated state that the server stopped agreeing with, and role
 * is exactly the field the UI keys its admin controls off.
 *
 * Server data never lives here; that belongs in a feature's `query/` folder. What is stored
 * is the answer to "is anyone signed in", which no query can own.
 */
export const useSessionStore = defineStore('session', () => {
  const user = shallowRef<User | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  /**
   * Drives which controls are rendered. A convenience, not a defence — every write endpoint
   * refuses a plain user with a 403 whether or not the button was on screen.
   */
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** A fresh sign-in: login, account activation, or a password reset. */
  function start(nextUser: User, token: string) {
    setAuthToken(token)
    user.value = nextUser
  }

  /** Same token, newer details — a restore from `/auth/me`, or the user editing themselves. */
  function setUser(nextUser: User) {
    user.value = nextUser
  }

  function end() {
    setAuthToken(null)
    user.value = null
  }

  return { user, isAuthenticated, isAdmin, start, setUser, end }
})
