import { computed } from 'vue'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import {
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useResendActivationMutation,
} from '@/features/users/query/useUserMutations'

/**
 * The row actions that need no form: switch an account off, switch it back on, resend an
 * invite. Each is one call whose only visible result is a message, so all three are handled
 * the same way — run it, show what the API said, whichever way it went.
 *
 * The failures are worth expecting rather than treating as bugs: an admin may not deactivate
 * their own account, and a plain user may not do any of this. Both come back as a 403 with a
 * message that explains itself, which is exactly what the toast shows.
 */
export function useUserActions() {
  const toast = useApiToast()
  const deactivation = useDeactivateUserMutation()
  const reactivation = useReactivateUserMutation()
  const activationEmail = useResendActivationMutation()

  const isLoading = computed(
    () =>
      deactivation.isLoading.value ||
      reactivation.isLoading.value ||
      activationEmail.isLoading.value,
  )

  async function run(action: () => Promise<{ message: string }>): Promise<boolean> {
    try {
      const result = await action()
      toast.success(result.message)
      return true
    } catch (error) {
      toast.error(error)
      return false
    }
  }

  return {
    isLoading,
    deactivate: (id: number) => run(() => deactivation.mutateAsync(id)),
    reactivate: (id: number) => run(() => reactivation.mutateAsync(id)),
    resendActivation: (id: number) => run(() => activationEmail.mutateAsync(id)),
  }
}
