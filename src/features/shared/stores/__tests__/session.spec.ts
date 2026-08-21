import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getAuthToken, setAuthToken } from '@/lib/axios'
import { useSessionStore } from '@/features/shared/stores/session'
import { adminUser, plainUser } from '@/features/shared/__tests__/fixtures'

describe('session store', () => {
  beforeEach(() => {
    setAuthToken(null)
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const session = useSessionStore()

    expect(session.isAuthenticated).toBe(false)
    expect(session.user).toBeNull()
    expect(session.isAdmin).toBe(false)
  })

  it('opens a session with a user and hands the token to the HTTP client', () => {
    const session = useSessionStore()
    session.start(adminUser, '20|abc')

    expect(session.isAuthenticated).toBe(true)
    expect(session.user).toEqual(adminUser)
    expect(getAuthToken()).toBe('20|abc')
  })

  /**
   * The user is deliberately not persisted: only the token survives a reload, and the app
   * trades it for fresh details at start. Caching the user would let a revoked role or a
   * switched-off account keep rendering as if nothing happened.
   */
  it('leaves nothing but the token behind for the next page load', () => {
    useSessionStore().start(adminUser, '20|abc')

    expect(localStorage.getItem('app.auth.token')).toBe('20|abc')
    expect(JSON.stringify(localStorage)).not.toContain(adminUser.email)
  })

  it('refreshes the user without touching the token, which is what /auth/me does', () => {
    const session = useSessionStore()
    session.start(adminUser, '20|abc')

    session.setUser({ ...adminUser, name: 'Novo ime' })

    expect(session.user?.name).toBe('Novo ime')
    expect(getAuthToken()).toBe('20|abc')
  })

  it('reports an admin as one, and a plain user as not', () => {
    const session = useSessionStore()

    session.start(adminUser, '20|abc')
    expect(session.isAdmin).toBe(true)

    session.setUser(plainUser)
    expect(session.isAdmin).toBe(false)
  })

  it('drops the token along with the user when the session ends', () => {
    const session = useSessionStore()
    session.start(adminUser, '20|abc')
    session.end()

    expect(session.isAuthenticated).toBe(false)
    expect(getAuthToken()).toBeNull()
    expect(localStorage.getItem('app.auth.token')).toBeNull()
  })
})
