import { describe, it, expect } from 'vitest'
import { resetPasswordSchema, resetLinkSchema } from '@/features/auth/schemas/passwordReset'

function messagesFor(password: string, confirmPassword = password): string[] {
  const result = resetPasswordSchema.safeParse({ password, confirmPassword })
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('resetPasswordSchema', () => {
  it('accepts a password meeting every rule', () => {
    expect(messagesFor('Password123!')).toEqual([])
  })

  it.each([
    ['Pass12!', 'At least 8 characters'],
    ['password123!', 'At least one uppercase letter'],
    ['PASSWORD123!', 'At least one lowercase letter'],
    ['PasswordAbc!', 'At least one number'],
    ['Password1234', 'At least one symbol'],
  ])('rejects %s', (password, expected) => {
    expect(messagesFor(password)).toContain(expected)
  })

  it('rejects a mismatched confirmation and points at that field', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Password123!',
      confirmPassword: 'Password123?',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
  })
})

describe('resetLinkSchema', () => {
  it('accepts a complete link', () => {
    expect(resetLinkSchema.safeParse({ email: 'a@b.dev', token: 'tok' }).success).toBe(true)
  })

  it.each([
    ['a missing token', { email: 'a@b.dev', token: undefined }],
    ['an empty token', { email: 'a@b.dev', token: '' }],
    ['a malformed email', { email: 'not-an-email', token: 'tok' }],
    ['repeated query params', { email: ['a@b.dev', 'c@d.dev'], token: 'tok' }],
  ])('rejects %s', (_label, query) => {
    expect(resetLinkSchema.safeParse(query).success).toBe(false)
  })
})
