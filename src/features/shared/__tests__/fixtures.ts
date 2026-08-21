import type { User } from '@/features/shared/schemas/user'

/**
 * Users shaped exactly as the API returns them — snake_case timestamps, ISO 8601 with an
 * offset, numeric ids. Copied from a live response rather than invented, so a schema that
 * drifts from the backend fails here instead of in the browser.
 */
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Uroš',
    surname: 'Minić',
    email: 'uros.minic@fifthguild.com',
    role: 'admin',
    avatar_url: null,
    deactivated_at: null,
    email_verified_at: '2026-08-19T13:42:29+00:00',
    created_at: '2026-08-19T13:42:29+00:00',
    updated_at: '2026-08-20T20:14:39+00:00',
    ...overrides,
  }
}

export const adminUser = makeUser()

export const plainUser = makeUser({
  id: 17,
  name: 'Ana',
  surname: 'Nikolić',
  email: 'ana.nikolic@fifthguild.com',
  role: 'user',
})

/** Has a profile picture. The URL is absolute and always a `.webp` — the backend re-encodes. */
export const avatarUser = makeUser({
  id: 18,
  name: 'Marko',
  surname: 'Marković',
  email: 'marko.markovic@fifthguild.com',
  role: 'user',
  avatar_url: 'http://localhost:8000/storage/avatars/01M0HV19PNJ21PBZWEDTR2056H.webp',
})

/** Invited but never activated: the invite link is still unused. */
export const pendingUser = makeUser({
  id: 19,
  name: 'Jovana',
  surname: 'Stanković',
  email: 'jovana.stankovic@fifthguild.com',
  role: 'user',
  email_verified_at: null,
})

/** Switched off, not deleted — still in the list, tokens revoked. */
export const deactivatedUser = makeUser({
  id: 20,
  name: 'Nikola',
  surname: 'Ilić',
  email: 'nikola.ilic@fifthguild.com',
  role: 'user',
  deactivated_at: '2026-08-13T16:45:00+00:00',
})
