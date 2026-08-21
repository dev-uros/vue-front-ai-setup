import * as z from 'zod'

/** The two audit trails behind a user: what was changed, and who tried to sign in. */

const timestamp = z.iso.datetime({ offset: true })

/**
 * The event is parsed as a plain string rather than an enum. The backend adds a case whenever
 * a new use case touches a user, and an audit trail that refuses to render because it met an
 * event this build has not heard of is worse than one showing an unfamiliar name.
 * `USER_LOG_EVENT_LABELS` translates the ones we know and falls back to the raw value.
 */
export const userLogSchema = z.object({
  id: z.number().int(),
  event: z.string(),
  /** Column-level diff. Both are `null` for events that changed nothing, such as a resent invite. */
  old_values: z.record(z.string(), z.unknown()).nullable(),
  new_values: z.record(z.string(), z.unknown()).nullable(),
  /**
   * `null` means the system did it — a seeder, a command, the scheduler — not that it is
   * unknown. Required, so a missing key is a broken response rather than an unattributed
   * action: parsed as `nullable` and not `nullish` on purpose, because silently rendering
   * "the system did it" for something a person did is the one wrong answer an audit trail
   * must not give.
   */
  actor: z
    .object({
      id: z.number().int(),
      name: z.string(),
      surname: z.string(),
      email: z.email(),
    })
    .nullable(),
  ip_address: z.string().nullable(),
  created_at: timestamp,
})

export type UserLog = z.infer<typeof userLogSchema>

export const USER_LOG_EVENT_LABELS: Record<string, string> = {
  'user.created': 'Nalog kreiran',
  'user.updated': 'Podaci izmenjeni',
  'user.role_changed': 'Uloga promenjena',
  'user.deactivated': 'Nalog isključen',
  'user.reactivated': 'Nalog uključen',
  'user.activation_link_sent': 'Aktivacioni link poslat',
  'user.activated': 'Nalog aktiviran',
  'user.password_reset': 'Lozinka promenjena',
}

/**
 * How a sign-in attempt ended. "No such user" and "wrong password" are one outcome on
 * purpose: recording them apart would put the very distinction the login endpoint refuses to
 * reveal into a table somebody will one day expose.
 */
export const loginOutcomeSchema = z.enum([
  'succeeded',
  'invalid_credentials',
  'account_deactivated',
])

export type LoginOutcome = z.infer<typeof loginOutcomeSchema>

export const LOGIN_OUTCOME_LABELS: Record<LoginOutcome, string> = {
  succeeded: 'Uspešna prijava',
  invalid_credentials: 'Pogrešni podaci',
  account_deactivated: 'Nalog isključen',
}

export const loginAttemptSchema = z.object({
  id: z.number().int(),
  outcome: loginOutcomeSchema,
  /**
   * What was typed, which for a failed attempt is not necessarily this user's current
   * address — it is what the person at the keyboard believed it to be.
   */
  email: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: timestamp,
})

export type LoginAttempt = z.infer<typeof loginAttemptSchema>
