import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, getAuthToken, http, isApiError, onUnauthorized, setAuthToken } from '@/lib/axios'

/**
 * The interceptors are exercised directly rather than through a server. What is worth testing
 * here is the translation — Laravel's error body into an `ApiError`, and a 401 into a sign-out
 * — not that axios can make a request.
 */
function required<T>(value: T | undefined | null, what: string): T {
  if (value === null || value === undefined) {
    throw new Error(`${what} is not registered`)
  }

  return value
}

const requestInterceptor = required(
  http.interceptors.request.handlers?.[0]?.fulfilled,
  'the request interceptor',
)

const responseRejection = required(
  http.interceptors.response.handlers?.[0]?.rejected,
  'the response error interceptor',
)

async function runRequest(): Promise<InternalAxiosRequestConfig> {
  return await requestInterceptor({ headers: new AxiosHeaders() } as InternalAxiosRequestConfig)
}

function failWith(status: number, data: unknown, headers: Record<string, string> = {}): ApiError {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    data,
    headers,
    statusText: '',
    config: { headers: new AxiosHeaders() },
  }

  try {
    responseRejection(error)
  } catch (thrown) {
    return thrown as ApiError
  }

  throw new Error('the interceptor was expected to throw')
}

beforeEach(() => {
  setAuthToken(null)
  onUnauthorized(() => {})
})

describe('auth token', () => {
  it('persists the token so a reload does not ask for the password again', () => {
    setAuthToken('20|abc')

    expect(getAuthToken()).toBe('20|abc')
    expect(localStorage.getItem('app.auth.token')).toBe('20|abc')
  })

  it('wipes it from storage, not just from memory', () => {
    setAuthToken('20|abc')
    setAuthToken(null)

    expect(getAuthToken()).toBeNull()
    expect(localStorage.getItem('app.auth.token')).toBeNull()
  })

  it('sends the token as a bearer header once there is one', async () => {
    setAuthToken('20|abc')

    expect((await runRequest()).headers.get('Authorization')).toBe('Bearer 20|abc')
  })

  it('sends no Authorization header while signed out', async () => {
    expect((await runRequest()).headers.get('Authorization')).toBeUndefined()
  })
})

describe('response errors', () => {
  it('keeps the field errors of a 422', () => {
    const error = failWith(422, {
      message: 'Neispravni podaci.',
      errors: { email: ['Zauzet.'] },
    })

    expect(isApiError(error)).toBe(true)
    expect(error.errors).toEqual({ email: ['Zauzet.'] })
    expect(error.isValidation).toBe(true)
  })

  it("shows the API's own message, which is written for the end user", () => {
    expect(failWith(403, { message: 'Ne možete isključiti sopstveni nalog.' }).message).toBe(
      'Ne možete isključiti sopstveni nalog.',
    )
  })

  it('carries the request id, which is how a 500 gets traced in the backend logs', () => {
    const error = failWith(500, { message: 'Greška na serveru.' }, { 'x-request-id': 'req_123' })

    expect(error.requestId).toBe('req_123')
  })

  it('flags a 429 so the UI can say "try again in a moment"', () => {
    expect(failWith(429, { message: 'Previše pokušaja.' }).isThrottled).toBe(true)
  })

  /** A dead token cannot be salvaged; the only correct move is to sign out. */
  it('throws the token away and calls the handler on a 401', () => {
    setAuthToken('20|abc')
    const handler = vi.fn<() => void>()
    onUnauthorized(handler)

    failWith(401, { message: 'Niste prijavljeni.' })

    expect(getAuthToken()).toBeNull()
    expect(handler).toHaveBeenCalledOnce()
  })

  it('leaves the token alone on a 403, which is about permission, not identity', () => {
    setAuthToken('20|abc')

    failWith(403, { message: 'Nemate pravo.' })

    expect(getAuthToken()).toBe('20|abc')
  })

  it('falls back to a readable message when the server answered nothing at all', () => {
    let thrown: unknown

    try {
      responseRejection(new AxiosError('Network Error'))
    } catch (error) {
      thrown = error
    }

    expect((thrown as ApiError).status).toBe(0)
    expect((thrown as ApiError).message).toBe('Server trenutno nije dostupan. Pokušajte ponovo.')
  })
})
