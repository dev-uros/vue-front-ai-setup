import { computed, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'
import {
  useSetPasswordMutation,
  type SetPasswordMode,
} from '@/features/auth/query/useSetPasswordMutation'
import {
  passwordLinkSchema,
  SET_PASSWORD_FIELDS,
  type SetPasswordForm,
} from '@/features/auth/schemas/password'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { toFormFeedback, NO_FEEDBACK } from '@/features/shared/utils/apiErrors'
import { HOME_ROUTE } from '@/router/guards'

/**
 * Reads an emailed link out of the URL, sets the password behind it, and signs the user
 * straight in — the API hands back a token precisely so they are not bounced to a login form
 * seconds after proving who they are.
 *
 * Used by both activation and reset; they differ only in which endpoint the token is spent on.
 */
export function useSetPasswordFlow(mode: SetPasswordMode) {
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const toast = useApiToast()
  const { mutateAsync, isLoading } = useSetPasswordMutation(mode)

  const failure = shallowRef<unknown>(null)

  /** `null` when the URL is missing pieces — the page then shows a dead-link state. */
  const link = computed(() => {
    const parsed = passwordLinkSchema.safeParse({
      email: route.query.email,
      token: route.query.token,
    })

    return parsed.success ? parsed.data : null
  })

  /**
   * A 422 from these endpoints usually names `token` or `email`, neither of which is a field
   * on this form. `toFormFeedback` folds those into the alert instead of pinning them to
   * inputs the user cannot see or fix.
   */
  const feedback = computed(() =>
    failure.value === null ? NO_FEEDBACK : toFormFeedback(failure.value, SET_PASSWORD_FIELDS),
  )

  /** Once the link itself is rejected, retyping a password cannot help — offer a new link. */
  const isLinkRejected = computed(() => feedback.value.message !== null)

  async function submit(form: SetPasswordForm) {
    if (link.value === null) {
      return
    }

    failure.value = null

    let result
    try {
      result = await mutateAsync({ ...link.value, ...form })
    } catch (error) {
      failure.value = error
      return
    }

    session.start(result.data.user, result.data.token)
    toast.success(result.message)

    await router.replace({ name: HOME_ROUTE })
  }

  return { link, submit, isLoading, feedback, isLinkRejected }
}
