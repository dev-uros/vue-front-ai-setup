import { describe, it, expect, vi } from 'vitest'
import type { User } from '@/features/shared/schemas/user'
import {
  userRowActions,
  type UserRowHandlers,
  type Viewer,
} from '@/features/users/utils/rowActions'
import {
  adminUser,
  deactivatedUser,
  pendingUser,
  plainUser,
} from '@/features/shared/__tests__/fixtures'

const ADMIN: Viewer = { id: adminUser.id, isAdmin: true }
const PLAIN: Viewer = { id: plainUser.id, isAdmin: false }

type Handler = (user: User) => void

function handlers(): UserRowHandlers {
  return {
    edit: vi.fn<Handler>(),
    changeRole: vi.fn<Handler>(),
    deactivate: vi.fn<Handler>(),
    reactivate: vi.fn<Handler>(),
    resendActivation: vi.fn<Handler>(),
  }
}

function labels(user = plainUser, viewer = ADMIN): string[] {
  return userRowActions(user, viewer, handlers())
    .flat()
    .map((item) => String(item.label))
}

describe('userRowActions', () => {
  it('gives a plain user nothing but the way to the detail page', () => {
    expect(labels(adminUser, PLAIN)).toEqual(['Detalji naloga'])
  })

  it('gives an admin the full set for somebody else', () => {
    expect(labels()).toEqual([
      'Detalji naloga',
      'Izmeni podatke',
      'Promeni ulogu',
      'Isključi nalog',
    ])
  })

  /** Both refusals the API makes about oneself, mirrored so the entries are never offered. */
  it('lets an admin edit themselves but not change their own role or switch themselves off', () => {
    const own = labels(adminUser, ADMIN)

    expect(own).toContain('Izmeni podatke')
    expect(own).not.toContain('Promeni ulogu')
    expect(own).not.toContain('Isključi nalog')
  })

  it('offers a fresh invite only while the account has never been activated', () => {
    expect(labels(pendingUser)).toContain('Pošalji aktivacioni link')
    expect(labels(plainUser)).not.toContain('Pošalji aktivacioni link')
  })

  it('swaps switching off for switching on once the account is deactivated', () => {
    const off = labels(deactivatedUser)

    expect(off).toContain('Uključi nalog')
    expect(off).not.toContain('Isključi nalog')
  })

  /** Inviting an account that is switched off would send a link that cannot be used. */
  it('does not offer an invite for a deactivated, unactivated account', () => {
    const stale = { ...deactivatedUser, email_verified_at: null }

    expect(labels(stale)).not.toContain('Pošalji aktivacioni link')
  })

  it('routes the detail entry at this row, by id', () => {
    const [first] = userRowActions(plainUser, ADMIN, handlers())

    expect(first?.[0]?.to).toEqual({ name: 'users-detail', params: { id: plainUser.id } })
  })

  it('hands the row back to the handler it triggers', () => {
    const spies = handlers()
    const groups = userRowActions(pendingUser, ADMIN, spies)
    const invite = groups.flat().find((item) => item.label === 'Pošalji aktivacioni link')

    invite?.onSelect?.(new Event('select'))

    expect(spies.resendActivation).toHaveBeenCalledWith(pendingUser)
  })
})
