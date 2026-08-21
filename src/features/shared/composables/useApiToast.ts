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
      // A 5xx has no useful message to give, and a call that never reached the server has no
      // message from it at all. Those are the two the backend team traces in Grafana, so the
      // request id goes with them — status 0 included, which is why the client generates it.
      description:
        isApiError(cause) && (cause.status >= 500 || cause.status === 0) && cause.requestId
          ? `ID zahteva: ${cause.requestId}`
          : undefined,
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }

  /**
   * A refusal decided here, before any request went out — a file the API would have rejected
   * anyway. Same toast as `error`, but the wording is ours: there is no server answer to quote
   * when the call was never made.
   */
  function failure(message: string) {
    toast.add({ title: message, color: 'error', icon: 'i-lucide-circle-alert' })
  }

  return { success, error, failure }
}
