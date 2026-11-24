import { computed } from 'vue'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import {
  useBlockMobileUserMutation,
  useUnblockMobileUserMutation,
} from '@/features/mobile-users/query/useMobileUserMutations'

/**
 * Block and unblock: one call each whose only visible result is the API's message, shown
 * whichever way it went — a plain user gets the 403's own explanation.
 */
export function useMobileUserActions() {
  const toast = useApiToast()
  const blocking = useBlockMobileUserMutation()
  const unblocking = useUnblockMobileUserMutation()

  const isLoading = computed(() => blocking.isLoading.value || unblocking.isLoading.value)

  async function run(action: () => Promise<{ message: string }>): Promise<boolean> {
    try {
      toast.success((await action()).message)
      return true
    } catch (error) {
      toast.error(error)
      return false
    }
  }

  return {
    isLoading,
    block: (id: number) => run(() => blocking.mutateAsync(id)),
    unblock: (id: number) => run(() => unblocking.mutateAsync(id)),
  }
}
