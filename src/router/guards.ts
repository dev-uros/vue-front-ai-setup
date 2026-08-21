import type { RouteLocationNormalized } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'

export const LOGIN_ROUTE = 'auth-login'
export const HOME_ROUTE = 'home'

/**
 * Auth middleware, applied once in `router/index.ts` for every navigation.
 *
 * Secure by default: a route is protected unless it declares `meta.public` or `meta.guestOnly`.
 * Adding a feature therefore requires no guard wiring — only opting *out* is explicit.
 *
 * - `meta.guestOnly` — sign-in and password recovery. Reachable signed out; a signed-in visitor
 *   is sent home, because these pages have nothing to offer them.
 * - `meta.public` — reachable either way (terms, status pages).
 * - neither — needs a session; anonymous visitors go to the login page and come back afterwards.
 */
export function authGuard(to: RouteLocationNormalized) {
  const session = useSessionStore()

  if (to.meta.guestOnly) {
    return session.isAuthenticated ? { name: HOME_ROUTE } : true
  }

  if (to.meta.public || session.isAuthenticated) {
    return true
  }

  return { name: LOGIN_ROUTE, query: { redirect: to.fullPath } }
}
