import type { FormError } from '@nuxt/ui'
import { isApiError } from '@/lib/axios'

/**
 * How a failed request should be shown on a form.
 *
 * The API answers a 422 with per-field messages, which belong under the fields they name. The
 * catch is that some of those fields are not on screen: an expired activation link fails on
 * `token`, and attaching a message to a field nobody can see means the user is told nothing.
 * So anything that does not match a field of this form is folded into `message` instead,
 * which the form renders as an alert.
 */
export interface FormFeedback {
  /** Rendered in an alert above the form. `null` when every message found a field. */
  message: string | null
  /** Attached to form fields by name. */
  fields: FormError[]
}

export const NO_FEEDBACK: FormFeedback = { message: null, fields: [] }

/** Last resort: a network failure, or something thrown that is not an API error at all. */
const GENERIC_MESSAGE = 'Došlo je do neočekivane greške. Pokušajte ponovo.'

export function toFormFeedback(error: unknown, formFields: readonly string[]): FormFeedback {
  if (error === null || error === undefined) {
    return NO_FEEDBACK
  }

  if (!isApiError(error)) {
    return { message: GENERIC_MESSAGE, fields: [] }
  }

  if (error.errors === undefined) {
    return { message: error.message, fields: [] }
  }

  const fields: FormError[] = []
  const orphaned: string[] = []

  for (const [name, messages] of Object.entries(error.errors)) {
    for (const message of messages) {
      if (formFields.includes(name)) {
        fields.push({ name, message })
      } else {
        orphaned.push(message)
      }
    }
  }

  return {
    // Laravel's own 422 `message` only restates the first field error, so it is dropped when
    // the fields carry the detail themselves.
    message: orphaned.length > 0 ? orphaned.join(' ') : fields.length > 0 ? null : error.message,
    fields,
  }
}

/** For places with no form to attach anything to — a toast, an alert on a detail page. */
export function toDisplayMessage(error: unknown): string {
  return isApiError(error) ? error.message : GENERIC_MESSAGE
}
