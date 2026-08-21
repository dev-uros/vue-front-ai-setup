import { useRouter } from 'vue-router'
import { useQueryCache } from '@pinia/colada'
import { useSessionStore } from '@/features/shared/stores/session'
import { useLogoutMutation } from '@/features/auth/query/useLogoutMutation'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { LOGIN_ROUTE } from '@/router/guards'

/**
 * Signs out here and only here: the endpoint revokes the token this request carries and
 * leaves the user's other devices alone.
 *
 * The local session is dropped even when the call fails. A network error must not be able to
 * strand someone in a signed-in UI they asked to leave, and the token is useless to us once
 * it has been thrown away.
 */
export function useLogout() {
  const router = useRouter()
  const session = useSessionStore()
  const cache = useQueryCache()
  const toast = useApiToast()
  const { mutateAsync, isLoading } = useLogoutMutation()

  async function signOut() {
    try {
      const result = await mutateAsync()
      toast.success(result.message)
    } catch {
      // Already logged out as far as this browser is concerned; see above.
    }

    session.end()
    // Otherwise the next person to sign in on this browser sees the previous user's data
    // for as long as it takes their own to arrive. Removing beats invalidating: an
    // invalidated entry keeps its data and only refetches, which is the same leak.
    for (const entry of cache.getEntries()) {
      cache.remove(entry)
    }

    await router.push({ name: LOGIN_ROUTE })
  }

  return { signOut, isLoading }
}
