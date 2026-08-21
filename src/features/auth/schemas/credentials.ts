import * as z from 'zod'

/**
 * The sign-in form. No password policy here on purpose: this field carries an *existing*
 * password, and rejecting it locally for being short would only stop accounts created before
 * the current rules from signing in. The API answers 401 when the pair is wrong.
 */
export const credentialsSchema = z.object({
  email: z.email('Unesite ispravnu email adresu'),
  password: z.string().min(1, 'Unesite lozinku'),
})

export type Credentials = z.infer<typeof credentialsSchema>

/** The fields this form actually renders — see `toFormFeedback`. */
export const CREDENTIALS_FIELDS = ['email', 'password'] as const
