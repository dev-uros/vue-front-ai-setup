/**
 * The seeded demo accounts (`make demo` in the backend). Every one of them has the password
 * below, and the state each is in is what the screens under test are meant to show.
 */
export const ACCOUNTS = {
  admin: { email: 'uros.minic@fifthguild.com', name: 'Uroš', surname: 'Minić' },
  plain: { email: 'ana.nikolic@fifthguild.com', name: 'Ana', surname: 'Nikolić' },
  /** Invited, never activated — two reminders sent. */
  pending: { email: 'jovana.stankovic@fifthguild.com', name: 'Jovana', surname: 'Stanković' },
  /** Switched off, with a sign-in attempt recorded after the fact. */
  deactivated: { email: 'nikola.ilic@fifthguild.com', name: 'Nikola', surname: 'Ilić' },
} as const

export type AccountRole = keyof typeof ACCOUNTS

export const PASSWORD = 'password'

export const API_URL = process.env.VITE_API_URL ?? 'http://localhost:8000/api'

/** Where `lib/axios` keeps the bearer token. */
export const TOKEN_STORAGE_KEY = 'app.auth.token'
