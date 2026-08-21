import { http } from '@/lib/axios'
import { apiResponseSchema, messageOnlySchema } from '@/features/shared/schemas/api'
import { authenticatedUserSchema } from '@/features/shared/schemas/user'
import type { ForgotPasswordRequest, SetPasswordRequest } from '@/features/auth/schemas/password'

/**
 * The two flows that start in an email: activating a new account and resetting a forgotten
 * password. Both end with a bearer token, so the user is signed in on the spot instead of
 * being sent back to the login form.
 */

/**
 * `POST /auth/forgot-password` — always 200, whether or not the address has an account.
 * Do not try to read anything about the account out of the answer, and do not show anything
 * that would: this endpoint is what stops it becoming an account-enumeration oracle.
 * Throttled to 5 requests per minute per IP.
 */
export async function forgotPassword(request: ForgotPasswordRequest) {
  const { data } = await http.post('/auth/forgot-password', request)

  return messageOnlySchema.parse(data)
}

/** `POST /auth/activate-account` — for an account that has never been activated. */
export async function activateAccount(request: SetPasswordRequest) {
  const { data } = await http.post('/auth/activate-account', request)

  return apiResponseSchema(authenticatedUserSchema).parse(data)
}

/**
 * `POST /auth/reset-password` — for an account that already was. Also revokes every token
 * issued before the reset, so other devices are signed out.
 *
 * Both endpoints answer 422 when the link is expired, already used, or not that account's —
 * without saying which of the three. Show the message and offer a fresh link.
 */
export async function resetPassword(request: SetPasswordRequest) {
  const { data } = await http.post('/auth/reset-password', request)

  return apiResponseSchema(authenticatedUserSchema).parse(data)
}
