import { userSchema, type User } from '@/features/shared/schemas/user'
import type { ResetPasswordRequest } from '@/features/auth/schemas/passwordReset'
import { findAccount } from '@/features/auth/api/login'

/**
 * Mock "set a new password" endpoint. It accepts any link that carries a valid email and a
 * non-empty token — the real one verifies the token server-side and rejects expired ones.
 *
 * Known demo accounts come back as themselves. Any other address gets a user synthesised from
 * the email so the flow can be tried with an arbitrary link; that branch exists only because
 * there is no backend, and disappears with the first real API call.
 */
const NETWORK_DELAY_MS = 400

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function syntheticUser(email: string): User {
  const [localPart = 'new'] = email.split('@')
  const [first = localPart, last = 'User'] = localPart.split(/[._-]/)

  return {
    id: `usr_${localPart}`,
    firstName: capitalize(first),
    lastName: capitalize(last),
    email,
    company: 'Fifth Guild',
  }
}

export async function resetPassword({ email, password }: ResetPasswordRequest): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  void password // the mock has nowhere to store it

  const account = findAccount(email)

  return userSchema.parse(account?.user ?? syntheticUser(email))
}
