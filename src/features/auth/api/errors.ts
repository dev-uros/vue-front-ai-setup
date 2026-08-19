import type { AuthErrorCode } from '@/features/auth/types'

/** Thrown by the auth API so the UI can tell "no such user" apart from "wrong password". */
export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}
