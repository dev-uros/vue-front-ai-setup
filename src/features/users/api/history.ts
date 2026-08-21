import { http } from '@/lib/axios'
import { paginatedSchema } from '@/features/shared/schemas/api'
import { loginAttemptSchema, userLogSchema } from '@/features/users/schemas/history'

/**
 * The two audit trails, both admin-only and both paginated at 25 rows a page.
 *
 * A plain user reading these would learn who has been looking at whose account and from
 * where, which is why the backend keeps them behind the same admin-only ability.
 */

/** `GET /users/{id}/logs` — what changed on this account, newest first. */
export async function fetchUserLogs(id: number, page: number) {
  const { data } = await http.get(`/users/${id}/logs`, { params: { page } })

  return paginatedSchema(userLogSchema).parse(data)
}

/**
 * `GET /users/{id}/logins` — sign-in attempts for this account, successful and not.
 * Attempts against addresses that have no account are recorded too, but belong to no user
 * and so never appear here.
 */
export async function fetchUserLogins(id: number, page: number) {
  const { data } = await http.get(`/users/${id}/logins`, { params: { page } })

  return paginatedSchema(loginAttemptSchema).parse(data)
}
