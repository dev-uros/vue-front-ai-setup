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

    await wrapper.get('input[autocomplete="email"]').setValue('uros.minic@fifthguild.com')
    await wrapper.get('input[autocomplete="current-password"]').setValue('password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toEqual([
      [{ email: 'uros.minic@fifthguild.com', password: 'password' }],
    ])
  })

  it('does not emit when the schema rejects the input', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('not-an-email')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  /**
   * A short password must still reach the API. The policy applies to passwords being *set*;
   * refusing an existing one locally would lock out every account created under older rules.
   */
  it('submits a password that would fail the new-password policy', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('uros.minic@fifthguild.com')
    await wrapper.get('input[autocomplete="current-password"]').setValue('short')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it("shows the API's message when there is no field to pin it to", () => {
    const wrapper = mountForm({
      feedback: { message: 'Podaci za prijavu nisu tačni.', fields: [] },
    })

    expect(wrapper.get('[data-testid="form-error"]').text()).toContain(
      'Podaci za prijavu nisu tačni.',
    )
  })

  it('pushes server-side field errors onto the field they name', async () => {
    const wrapper = mountForm()

    await wrapper.setProps({
      feedback: { message: null, fields: [{ name: 'email', message: 'Nalog je isključen.' }] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Nalog je isključen.')
    expect(wrapper.find('[data-testid="form-error"]').exists()).toBe(false)
  })

  it('links to the forgot-password route', () => {
    const link = mountForm().get('a')

    expect(link.text()).toBe('Zaboravili ste lozinku?')
    expect(link.attributes('href')).toBe('/auth/forgot-password')
  })
})
