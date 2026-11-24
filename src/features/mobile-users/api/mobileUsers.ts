import * as z from 'zod'
import { http } from '@/lib/axios'
import { apiResponseSchema, paginatedSchema } from '@/features/shared/schemas/api'
import {
  mobileUserDeviceSchema,
  mobileUserSchema,
} from '@/features/mobile-users/schemas/mobileUser'

/**
 * The external mobile app's accounts, as the admin panel sees them.
 *
 * Reads are open to anyone signed in; blocking and unblocking are admin-only (403 otherwise).
 * Nothing else about these accounts is editable here — the owner changes their profile from
 * the app.
 */

export interface MobileUsersFilter {
  page: number
  /** Part of the username, first or last name, or email. Matched on the server. */
  search: string
  blocked: boolean | null
}

/** `GET /mobile-users` — paginated, 25 a page, newest first. Deleted accounts are not listed. */
export async function fetchMobileUsers(filter: MobileUsersFilter) {
  const params: Record<string, string | number> = { page: filter.page }

  if (filter.search.trim() !== '') {
    params.search = filter.search.trim()
  }

  if (filter.blocked !== null) {
    params.blocked = filter.blocked ? 1 : 0
  }

  const { data } = await http.get('/mobile-users', { params })

  return paginatedSchema(mobileUserSchema).parse(data)
}

export async function fetchMobileUser(id: number) {
  const { data } = await http.get(`/mobile-users/${id}`)

  return apiResponseSchema(mobileUserSchema).parse(data)
}

/** `GET /mobile-users/{id}/devices` — every phone the account signed in on. Not paginated. */
export async function fetchMobileUserDevices(id: number) {
  const { data } = await http.get(`/mobile-users/${id}/devices`)

  return apiResponseSchema(z.array(mobileUserDeviceSchema)).parse(data)
}

/**
 * `POST /mobile-users/{id}/block` — signs the account out of every phone and refuses it until
 * it is unblocked. Blocking a blocked account changes nothing.
 */
export async function blockMobileUser(id: number) {
  const { data } = await http.post(`/mobile-users/${id}/block`)

  return apiResponseSchema(mobileUserSchema).parse(data)
}

/** `POST /mobile-users/{id}/unblock` — the person signs in again; old sessions stay revoked. */
export async function unblockMobileUser(id: number) {
  const { data } = await http.post(`/mobile-users/${id}/unblock`)

  return apiResponseSchema(mobileUserSchema).parse(data)
}
