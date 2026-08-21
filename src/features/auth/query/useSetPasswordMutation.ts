import { useMutation } from '@pinia/colada'
import { activateAccount, resetPassword } from '@/features/auth/api/password'
import type { SetPasswordRequest } from '@/features/auth/schemas/password'

/**
 * Activation and reset are the same form, the same link shape and the same result — only the
 * endpoint differs, because the backend keeps them apart: one verifies an email address for
 * the first time, the other revokes every existing token.
 *
 * Parameterised, so `defineMutation` (which returns one shared instance) is not what we want
 * here — each caller gets its own.
 */
export type SetPasswordMode = 'activate' | 'reset'

export function useSetPasswordMutation(mode: SetPasswordMode) {
  return useMutation({
    mutation: (request: SetPasswordRequest) =>
      mode === 'activate' ? activateAccount(request) : resetPassword(request),
  })
}
