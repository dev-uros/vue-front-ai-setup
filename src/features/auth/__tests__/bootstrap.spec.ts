import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { PiniaColada, useQueryCache } from '@pinia/colada'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { endExpiredSession } from '@/features/auth/bootstrap'
import { useSessionStore } from '@/features/shared/stores/session'
import { LOGIN_ROUTE } from '@/router/guards'
import { adminUser } from '@/features/shared/__tests__/fixtures'

const Empty = { render: () => null }

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Empty },
      { path: '/users/:id', name: 'users-show', component: Empty },
      { path: '/auth/login', name: LOGIN_ROUTE, component: Empty },
    ],
  })
}

describe('endExpiredSession', () => {
  let router: Router

  beforeEach(() => {
    const pinia = createPinia()
    createApp({}).use(pinia).use(PiniaColada)
    setActivePinia(pinia)
    router = makeRouter()
  })

  it('a wrong password on the login form keeps the page and its ?redirect=', async () => {
    await router.push({ name: LOGIN_ROUTE, query: { redirect: '/users/42' } })

    endExpiredSession(router)
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/auth/login?redirect=/users/42')
  })

  it('a session that died mid-use goes to login, remembering where the user was', async () => {
    useSessionStore().start(adminUser, '20|abc')
    await router.push('/users/42')

    endExpiredSession(router)
    await flushPromises()

    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(router.currentRoute.value.name).toBe(LOGIN_ROUTE)
    expect(router.currentRoute.value.query.redirect).toBe('/users/42')
  })

  it('a session that died mid-use leaves nothing cached for the next person', async () => {
    useSessionStore().start(adminUser, '20|abc')
    const cache = useQueryCache()
    cache.setQueryData(['users', 'list'], [adminUser])
    expect(cache.getEntries()).toHaveLength(1)

    endExpiredSession(router)

    expect(cache.getEntries()).toHaveLength(0)
  })

  it('signed out, the cache is left alone', () => {
    const cache = useQueryCache()
    cache.setQueryData(['public'], 'x')

    endExpiredSession(router)

    expect(cache.getEntries()).toHaveLength(1)
  })
})
