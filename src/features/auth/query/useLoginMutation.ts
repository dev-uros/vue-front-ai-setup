import { useMutation } from '@pinia/colada'
import { login } from '@/features/auth/api/login'
import type { Credentials } from '@/features/auth/schemas/credentials'

/**
 * Colada wrapper around the login call. Components and pages use this, never `api/` directly,
 * so request state (loading, error) is owned in one place.
 */
export function useLoginMutation() {
  return useMutation({
    mutation: (credentials: Credentials) => login(credentials),
  })
}
