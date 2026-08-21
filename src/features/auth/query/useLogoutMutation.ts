import { defineMutation, useMutation } from '@pinia/colada'
import { logout } from '@/features/auth/api/session'

export const useLogoutMutation = defineMutation(() =>
  useMutation({
    mutation: () => logout(),
  }),
)
