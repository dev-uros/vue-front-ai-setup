import type { RouteLocationNormalized } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'

export const LOGIN_ROUTE = 'auth-login'
export const HOME_ROUTE = 'home'

/**
 * Auth middleware, applied once in `router/index.ts` for every navigation.
 *
 * Secure by default: a route is protected unless it declares `meta.public: true`. Adding a
 * feature therefore requires no guard wiring — only opting *out* is explicit.
 */
export function authGuard(to: RouteLocationNormalized) {
  const session = useSessionStore()

  if (to.meta.public) {
    // Already signed in? The login page has nothing to offer.
    return session.isAuthenticated && to.name === LOGIN_ROUTE ? { name: HOME_ROUTE } : true
  }

  if (session.isAuthenticated) {
    return true
  }

  return { name: LOGIN_ROUTE, query: { redirect: to.fullPath } }
}
