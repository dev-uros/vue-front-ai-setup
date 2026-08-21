import axios, { AxiosError, type AxiosInstance } from 'axios'

/**
 * The one configured HTTP client. Everything that talks to the API goes through it, so base
 * URL, headers, the bearer token and error shaping are decided in exactly one file.
 *
 * It holds no domain knowledge: no endpoints, no schemas, no feature types. Feature `api/`
 * folders import `http` and add their endpoints on top.
 *
 * The API uses Sanctum **personal access tokens**, not the cookie/CSRF mode: there is no
 * `/sanctum/csrf-cookie` call, no `withCredentials`, no shared session. A login hands back a
 * string that is replayed as `Authorization: Bearer …`.
 */

/** Where the token lives across reloads. See the honest note in `setAuthToken`. */
const TOKEN_STORAGE_KEY = 'app.auth.token'

let token: string | null = localStorage.getItem(TOKEN_STORAGE_KEY)

export function getAuthToken(): string | null {
  return token
}

/**
 * `localStorage` is chosen for the obvious reason — it survives a refresh — and with the
 * obvious cost: any XSS on this frontend can read it. That trade is only acceptable while
 * everything rendered here stays escaped; nothing in the app injects raw HTML.
 */
export function setAuthToken(next: string | null): void {
  token = next

  if (next === null) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } else {
    localStorage.setItem(TOKEN_STORAGE_KEY, next)
  }
}

/**
 * A failed API call, normalised.
 *
 * Successful responses share one envelope; errors deliberately do not — they keep Laravel's
 * shape, and 401/403/404 carry only a `message`. The client therefore branches on `status`,
 * never on the shape of the body.
 *
 * `message` is written by the backend **for the end user** (in Serbian) and is meant to be
 * displayed verbatim rather than replaced with our own wording.
 */
export class ApiError extends Error {
  readonly status: number
  /** Field-level messages, keyed by field name. Only ever present on a 422. */
  readonly errors: Record<string, string[]> | undefined
  /** `X-Request-Id` — the handle the backend team needs to find this exact request in Grafana. */
  readonly requestId: string | undefined

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
    requestId?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.requestId = requestId
  }

  /** Validation failure, or an activation/reset link that is expired, used or not that account's. */
  get isValidation(): boolean {
    return this.status === 422
  }

  /** Rate limited: login is 10/min, forgot-password 5/min per IP. */
  get isThrottled(): boolean {
    return this.status === 429
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * A 401 means the token is gone for good — expired, revoked by a logout elsewhere, or
 * invalidated by a password reset. The only correct move is to sign out, but *how* to sign
 * out (drop the store, route to the login page) is application knowledge this module must not
 * have. So the app registers a handler at boot and this file only decides when to call it.
 */
type UnauthorizedHandler = () => void

let handleUnauthorized: UnauthorizedHandler = () => {}

export function onUnauthorized(handler: UnauthorizedHandler): void {
  handleUnauthorized = handler
}

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    // Without this Laravel is free to answer with an HTML error page instead of JSON.
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  if (token !== null) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

/** Laravel's error body: `message` always, `errors` only on a 422. */
interface ErrorPayload {
  message?: unknown
  errors?: unknown
}

function readFieldErrors(payload: ErrorPayload): Record<string, string[]> | undefined {
  if (typeof payload.errors !== 'object' || payload.errors === null) {
    return undefined
  }

  return payload.errors as Record<string, string[]>
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      throw error
    }

    const requestId = error.response?.headers['x-request-id']
    const payload = (error.response?.data ?? {}) as ErrorPayload
    const status = error.response?.status ?? 0

    if (status === 401) {
      setAuthToken(null)
      handleUnauthorized()
    }

    throw new ApiError(
      status,
      typeof payload.message === 'string' && payload.message.length > 0
        ? payload.message
        : // No response at all: the server is down, DNS failed, or CORS blocked the call.
          'Server trenutno nije dostupan. Pokušajte ponovo.',
      readFieldErrors(payload),
      typeof requestId === 'string' ? requestId : undefined,
    )
  },
)
