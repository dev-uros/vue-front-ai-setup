import { describe, it, expect } from 'vitest'
import { canManageAvatar } from '@/features/users/utils/avatar'
import { adminUser, plainUser } from '@/features/shared/__tests__/fixtures'

describe('canManageAvatar', () => {
  it('lets an admin manage anybody', () => {
    expect(canManageAvatar({ id: adminUser.id, isAdmin: true }, plainUser)).toBe(true)
  })

  it('lets a plain user manage their own', () => {
    expect(canManageAvatar({ id: plainUser.id, isAdmin: false }, plainUser)).toBe(true)
  })

  /** The one write a plain user gets, and it stops at their own account — anything else is 403. */
  it('refuses a plain user somebody else', () => {
    expect(canManageAvatar({ id: plainUser.id, isAdmin: false }, adminUser)).toBe(false)
  })

  it('refuses a viewer with no session at all', () => {
    expect(canManageAvatar({ id: undefined, isAdmin: false }, plainUser)).toBe(false)
  })
})
