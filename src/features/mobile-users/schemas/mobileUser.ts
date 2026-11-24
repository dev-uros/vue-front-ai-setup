import * as z from 'zod'

/**
 * An account of the project's external mobile app — a customer, not a staff member. A
 * separate table on the backend (`mobile_users`) with its own sign-in, so it shares nothing
 * with `features/shared/schemas/user`: no role, no password, a username instead of a surname.
 */
export const mobileUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  /** What the app greets the person with: their name if they chose to show it, else the username. */
  display_name: z.string(),
  email: z.string(),
  avatar_url: z.string().nullable(),
  locale: z.enum(['sr', 'en']),
  has_google: z.boolean(),
  has_apple: z.boolean(),
  /** An App Store / Play review account (`mobile:demo-accounts`). */
  is_demo: z.boolean(),
  blocked_at: z.string().nullable(),
  last_seen_at: z.string().nullable(),
  /** Present in the list only. */
  devices_count: z.number().int().optional(),
  created_at: z.string(),
})

export type MobileUser = z.infer<typeof mobileUserSchema>

export const mobileUserDeviceSchema = z.object({
  id: z.number().int(),
  device_id: z.string(),
  name: z.string().nullable(),
  platform: z.enum(['ios', 'android']),
  operating_system: z.string().nullable(),
  manufacturer: z.string().nullable(),
  os_version: z.string().nullable(),
  push_notifications_enabled: z.boolean(),
  /** Somebody is signed in on this phone right now. */
  signed_in: z.boolean(),
  last_seen_at: z.string(),
  created_at: z.string(),
})

export type MobileUserDevice = z.infer<typeof mobileUserDeviceSchema>

export type MobileUserStatus = 'active' | 'blocked'

export function mobileUserStatus(user: Pick<MobileUser, 'blocked_at'>): MobileUserStatus {
  return user.blocked_at === null ? 'active' : 'blocked'
}

/** "Ana Anić" when a name was given, otherwise null — the username is shown beside it anyway. */
export function mobileUserPersonalName(
  user: Pick<MobileUser, 'first_name' | 'last_name'>,
): string | null {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()

  return name === '' ? null : name
}
