import { http } from '@/lib/axios'
import { apiResponseSchema, messageOnlySchema } from '@/features/shared/schemas/api'
import { authenticatedUserSchema, userSchema } from '@/features/shared/schemas/user'
import type { Credentials } from '@/features/auth/schemas/credentials'

/**
 * Sign-in, sign-out and session restore.
 *
 * Every function returns the parsed envelope rather than just `data`, because `message` is
 * part of the answer: it is written for the end user and is what the UI shows.
 */

/** `POST /auth/login` — 401 when the pair is wrong, 403 when the account is switched off. */
export async function login(credentials: Credentials) {
  const { data } = await http.post('/auth/login', credentials)

  return apiResponseSchema(authenticatedUserSchema).parse(data)
}

/**
 * `POST /auth/logout` — revokes only the token it was sent with. Signing out here leaves the
 * user signed in on their other devices, which is deliberate.
 */
export async function logout() {
  const { data } = await http.post('/auth/logout')

  return messageOnlySchema.parse(data)
}

/**
 * `GET /auth/me` — the account behind the stored token, read fresh from the database.
 * A 401 means the token is dead and the session cannot be restored.
 */
export async function me() {
  const { data } = await http.get('/auth/me')

  return apiResponseSchema(userSchema).parse(data)
}
