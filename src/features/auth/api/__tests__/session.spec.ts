import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as z from 'zod'
import { http } from '@/lib/axios'
import { login, logout, me } from '@/features/auth/api/session'
import { adminUser } from '@/features/shared/__tests__/fixtures'

/** Only the shape the api modules use; the real signatures are overloaded beyond need here. */
type MockRequest = (url: string, ...rest: unknown[]) => Promise<{ data: unknown }>

vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  http: { get: vi.fn<MockRequest>(), post: vi.fn<MockRequest>() },
}))

const get = vi.mocked(http.get)
const post = vi.mocked(http.post)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('posts the credentials and returns the parsed envelope, message included', async () => {
    post.mockResolvedValue({
      data: { message: 'Uspešno ste prijavljeni.', data: { user: adminUser, token: '20|abc' } },
    })

    const result = await login({ email: adminUser.email, password: 'password' })

    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: adminUser.email,
      password: 'password',
    })
    expect(result.message).toBe('Uspešno ste prijavljeni.')
    expect(result.data.token).toBe('20|abc')
  })

  /**
   * Parsing rather than casting is the whole point of this layer: a backend that renames a
   * field has to fail here, not three components later with `undefined` on screen.
   */
  it('refuses a response that does not match the schema', async () => {
    post.mockResolvedValue({ data: { message: 'Uspešno.', data: { user: adminUser } } })

    await expect(login({ email: adminUser.email, password: 'password' })).rejects.toBeInstanceOf(
      z.ZodError,
    )
  })
})

describe('me', () => {
  it('reads the account behind the stored token', async () => {
    get.mockResolvedValue({ data: { message: 'Podaci o nalogu.', data: adminUser } })

    const result = await me()

    expect(get).toHaveBeenCalledWith('/auth/me')
    expect(result.data).toEqual(adminUser)
  })
})

describe('logout', () => {
  it('sends no body — the endpoint revokes the token the request carries', async () => {
    post.mockResolvedValue({ data: { message: 'Uspešno ste odjavljeni.', data: null } })

    const result = await logout()

    expect(post).toHaveBeenCalledWith('/auth/logout')
    expect(result.message).toBe('Uspešno ste odjavljeni.')
  })
})
