import { useMutation } from '@pinia/colada'
import { requestPasswordReset } from '@/features/auth/api/requestPasswordReset'
import type { PasswordResetRequest } from '@/features/auth/schemas/passwordReset'

export function usePasswordResetMutation() {
  return useMutation({
    mutation: (request: PasswordResetRequest) => requestPasswordReset(request),
  })
}
