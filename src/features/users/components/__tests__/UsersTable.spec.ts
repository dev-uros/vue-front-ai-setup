import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import UsersTable from '@/features/users/components/UsersTable.vue'
import { usersRoutes } from '@/features/users/routes'
import { useSessionStore } from '@/features/shared/stores/session'
import {
  adminUser,
  deactivatedUser,
  pendingUser,
  plainUser,
} from '@/features/shared/__tests__/fixtures'

const USERS = [adminUser, plainUser, pendingUser, deactivatedUser]

let router: Router
let pinia: ReturnType<typeof createPinia>

beforeEach(async () => {
  pinia = createPinia()
  setActivePinia(pinia)

  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', children: usersRoutes }],
  })
  await router.push({ name: 'users-list' })
  await router.isReady()
})

function mountTable() {
  useSessionStore().start(adminUser, '20|abc')

  return mount(UsersTable, {
    props: { users: USERS },
    global: { plugins: [pinia, PiniaColada, ui, router] },
  })
}

function rowText(wrapper: VueWrapper): string[] {
  return wrapper.findAll('tbody tr').map((row) => row.text())
}

describe('UsersTable', () => {
  it('renders every account, deactivated and unactivated ones included', () => {
    const wrapper = mountTable()

    expect(rowText(wrapper)).toHaveLength(USERS.length)
    expect(wrapper.text()).toContain(deactivatedUser.email)
  })

  it('shows the state of each account rather than hiding the switched-off ones', () => {
    const wrapper = mountTable()

    expect(wrapper.find('[data-status="active"]').exists()).toBe(true)
    expect(wrapper.find('[data-status="pending"]').exists()).toBe(true)
    expect(wrapper.find('[data-status="deactivated"]').exists()).toBe(true)
  })

  it('filters on name and email together, since one search box covers both', async () => {
    const wrapper = mountTable()

    await wrapper.get('[data-testid="users-search"]').setValue('nikoli')
    await flushPromises()

    expect(rowText(wrapper)).toHaveLength(1)
    expect(wrapper.text()).toContain(plainUser.email)
  })

  it('reports how much of the list is showing', async () => {
    const wrapper = mountTable()

    expect(wrapper.get('[data-testid="users-count"]').text()).toBe('4 od 4')

    await wrapper.get('[data-testid="users-search"]').setValue('nikoli')
    await flushPromises()

    expect(wrapper.get('[data-testid="users-count"]').text()).toBe('1 od 4')
  })

  it('says so instead of showing an empty table when nothing matches', async () => {
    const wrapper = mountTable()

    await wrapper.get('[data-testid="users-search"]').setValue('ne-postoji')
    await flushPromises()

    expect(wrapper.text()).toContain('Nema korisnika koji odgovaraju filteru.')
  })

  it('links each row through to that account', () => {
    const wrapper = mountTable()
    const links = wrapper.findAll('tbody a').map((link) => link.attributes('href'))

    expect(links).toContain(`/users/${plainUser.id}`)
  })
})
