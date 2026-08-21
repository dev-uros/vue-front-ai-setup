import { defineMutation, useMutation } from '@pinia/colada'
import { login } from '@/features/auth/api/session'
import type { Credentials } from '@/features/auth/schemas/credentials'

/**
 * Colada wrapper around the login call. Components and pages use this, never `api/` directly,
 * so request state (loading, error) is owned in one place.
 */
export const useLoginMutation = defineMutation(() =>
  useMutation({
    mutation: (credentials: Credentials) => login(credentials),
  }),
)
