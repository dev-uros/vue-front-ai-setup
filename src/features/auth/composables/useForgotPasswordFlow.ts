import { computed, shallowRef } from 'vue'
import { useForgotPasswordMutation } from '@/features/auth/query/useForgotPasswordMutation'
import type { ForgotPasswordRequest } from '@/features/auth/schemas/password'
import { toFormFeedback, NO_FEEDBACK } from '@/features/shared/utils/apiErrors'

/**
 * Requests a reset link.
 *
 * There is deliberately no notion of "no such account" here: the endpoint answers the same
 * 200 either way, and its `message` is phrased to match ("if an account with this address
 * exists…"). Showing that message as it arrives is what keeps the form from telling an
 * attacker which addresses are registered.
 */
export function useForgotPasswordFlow() {
  const { mutateAsync, isLoading } = useForgotPasswordMutation()

  const failure = shallowRef<unknown>(null)
  /** The API's confirmation, and the flag that swaps the form for it. */
  const confirmation = shallowRef<string | null>(null)
  const submittedEmail = shallowRef<string | null>(null)

  const feedback = computed(() =>
    failure.value === null ? NO_FEEDBACK : toFormFeedback(failure.value, ['email']),
  )

  async function submit(request: ForgotPasswordRequest) {
    failure.value = null

    let result
    try {
      result = await mutateAsync(request)
    } catch (error) {
      failure.value = error
      return
    }

    submittedEmail.value = request.email
    confirmation.value = result.message
  }

  return { submit, isLoading, feedback, confirmation, submittedEmail }
}
