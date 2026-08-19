import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import LoginForm from '@/features/auth/components/LoginForm.vue'
import { authRoutes } from '@/features/auth/routes'

let router: Router

/**
 * The form links to the forgot-password route, so it needs a real router — using the feature's
 * own route table means a renamed route breaks this test instead of only breaking at runtime.
 */
beforeEach(async () => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/auth', children: authRoutes }],
  })
  await router.push({ name: 'auth-login' })
  await router.isReady()
})

function mountForm(props: Record<string, unknown> = {}) {
  return mount(LoginForm, { props, global: { plugins: [ui, router] } })
}

describe('LoginForm', () => {
  it('hides the password and reveals it through the toggle', async () => {
    const wrapper = mountForm()
    const password = wrapper.find('input[autocomplete="current-password"]')

    expect(password.attributes('type')).toBe('password')

    await wrapper.get('[data-testid="toggle-password"]').trigger('click')
    expect(password.attributes('type')).toBe('text')

    await wrapper.get('[data-testid="toggle-password"]').trigger('click')
    expect(password.attributes('type')).toBe('password')
  })

  it('emits the validated credentials on submit', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('ana.kovac@fifthguild.dev')
    await wrapper.get('input[autocomplete="current-password"]').setValue('Password123!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toEqual([
      [{ email: 'ana.kovac@fifthguild.dev', password: 'Password123!' }],
    ])
  })

  it('does not emit when the schema rejects the input', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('not-an-email')
    await wrapper.get('input[autocomplete="current-password"]').setValue('short')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('shows the error message it is given', () => {
    const wrapper = mountForm({ errorMessage: 'No account exists for x@y.dev.' })

    expect(wrapper.text()).toContain('No account exists for x@y.dev.')
  })

  it('links to the forgot-password route', () => {
    const link = mountForm().get('a')

    expect(link.text()).toBe('Forgot password?')
    expect(link.attributes('href')).toBe('/auth/forgot-password')
  })
})
