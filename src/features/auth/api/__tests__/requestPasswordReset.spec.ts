import { describe, it, expect } from 'vitest'
import { requestPasswordReset } from '@/features/auth/api/requestPasswordReset'

describe('requestPasswordReset', () => {
  it('returns a reset link carrying the address and a token', async () => {
    const { resetUrl } = await requestPasswordReset({ email: 'ana.kovac@fifthguild.dev' })
    const query = new URLSearchParams(resetUrl.split('?')[1])

    expect(resetUrl.startsWith('/auth/reset-password?')).toBe(true)
    expect(query.get('email')).toBe('ana.kovac@fifthguild.dev')
    expect(query.get('token')).toBeTruthy()
  })

  it('answers the same way for an address with no account, so accounts cannot be enumerated', async () => {
    const known = await requestPasswordReset({ email: 'ana.kovac@fifthguild.dev' })
    const unknown = await requestPasswordReset({ email: 'ne.postoji@fifthguild.dev' })

    expect(Object.keys(unknown)).toEqual(Object.keys(known))
    expect(unknown.resetUrl.startsWith('/auth/reset-password?')).toBe(true)
  })

  it('issues a different token each time', async () => {
    const first = await requestPasswordReset({ email: 'ana.kovac@fifthguild.dev' })
    const second = await requestPasswordReset({ email: 'ana.kovac@fifthguild.dev' })

    expect(first.resetUrl).not.toBe(second.resetUrl)
  })
})
