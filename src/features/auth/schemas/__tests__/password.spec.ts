import { describe, it, expect } from 'vitest'
import {
  PASSWORD_RULES,
  passwordLinkSchema,
  passwordSchema,
  setPasswordSchema,
} from '@/features/auth/schemas/password'

describe('passwordSchema', () => {
  it('accepts a password that satisfies every rule', () => {
    expect(passwordSchema.safeParse('Lozinka123!').success).toBe(true)
  })

  it.each([
    ['Kr1!', 'Najmanje 8 karaktera'],
    ['lozinka123!', 'Bar jedno veliko slovo'],
    ['LOZINKA123!', 'Bar jedno malo slovo'],
    ['LozinkaNema!', 'Bar jedan broj'],
    ['Lozinka1234', 'Bar jedan simbol'],
  ])('names the rule %s breaks', (password, expected) => {
    const result = passwordSchema.safeParse(password)

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(expected)
  })

  /** The checklist under the field and the schema must agree, or one of them lies. */
  it('ticks off exactly the rules the schema accepts', () => {
    expect(PASSWORD_RULES.every((rule) => rule.test('Lozinka123!'))).toBe(true)
    expect(PASSWORD_RULES.filter((rule) => rule.test('lozinka')).map((rule) => rule.label)).toEqual(
      ['Jedno malo slovo'],
    )
  })
})

describe('setPasswordSchema', () => {
  it('uses the API field names, so a 422 lands on the right field', () => {
    const result = setPasswordSchema.safeParse({
      password: 'Lozinka123!',
      password_confirmation: 'Lozinka123!',
    })

    expect(result.success).toBe(true)
  })

  it('puts a mismatch on the confirmation field', () => {
    const result = setPasswordSchema.safeParse({
      password: 'Lozinka123!',
      password_confirmation: 'Lozinka124!',
    })

    expect(result.error?.issues[0]?.path).toEqual(['password_confirmation'])
  })
})

describe('passwordLinkSchema', () => {
  it('accepts a link carrying both halves', () => {
    const result = passwordLinkSchema.safeParse({
      email: 'ana.nikolic@fifthguild.com',
      token: 'tok_123',
    })

    expect(result.success).toBe(true)
  })

  /** Query strings are an external boundary: a half-copied link must read as no link at all. */
  it.each([
    [{ email: 'ana.nikolic@fifthguild.com' }],
    [{ token: 'tok_123' }],
    [{ email: 'not-an-email', token: 'tok_123' }],
    [{ email: 'ana.nikolic@fifthguild.com', token: '' }],
  ])('rejects %o', (query) => {
    expect(passwordLinkSchema.safeParse(query).success).toBe(false)
  })
})
