import { computed, shallowRef } from 'vue'
import { usePasswordResetMutation } from '@/features/auth/query/usePasswordResetMutation'
import type { PasswordResetRequest } from '@/features/auth/schemas/passwordReset'

/**
 * Requests a reset link and remembers which address it went to, so the page can swap the form
 * for a confirmation. Deliberately has no notion of "unknown account" — see
 * `api/requestPasswordReset.ts`.
 */
export function usePasswordResetFlow() {
  const { mutateAsync, isLoading, error } = usePasswordResetMutation()
  const submittedEmail = shallowRef<string | null>(null)
  /** Demo only: the link a real service would email. See `api/requestPasswordReset.ts`. */
  const resetUrl = shallowRef<string | null>(null)

  const errorMessage = computed(() =>
    error.value ? 'We could not send the email. Please try again.' : null,
  )

  async function submit(request: PasswordResetRequest) {
    let result
    try {
      result = await mutateAsync(request)
    } catch {
      return
    }

    submittedEmail.value = request.email
    resetUrl.value = result.resetUrl
  }

  return { submit, isLoading, errorMessage, submittedEmail, resetUrl }
}
