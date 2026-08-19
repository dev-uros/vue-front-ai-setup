import * as z from 'zod'

export const passwordResetRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

/**
 * The reset link carries who is resetting and the proof they may. Both come off the URL, which
 * is an external boundary like any other, so they are parsed rather than trusted.
 */
export const resetLinkSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
})

export type ResetLink = z.infer<typeof resetLinkSchema>

/** Each rule is its own check so the form can report exactly which one failed. */
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one symbol')

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

/** What the API needs: the form fields plus the link the user arrived with. */
export type ResetPasswordRequest = ResetLink & { password: string }

/** Drives the requirement checklist under the password field. */
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'One symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const
