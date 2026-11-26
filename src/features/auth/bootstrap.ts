import type { Router } from 'vue-router'
import { useQueryCache } from '@pinia/colada'
import { getAuthToken } from '@/lib/axios'
import { useSessionStore } from '@/features/shared/stores/session'
import { me } from '@/features/auth/api/session'
import { LOGIN_ROUTE } from '@/router/guards'

/**
 * Turn a stored bearer token back into a session, before the first navigation is resolved.
 *
 * This runs from `main.ts` rather than from a guard or a component: the auth guard has to
 * answer "is anyone signed in" synchronously for the very first route, and a component that
 * fetched this would already be inside a layout the guard let it into.
 *
 * Calling `api/` straight from here is deliberate too — `query/` is for data a component
 * renders and re-renders, and this runs once, before any component exists.
 */
export async function restoreSession(): Promise<void> {
  if (getAuthToken() === null) {
    return
  }

  const session = useSessionStore()

  try {
    const { data } = await me()
    session.setUser(data)
  } catch {
    // A 401 already cleared the token in the axios interceptor; anything else (server down,
    // no network) leaves the app signed out, which the login page recovers from. Either way
    // there is nobody to show an error to yet.
    session.end()
  }
}

/**
 * Drops everything this browser knows about the signed-in user: the session and every cached
 * query. Without the second half the next person to sign in on this browser sees the previous
 * user's data for as long as it takes their own to arrive. Removing beats invalidating: an
 * invalidated entry keeps its data and only refetches, which is the same leak.
 */
export function forgetSignedInUser(): void {
  useSessionStore().end()

  const cache = useQueryCache()
  for (const entry of cache.getEntries()) {
    cache.remove(entry)
  }
}

/**
 * What a 401 means once the app is running (`onUnauthorized` in `main.ts`; `lib/axios` has
 * already thrown the token away).
 *
 * Signed in: the token died mid-session — revoked elsewhere, or invalidated by a password
 * reset. Forget the user and go to the login page, remembering where they were so signing in
 * again brings them back.
 *
 * Signed out: the 401 is the login form's own wrong password. The form shows the message;
 * navigating here would only rebuild the login URL without its `?redirect=` and send the user
 * home instead of to the link they came from.
 */
export function endExpiredSession(router: Router): void {
  if (!useSessionStore().isAuthenticated) {
    return
  }

  forgetSignedInUser()
  void router.push({ name: LOGIN_ROUTE, query: { redirect: router.currentRoute.value.fullPath } })
}
