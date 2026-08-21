/**
 * Display formatting shared by every feature.
 *
 * `Intl` is asked for the locale once and reused: constructing a formatter is the expensive
 * part, and these run per table cell.
 */

const LOCALE = 'sr-Latn-RS'

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })

/** ISO 8601 in, something a person reads out. `null` in, an em dash out. */
export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFormatter.format(new Date(iso)) : '—'
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormatter.format(new Date(iso)) : '—'
}
