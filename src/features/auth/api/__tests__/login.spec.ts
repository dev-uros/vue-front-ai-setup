import { describe, it, expect } from 'vitest'
import { login } from '@/features/auth/api/login'
import { AuthError } from '@/features/auth/api/errors'

describe('login', () => {
  it('returns the user for known credentials', async () => {
    const user = await login({ email: 'ana.kovac@fifthguild.dev', password: 'Password123!' })

    expect(user).toMatchObject({ firstName: 'Ana', email: 'ana.kovac@fifthguild.dev' })
  })

  it('accepts the email in any casing or padding', async () => {
    const user = await login({ email: '  ANA.KOVAC@fifthguild.dev ', password: 'Password123!' })

    expect(user.id).toBe('usr_1')
  })

  it('rejects an unknown account with user-not-found', async () => {
    const attempt = login({ email: 'ne.postoji@fifthguild.dev', password: 'Password123!' })

    await expect(attempt).rejects.toBeInstanceOf(AuthError)
    await expect(attempt).rejects.toMatchObject({ code: 'user-not-found' })
  })

  it('rejects a wrong password with invalid-password', async () => {
    const attempt = login({ email: 'ana.kovac@fifthguild.dev', password: 'not-the-password' })

    await expect(attempt).rejects.toMatchObject({ code: 'invalid-password' })
  })
})
