import { useMutation } from '@pinia/colada'
import { resetPassword } from '@/features/auth/api/resetPassword'
import type { ResetPasswordRequest } from '@/features/auth/schemas/passwordReset'

export function useResetPasswordMutation() {
  return useMutation({
    mutation: (request: ResetPasswordRequest) => resetPassword(request),
  })
}
