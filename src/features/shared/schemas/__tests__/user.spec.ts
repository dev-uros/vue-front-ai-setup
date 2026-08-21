import { describe, it, expect } from 'vitest'
import {
  userSchema,
  authenticatedUserSchema,
  userStatus,
  userFullName,
  userInitials,
} from '@/features/shared/schemas/user'
import {
  adminUser,
  deactivatedUser,
  pendingUser,
  plainUser,
} from '@/features/shared/__tests__/fixtures'

/** Verbatim from `POST /auth/login` against the running backend. */
const LOGIN_RESPONSE = {
  user: {
    id: 1,
    name: 'Uroš',
    surname: 'Minić',
    email: 'uros.minic@fifthguild.com',
    role: 'admin',
    deactivated_at: null,
    email_verified_at: '2026-08-19T13:42:29+00:00',
    created_at: '2026-08-19T13:42:29+00:00',
    updated_at: '2026-08-20T20:14:39+00:00',
  },
  token: '20|YuFzYFl2HhI2Me5cKoLXjVVepDqVlysjmfWX9MSs1f61c9bc',
}

describe('userSchema', () => {
  it('accepts a user exactly as the API returns one', () => {
    expect(userSchema.parse(adminUser)).toEqual(adminUser)
  })

  it('accepts ISO 8601 timestamps with an offset, which is what the API sends', () => {
    expect(
      userSchema.safeParse(makeWith({ created_at: '2026-08-19T13:42:29+02:00' })).success,
    ).toBe(true)
    expect(userSchema.safeParse(makeWith({ created_at: '2026-08-19T13:42:29Z' })).success).toBe(
      true,
    )
  })

  it('rejects a timestamp with no offset at all', () => {
    expect(userSchema.safeParse(makeWith({ created_at: '2026-08-19 13:42:29' })).success).toBe(
      false,
    )
  })

  it('rejects a role the app has no handling for', () => {
    expect(userSchema.safeParse(makeWith({ role: 'superadmin' })).success).toBe(false)
  })

  it('parses the login envelope, token included', () => {
    const parsed = authenticatedUserSchema.parse(LOGIN_RESPONSE)

    expect(parsed.token).toBe(LOGIN_RESPONSE.token)
    expect(parsed.user.id).toBe(1)
  })

  function makeWith(overrides: Record<string, unknown>) {
    return { ...adminUser, ...overrides }
  }
})

describe('userStatus', () => {
  it('reads a verified, switched-on account as active', () => {
    expect(userStatus(plainUser)).toBe('active')
  })

  it('reads an account that was never activated as pending', () => {
    expect(userStatus(pendingUser)).toBe('pending')
  })

  it('reports a deactivated account as deactivated even though it is also verified', () => {
    expect(userStatus(deactivatedUser)).toBe('deactivated')
  })
})

describe('display helpers', () => {
  it('joins name and surname in that order', () => {
    expect(userFullName(plainUser)).toBe('Ana Nikolić')
  })

  it('builds initials from both names, uppercased', () => {
    expect(userInitials(plainUser)).toBe('AN')
  })
})
