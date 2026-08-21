import * as z from 'zod'

/**
 * A user account, exactly as the API returns it.
 *
 * Field names are the backend's (`name`/`surname`, `snake_case` timestamps) and are kept that
 * way on purpose: a translation layer between here and the API would have to be maintained in
 * both directions for no gain, and it hides which fields a request actually has to send.
 *
 * Lives in `shared` because both `auth` (who is signed in) and `users` (the admin screens)
 * are built on it, and the layouts render it.
 */

/**
 * Two roles and that is all: `admin` may do everything the API offers, `user` may only read.
 * Hiding a button a `user` may not press is a courtesy — the API refuses with 403 regardless.
 */
export const userRoleSchema = z.enum(['admin', 'user'])

export type UserRole = z.infer<typeof userRoleSchema>

/** Timestamps arrive as ISO 8601 with an offset (`2026-08-19T13:42:29+00:00`). */
const timestamp = z.iso.datetime({ offset: true })

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  surname: z.string(),
  email: z.email(),
  role: userRoleSchema,
  /** `null` means the account works; a date means it has been switched off. */
  deactivated_at: timestamp.nullable(),
  /** `null` means the account was never activated — the invite link is still unused. */
  email_verified_at: timestamp.nullable(),
  created_at: timestamp,
  updated_at: timestamp,
})

export type User = z.infer<typeof userSchema>

/** What `login`, `activate-account` and `reset-password` all hand back. */
export const authenticatedUserSchema = z.object({
  user: userSchema,
  token: z.string().min(1),
})

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>

/** The three states an account can be in, in the order the UI cares about them. */
export type UserStatus = 'deactivated' | 'pending' | 'active'

export function userStatus(user: User): UserStatus {
  if (user.deactivated_at !== null) {
    return 'deactivated'
  }

  return user.email_verified_at === null ? 'pending' : 'active'
}

export function userFullName(user: Pick<User, 'name' | 'surname'>): string {
  return `${user.name} ${user.surname}`
}

export function userInitials(user: Pick<User, 'name' | 'surname'>): string {
  return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase()
}
