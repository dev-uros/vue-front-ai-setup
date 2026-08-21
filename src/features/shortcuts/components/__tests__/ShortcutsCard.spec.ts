import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import ShortcutsCard from '@/features/shortcuts/components/ShortcutsCard.vue'
import type { Shortcut } from '@/features/shortcuts/composables/useShortcuts'
import { usersRoutes } from '@/features/users/routes'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', children: usersRoutes }],
})

function shortcut(overrides: Partial<Shortcut> = {}): Shortcut {
  return {
    key: 'users-list:{}',
    to: { name: 'users-list' },
    label: 'Korisnici',
    icon: 'i-lucide-users',
    visits: 3,
    ...overrides,
  }
}

function mountCard(shortcuts: Shortcut[]) {
  return mount(ShortcutsCard, {
    props: { shortcuts },
    global: { plugins: [ui, router] },
  })
}

describe('ShortcutsCard', () => {
  it('links to every shortcut it is given', () => {
    const wrapper = mountCard([
      shortcut(),
      shortcut({
        key: 'users-detail:3',
        to: { name: 'users-detail', params: { id: '3' } },
        label: 'Marko Petrović-Ilić',
      }),
    ])

    expect(wrapper.findAll('[data-testid="shortcut"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Marko Petrović-Ilić')
    expect(wrapper.find('a[href="/users/3"]').exists()).toBe(true)
  })

  /** The normal state of a fresh account, so it explains itself instead of looking broken. */
  it('says how shortcuts appear when there are none yet', () => {
    const wrapper = mountCard([])

    expect(wrapper.find('[data-testid="shortcuts-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="shortcuts-clear"]').exists()).toBe(false)
  })

  it('counts visits in Serbian', () => {
    const wrapper = mountCard([
      shortcut({ key: 'a', visits: 1 }),
      shortcut({ key: 'b', visits: 3 }),
      shortcut({ key: 'c', visits: 8 }),
      shortcut({ key: 'd', visits: 11 }),
      shortcut({ key: 'e', visits: 13 }),
      shortcut({ key: 'f', visits: 21 }),
      shortcut({ key: 'g', visits: 22 }),
    ])

    const text = wrapper.text()

    expect(text).toContain('1 poseta')
    expect(text).toContain('3 posete')
    expect(text).toContain('8 poseta')
    expect(text).toContain('11 poseta')
    expect(text).toContain('13 poseta')
    expect(text).toContain('21 poseta')
    expect(text).toContain('22 posete')
  })

  it('asks to be emptied rather than emptying anything itself', async () => {
    const wrapper = mountCard([shortcut()])

    await wrapper.find('[data-testid="shortcuts-clear"]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
