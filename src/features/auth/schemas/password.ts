import * as z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.email('Unesite ispravnu email adresu'),
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>

/**
 * Who is setting a password and the proof they may. Both come off the query string of an
 * emailed link, which is an external boundary like any other, so they are parsed, not trusted.
 * Never assemble such a link by hand — the token only exists in the email.
 */
export const passwordLinkSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
})

export type PasswordLink = z.infer<typeof passwordLinkSchema>

/**
 * The backend's policy, restated so the user is told before a round trip instead of after.
 * One check per rule, so the form can name the rule that failed.
 *
 * The one rule that cannot be checked here is the last one: the API also refuses passwords
 * found in known breach corpora, which only it can look up. That comes back as a 422.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Najmanje 8 karaktera')
  .regex(/[A-Z]/, 'Bar jedno veliko slovo')
  .regex(/[a-z]/, 'Bar jedno malo slovo')
  .regex(/[0-9]/, 'Bar jedan broj')
  .regex(/[^A-Za-z0-9]/, 'Bar jedan simbol')

/**
 * Field names are the API's (`password_confirmation`, not `confirmPassword`) so a 422 lands
 * on the field it names without a lookup table in between.
 */
export const setPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Potvrdite novu lozinku'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Lozinke se ne poklapaju',
    path: ['password_confirmation'],
  })

export type SetPasswordForm = z.infer<typeof setPasswordSchema>

export const SET_PASSWORD_FIELDS = ['password', 'password_confirmation'] as const

/** What the API needs: the form fields plus the link the user arrived with. */
export type SetPasswordRequest = PasswordLink & SetPasswordForm

/** Drives the requirement checklist under the password field. */
export const PASSWORD_RULES = [
  { label: 'Najmanje 8 karaktera', test: (value: string) => value.length >= 8 },
  { label: 'Jedno veliko slovo', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Jedno malo slovo', test: (value: string) => /[a-z]/.test(value) },
  { label: 'Jedan broj', test: (value: string) => /[0-9]/.test(value) },
  { label: 'Jedan simbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const
