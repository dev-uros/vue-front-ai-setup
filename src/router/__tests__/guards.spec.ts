import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { authGuard, LOGIN_ROUTE, HOME_ROUTE } from '@/router/guards'
import { useSessionStore } from '@/features/shared/stores/session'
import type { User } from '@/features/shared/schemas/user'

const user: User = {
  id: 'usr_1',
  firstName: 'Ana',
  lastName: 'Kovač',
  email: 'ana.kovac@fifthguild.dev',
  company: 'Fifth Guild',
}

/** Only the fields the guard actually reads. */
function route(partial: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return { fullPath: '/', name: undefined, meta: {}, ...partial } as RouteLocationNormalized
}

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('sends an anonymous visitor to the login page', () => {
    const result = authGuard(route({ fullPath: '/reports', name: 'reports' }))

    expect(result).toEqual({ name: LOGIN_ROUTE, query: { redirect: '/reports' } })
  })

  it('protects routes by default, without any per-route opt-in', () => {
    const result = authGuard(route({ fullPath: '/some/new/feature', meta: {} }))

    expect(result).toMatchObject({ name: LOGIN_ROUTE })
  })

  it('lets an anonymous visitor reach a public route', () => {
    const result = authGuard(route({ name: LOGIN_ROUTE, meta: { public: true } }))

    expect(result).toBe(true)
  })

  it('lets a signed-in user through to a protected route', () => {
    useSessionStore().start(user)

    const result = authGuard(route({ fullPath: '/reports', name: 'reports' }))

    expect(result).toBe(true)
  })

  it('bounces a signed-in user away from the login page', () => {
    useSessionStore().start(user)

    const result = authGuard(route({ name: LOGIN_ROUTE, meta: { public: true } }))

    expect(result).toEqual({ name: HOME_ROUTE })
  })
})
