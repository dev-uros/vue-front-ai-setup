import type { PasswordResetRequest } from '@/features/auth/schemas/passwordReset'

/**
 * Mock "send me a reset link" endpoint.
 *
 * It resolves for **every** syntactically valid email, including addresses with no account.
 * That is deliberate: answering differently would turn this form into an account-enumeration
 * oracle, letting anyone probe which emails are registered. The user-facing copy is phrased to
 * match ("if an account exists…").
 *
 * No mail is sent. Instead the link that a real service would email is returned, so the demo
 * can show it and the reset flow stays clickable end to end. A real implementation returns
 * nothing and the token never touches the client.
 */
const NETWORK_DELAY_MS = 400

function mockToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export interface PasswordResetResult {
  /** Relative URL, e.g. `/auth/reset-password?email=…&token=…`. Demo aid only. */
  resetUrl: string
}

export async function requestPasswordReset({
  email,
}: PasswordResetRequest): Promise<PasswordResetResult> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const params = new URLSearchParams({ email, token: mockToken() })

  return { resetUrl: `/auth/reset-password?${params.toString()}` }
}
