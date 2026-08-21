import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { useShortcuts, type ShortcutsOptions } from '@/features/shortcuts/composables/useShortcuts'
import { useShortcutsStore } from '@/features/shortcuts/stores/shortcuts'
import { useSessionStore } from '@/features/shared/stores/session'
import { usersRoutes } from '@/features/users/routes'
import { settingsRoutes } from '@/features/settings/routes'
import { adminUser } from '@/features/shared/__tests__/fixtures'

let pinia: Pinia
let router: Router

beforeEach(async () => {
  localStorage.clear()
  pinia = createPinia()
  setActivePinia(pinia)

  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', children: [...usersRoutes, ...settingsRoutes] }],
  })
  await router.push('/users')
  await router.isReady()

  useSessionStore().start(adminUser, '20|abc')
})

/** The composable needs a component instance for `useRouter`; this is the smallest one. */
function runShortcuts(options?: ShortcutsOptions) {
  const result = { value: [] as ReturnType<typeof useShortcuts>['shortcuts']['value'] }

  mount(
    defineComponent({
      setup() {
        const { shortcuts } = useShortcuts(options)

        return () => {
          result.value = shortcuts.value

          return h('div')
        }
      },
    }),
    { global: { plugins: [pinia, router] } },
  )

  return result
}

describe('useShortcuts', () => {
  it('labels a page with its own route title and icon', () => {
    useShortcutsStore().record({ name: 'users-list', params: {}, meta: {} })

    expect(runShortcuts().value).toEqual([
      expect.objectContaining({ label: 'Korisnici', icon: 'i-lucide-users', visits: 1 }),
    ])
  })

  it('puts the most visited page first', () => {
    const shortcuts = useShortcutsStore()
    shortcuts.record({ name: 'settings-profile', params: {}, meta: {} })
    shortcuts.record({ name: 'users-list', params: {}, meta: {} })
    shortcuts.record({ name: 'users-list', params: {}, meta: {} })

    expect(runShortcuts().value.map((shortcut) => shortcut.label)).toEqual([
      'Korisnici',
      'Moj nalog',
    ])
  })

  /** Only the feature that owns the page can turn an id into a person. */
  it('lets a caller name a page the router only knows generically', () => {
    useShortcutsStore().record({ name: 'users-detail', params: { id: '3' }, meta: {} })

    const shortcuts = runShortcuts({
      resolveLabel: (visit) => (visit.params.id === '3' ? 'Marko Petrović-Ilić' : undefined),
    })

    expect(shortcuts.value[0]?.label).toBe('Marko Petrović-Ilić')
    expect(shortcuts.value[0]?.to).toEqual({ name: 'users-detail', params: { id: '3' } })
  })

  it('falls back to the route title when the caller cannot name it', () => {
    useShortcutsStore().record({ name: 'users-detail', params: { id: '3' }, meta: {} })

    expect(runShortcuts({ resolveLabel: () => undefined }).value[0]?.label).toBe(
      'Detalji korisnika',
    )
  })

  /** History outlives a release: a page that has since been removed must not render a dead link. */
  it('drops an entry whose route no longer exists', () => {
    useShortcutsStore().record({ name: 'reports-list', params: {}, meta: {} })

    expect(runShortcuts().value).toEqual([])
  })

  it('shows only as many as asked for', () => {
    const shortcuts = useShortcutsStore()
    shortcuts.record({ name: 'users-list', params: {}, meta: {} })
    shortcuts.record({ name: 'settings-profile', params: {}, meta: {} })

    expect(runShortcuts({ limit: 1 }).value).toHaveLength(1)
  })
})
