import { userSchema, type User } from '@/features/shared/schemas/user'
import type { Credentials } from '@/features/auth/schemas/credentials'
import { AuthError } from '@/features/auth/api/errors'

/**
 * Mock auth backend — deliberately no HTTP yet.
 *
 * ## Demo credentials
 *
 * | Email                        | Password        | Result                              |
 * | ---------------------------- | --------------- | ----------------------------------- |
 * | `ana.kovac@fifthguild.dev`   | `Password123!`  | signs in, lands on `/`              |
 * | `nikola.peric@fifthguild.dev`| `Password123!`  | signs in, lands on `/`              |
 * | `ne.postoji@fifthguild.dev`  | anything        | `AuthError('user-not-found')`       |
 * | `ana.kovac@fifthguild.dev`   | anything else   | `AuthError('invalid-password')`     |
 *
 * ## Swapping in a real backend
 *
 * Replace the body below with a call to the axios instance from `@/lib/axios` and parse the
 * response with `userSchema`. The signature — `(credentials) => Promise<User>` — stays the
 * same, so `query/useLoginMutation` and every component above it are untouched.
 */

/** Simulated round-trip, so loading states are actually visible while clicking through. */
const NETWORK_DELAY_MS = 400

interface MockAccount {
  password: string
  user: User
}

const ACCOUNTS: Record<string, MockAccount> = {
  'ana.kovac@fifthguild.dev': {
    password: 'Password123!',
    user: {
      id: 'usr_1',
      firstName: 'Ana',
      lastName: 'Kovač',
      email: 'ana.kovac@fifthguild.dev',
      company: 'Fifth Guild',
    },
  },
  'nikola.peric@fifthguild.dev': {
    password: 'Password123!',
    user: {
      id: 'usr_2',
      firstName: 'Nikola',
      lastName: 'Perić',
      email: 'nikola.peric@fifthguild.dev',
      company: 'Fifth Guild',
    },
  },
}

/** Shared with `resetPassword`, which needs the same account lookup. */
export function findAccount(email: string): MockAccount | undefined {
  return ACCOUNTS[email.trim().toLowerCase()]
}

export async function login({ email, password }: Credentials): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const account = findAccount(email)

  if (!account) {
    throw new AuthError('user-not-found', `No account exists for ${email}.`)
  }

  if (account.password !== password) {
    throw new AuthError('invalid-password', 'That password does not match this account.')
  }

  return userSchema.parse(account.user)
}
