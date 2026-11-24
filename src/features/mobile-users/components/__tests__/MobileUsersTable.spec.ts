import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import MobileUsersTable from '@/features/mobile-users/components/MobileUsersTable.vue'
import { mobileUsersRoutes } from '@/features/mobile-users/routes'
import type { MobileUser } from '@/features/mobile-users/schemas/mobileUser'

const active: MobileUser = {
  id: 1,
  username: 'ana',
  first_name: 'Ana',
  last_name: 'Anić',
  display_name: 'ana',
  email: 'ana@example.com',
  avatar_url: null,
  locale: 'sr',
  has_google: true,
  has_apple: false,
  is_demo: false,
  blocked_at: null,
  last_seen_at: null,
  devices_count: 2,
  created_at: '2026-11-20T10:00:00+00:00',
}

const blocked: MobileUser = {
  ...active,
  id: 2,
  username: 'pera',
  first_name: null,
  last_name: null,
  email: 'pera@example.com',
  has_google: false,
  blocked_at: '2026-11-24T10:00:00+00:00',
}

let router: Router

beforeEach(async () => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', children: mobileUsersRoutes }],
  })
  await router.push({ name: 'mobile-users-list' })
  await router.isReady()
})

describe('MobileUsersTable', () => {
  it('shows the username, the name or else the address, the status and how they sign in', () => {
    const wrapper = mount(MobileUsersTable, {
      props: { users: [active, blocked] },
      global: { plugins: [ui, router] },
    })

    const rows = wrapper.findAll('tbody tr').map((row) => row.text())

    expect(rows[0]).toContain('ana')
    expect(rows[0]).toContain('Ana Anić')
    expect(rows[0]).toContain('Google')
    expect(rows[0]).toContain('Aktivan')
    expect(rows[1]).toContain('pera@example.com')
    expect(rows[1]).toContain('Blokiran')
    expect(rows[1]).not.toContain('Google')
    expect(wrapper.find('a[href="/mobile-users/2"]').exists()).toBe(true)
  })
})
