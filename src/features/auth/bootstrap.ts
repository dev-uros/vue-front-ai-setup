import { getAuthToken } from '@/lib/axios'
import { useSessionStore } from '@/features/shared/stores/session'
import { me } from '@/features/auth/api/session'

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
