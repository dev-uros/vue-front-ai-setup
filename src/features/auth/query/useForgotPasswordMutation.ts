import { defineMutation, useMutation } from '@pinia/colada'
import { forgotPassword } from '@/features/auth/api/password'
import type { ForgotPasswordRequest } from '@/features/auth/schemas/password'

export const useForgotPasswordMutation = defineMutation(() =>
  useMutation({
    mutation: (request: ForgotPasswordRequest) => forgotPassword(request),
  }),
)
