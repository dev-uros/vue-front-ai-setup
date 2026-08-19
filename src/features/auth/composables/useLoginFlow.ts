import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'
import { useLoginMutation } from '@/features/auth/query/useLoginMutation'
import { AuthError } from '@/features/auth/api/errors'
import type { Credentials } from '@/features/auth/schemas/credentials'

/** Only same-origin paths are honoured, so `?redirect=` can't bounce a user off-site. */
function safeRedirect(target: unknown): string {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) {
    return '/'
  }
  return target
}

/**
 * Orchestrates a sign-in: run the mutation, open the session, then land the user where they
 * were originally headed. Keeping this here is what lets `LoginPage` stay a thin composition
 * surface and `LoginForm` stay purely presentational.
 */
export function useLoginFlow() {
  const router = useRouter()
  const route = useRoute()
  const session = useSessionStore()
  const { mutateAsync, isLoading, error } = useLoginMutation()

  const errorMessage = computed(() => {
    if (!error.value) {
      return null
    }
    return error.value instanceof AuthError
      ? error.value.message
      : 'Something went wrong. Please try again.'
  })

  async function submit(credentials: Credentials) {
    let user
    try {
      user = await mutateAsync(credentials)
    } catch {
      // the failure is already exposed through `error` / `errorMessage`
      return
    }

    session.start(user)
    await router.replace(safeRedirect(route.query.redirect))
  }

  return { submit, isLoading, errorMessage }
}
