import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { authGuard, LOGIN_ROUTE, HOME_ROUTE } from '@/router/guards'
import { useSessionStore } from '@/features/shared/stores/session'
import { authRoutes } from '@/features/auth/routes'
import { adminUser } from '@/features/shared/__tests__/fixtures'

/** Only the fields the guard actually reads. */
function route(partial: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return { fullPath: '/', name: undefined, meta: {}, ...partial } as RouteLocationNormalized
}

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('without a session', () => {
    it('sends an anonymous visitor to the login page', () => {
      const result = authGuard(route({ fullPath: '/users', name: 'users-list' }))

      expect(result).toEqual({ name: LOGIN_ROUTE, query: { redirect: '/users' } })
    })

    it('protects routes by default, without any per-route opt-in', () => {
      const result = authGuard(route({ fullPath: '/some/new/feature', meta: {} }))

      expect(result).toMatchObject({ name: LOGIN_ROUTE })
    })

    it('lets an anonymous visitor reach a public route', () => {
      expect(authGuard(route({ meta: { public: true } }))).toBe(true)
    })

    it('lets an anonymous visitor reach a guest-only route', () => {
      expect(authGuard(route({ name: LOGIN_ROUTE, meta: { guestOnly: true } }))).toBe(true)
    })
  })

  describe('with a session', () => {
    beforeEach(() => {
      useSessionStore().start(adminUser, '20|abc')
    })

    it('lets a signed-in user through to a protected route', () => {
      expect(authGuard(route({ fullPath: '/users', name: 'users-list' }))).toBe(true)
    })

    it('leaves a merely public route reachable while signed in', () => {
      expect(authGuard(route({ name: 'terms', meta: { public: true } }))).toBe(true)
    })

    it.each(authRoutes.map((record) => [record.name, record.meta] as const))(
      'sends a signed-in user home from %s',
      (_name, meta) => {
        expect(authGuard(route({ meta }))).toEqual({ name: HOME_ROUTE })
      },
    )
  })

  it('keeps every auth route guest-only, so a new one cannot forget the flag', () => {
    expect(authRoutes.map((record) => record.meta?.guestOnly)).toEqual(authRoutes.map(() => true))
  })
})
