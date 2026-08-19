import { describe, it, expect } from 'vitest'
import { resetPassword } from '@/features/auth/api/resetPassword'

const link = { token: 'tok_123', password: 'Password123!' }

describe('resetPassword', () => {
  it('returns the existing account for a known address', async () => {
    const user = await resetPassword({ ...link, email: 'ana.kovac@fifthguild.dev' })

    expect(user).toMatchObject({ id: 'usr_1', firstName: 'Ana', lastName: 'Kovač' })
  })

  it('synthesises a user for an unknown address so any demo link works', async () => {
    const user = await resetPassword({ ...link, email: 'marko.markovic@example.com' })

    expect(user).toMatchObject({
      firstName: 'Marko',
      lastName: 'Markovic',
      email: 'marko.markovic@example.com',
    })
  })
})
