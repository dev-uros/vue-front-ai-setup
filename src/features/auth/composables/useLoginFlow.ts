import { computed, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'
import { useLoginMutation } from '@/features/auth/query/useLoginMutation'
import { CREDENTIALS_FIELDS, type Credentials } from '@/features/auth/schemas/credentials'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { toFormFeedback, NO_FEEDBACK } from '@/features/shared/utils/apiErrors'

/** Only same-origin paths are honoured, so `?redirect=` cannot bounce a user off-site. */
export function safeRedirect(target: unknown): string {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) {
    return '/'
  }

  return target
}

/**
 * Orchestrates a sign-in: run the mutation, open the session, then land the user where they
 * were originally headed.
 *
 * A wrong email and a wrong password come back as the same 401 with the same message, and
 * that is not a gap to work around — the API refuses to say which one was wrong, so neither
 * does this. The message is shown exactly as it arrives.
 */
export function useLoginFlow() {
  const router = useRouter()
  const route = useRoute()
  const session = useSessionStore()
  const toast = useApiToast()
  const { mutateAsync, isLoading } = useLoginMutation()

  const failure = shallowRef<unknown>(null)

  const feedback = computed(() =>
    failure.value === null ? NO_FEEDBACK : toFormFeedback(failure.value, CREDENTIALS_FIELDS),
  )

  async function submit(credentials: Credentials) {
    failure.value = null

    let result
    try {
      result = await mutateAsync(credentials)
    } catch (error) {
      failure.value = error
      return
    }

    session.start(result.data.user, result.data.token)
    toast.success(result.message)

    await router.replace(safeRedirect(route.query.redirect))
  }

  return { submit, isLoading, feedback }
}
