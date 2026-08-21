import { useToast } from '@nuxt/ui/composables/useToast'
import { isApiError } from '@/lib/axios'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'

/**
 * Toasts for API results.
 *
 * Both directions show the backend's own `message`. That is not laziness: those strings are
 * written for the end user, in Serbian, and describe what actually happened on the server —
 * anything we invent here would be a guess layered on top of the real answer.
 */
export function useApiToast() {
  const toast = useToast()

  function success(message: string) {
    toast.add({ title: message, color: 'success', icon: 'i-lucide-circle-check' })
  }

  function error(cause: unknown) {
    toast.add({
      title: toDisplayMessage(cause),
      // A 500 is the one case where the message cannot say anything useful, so the request id
      // goes with it — that is what the backend team needs to find the request in Grafana.
      description:
        isApiError(cause) && cause.status >= 500 && cause.requestId
          ? `ID zahteva: ${cause.requestId}`
          : undefined,
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }

  return { success, error }
}
