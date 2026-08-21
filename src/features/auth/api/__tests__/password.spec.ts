import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http } from '@/lib/axios'
import { activateAccount, forgotPassword, resetPassword } from '@/features/auth/api/password'
import { pendingUser, plainUser } from '@/features/shared/__tests__/fixtures'

/** Only the shape the api modules use; the real signatures are overloaded beyond need here. */
type MockRequest = (url: string, ...rest: unknown[]) => Promise<{ data: unknown }>

vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  http: { get: vi.fn<MockRequest>(), post: vi.fn<MockRequest>() },
}))

const post = vi.mocked(http.post)

const LINK = { email: plainUser.email, token: 'tok_123' }
const PASSWORD = { password: 'Lozinka123!', password_confirmation: 'Lozinka123!' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('forgotPassword', () => {
  it('returns only the message, because that is all the endpoint reveals', async () => {
    post.mockResolvedValue({
      data: {
        message: 'Ako nalog sa ovom email adresom postoji, poslali smo link za promenu lozinke.',
        data: null,
      },
    })

    const result = await forgotPassword({ email: 'nepostojeca@fifthguild.com' })

    expect(post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'nepostojeca@fifthguild.com',
    })
    expect(result.message).toContain('Ako nalog')
  })
})

describe('activateAccount', () => {
  it('sends the link and both password fields, and comes back signed in', async () => {
    post.mockResolvedValue({
      data: {
        message: 'Nalog je uspešno aktiviran.',
        data: { user: pendingUser, token: '21|xyz' },
      },
    })

    const result = await activateAccount({ ...LINK, ...PASSWORD })

    expect(post).toHaveBeenCalledWith('/auth/activate-account', { ...LINK, ...PASSWORD })
    expect(result.data.token).toBe('21|xyz')
  })
})

describe('resetPassword', () => {
  it('hits the reset endpoint, not the activation one', async () => {
    post.mockResolvedValue({
      data: { message: 'Lozinka je uspešno promenjena.', data: { user: plainUser, token: '22|q' } },
    })

    await resetPassword({ ...LINK, ...PASSWORD })

    expect(post).toHaveBeenCalledWith('/auth/reset-password', { ...LINK, ...PASSWORD })
  })
})
