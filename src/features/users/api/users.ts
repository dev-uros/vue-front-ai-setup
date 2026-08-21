import * as z from 'zod'
import { http } from '@/lib/axios'
import { apiResponseSchema, messageOnlySchema } from '@/features/shared/schemas/api'
import { userSchema } from '@/features/shared/schemas/user'
import type {
  ChangeRoleForm,
  CreateUserForm,
  UpdateUserForm,
} from '@/features/users/schemas/userForm'

/**
 * User administration.
 *
 * Reads are open to anyone signed in; every write below is admin-only and answers 403
 * otherwise — including two rules that catch admins too: nobody may change their own role,
 * and nobody may switch off their own account.
 */

/** `GET /users` — not paginated. Returns everyone, sorted by name then surname. */
export async function fetchUsers() {
  const { data } = await http.get('/users')

  return apiResponseSchema(z.array(userSchema)).parse(data)
}

/** `GET /users/{id}`. A non-numeric id is a 404 before the request even enters the app. */
export async function fetchUser(id: number) {
  const { data } = await http.get(`/users/${id}`)

  return apiResponseSchema(userSchema).parse(data)
}

/**
 * `POST /users` — the backend generates a random password and emails an activation link, so
 * the new account starts unactivated (`email_verified_at: null`) rather than unusable.
 */
export async function createUser(form: CreateUserForm) {
  const { data } = await http.post('/users', form)

  return apiResponseSchema(userSchema).parse(data)
}

/** `PUT /users/{id}` — all fields required; only name, surname and email are editable. */
export async function updateUser(id: number, form: UpdateUserForm) {
  const { data } = await http.put(`/users/${id}`, form)

  return apiResponseSchema(userSchema).parse(data)
}

/** `PUT /users/{id}/role`. An admin changing their own role is a 403, by design. */
export async function updateUserRole(id: number, form: ChangeRoleForm) {
  const { data } = await http.put(`/users/${id}/role`, form)

  return apiResponseSchema(userSchema).parse(data)
}

/**
 * `POST /users/{id}/deactivate` — not a delete. The row stays and keeps showing in the list
 * with `deactivated_at` filled in; the account's tokens are revoked the same instant.
 * Deactivating yourself is a 403.
 */
export async function deactivateUser(id: number) {
  const { data } = await http.post(`/users/${id}/deactivate`)

  return apiResponseSchema(userSchema).parse(data)
}

export async function reactivateUser(id: number) {
  const { data } = await http.post(`/users/${id}/reactivate`)

  return apiResponseSchema(userSchema).parse(data)
}

/**
 * `POST /users/{id}/resend-activation` — mints a fresh token and queues the email. The only
 * way an activation link can be replaced, since the user cannot request one themselves.
 */
export async function resendActivation(id: number) {
  const { data } = await http.post(`/users/${id}/resend-activation`)

  return messageOnlySchema.parse(data)
}

/**
 * `POST /users/{id}/avatar` — `multipart/form-data`, field name `avatar`, and a `POST` even
 * though it replaces: there is no `PUT`. Axios sets the multipart boundary itself once the
 * body is a `FormData`, so the content type must not be spelled out here.
 *
 * The image comes back re-encoded to a 512x512 WebP under a fresh random name, so the
 * returned `avatar_url` is the only correct one — the previous file is already deleted.
 *
 * This and `removeUserAvatar` are the only writes a plain user may make, and only on their
 * own account; somebody else's is a 403.
 */
export async function updateUserAvatar(id: number, file: File) {
  const body = new FormData()
  body.append('avatar', file)

  const { data } = await http.post(`/users/${id}/avatar`, body)

  return apiResponseSchema(userSchema).parse(data)
}

/** `DELETE /users/{id}/avatar`. Removing one from an account that has none is also a 200. */
export async function removeUserAvatar(id: number) {
  const { data } = await http.delete(`/users/${id}/avatar`)

  return apiResponseSchema(userSchema).parse(data)
}
