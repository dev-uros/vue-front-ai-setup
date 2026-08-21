import { describe, it, expect } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import ui from '@nuxt/ui/vue-plugin'
import SetPasswordForm from '@/features/auth/components/SetPasswordForm.vue'

const STRONG = 'Lozinka123!'

function mountForm(props: Record<string, unknown> = {}) {
  return mount(SetPasswordForm, {
    props: { email: 'ana.nikolic@fifthguild.com', submitLabel: 'Sačuvaj lozinku', ...props },
    global: { plugins: [ui] },
  })
}

async function fill(wrapper: VueWrapper, password: string, confirmation = password) {
  const inputs = wrapper.findAll('input[autocomplete="new-password"]')
  await inputs[0]?.setValue(password)
  await inputs[1]?.setValue(confirmation)
}

describe('SetPasswordForm', () => {
  it('emits both fields under the names the API expects', async () => {
    const wrapper = mountForm()

    await fill(wrapper, STRONG)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toEqual([
      [{ password: STRONG, password_confirmation: STRONG }],
    ])
  })

  it('refuses a mismatched confirmation before anything is sent', async () => {
    const wrapper = mountForm()

    await fill(wrapper, STRONG, 'Lozinka124!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Lozinke se ne poklapaju')
  })

  it('ticks off the checklist as the password improves', async () => {
    const wrapper = mountForm()
    const met = () => wrapper.findAll('[data-testid="password-rules"] li[data-met="true"]')

    expect(met()).toHaveLength(0)

    await wrapper.findAll('input[autocomplete="new-password"]')[0]?.setValue('Lozinka1')
    expect(met()).toHaveLength(4)

    await wrapper.findAll('input[autocomplete="new-password"]')[0]?.setValue(STRONG)
    expect(met()).toHaveLength(5)
  })

  /**
   * The link's own failure modes — expired, already used, another account's — arrive as a 422
   * on `token`, which is not a field here. It has to surface as an alert or it is invisible.
   */
  it('shows a link failure as an alert rather than swallowing it', () => {
    const wrapper = mountForm({
      feedback: { message: 'Link je istekao ili je već iskorišćen.', fields: [] },
    })

    expect(wrapper.get('[data-testid="form-error"]').text()).toContain('Link je istekao')
  })

  /** Password managers need a username beside the new-password fields to file the credential. */
  it('carries a hidden username field for password managers', () => {
    const username = mountForm().get('input[autocomplete="username"]')

    expect(username.attributes('value')).toBe('ana.nikolic@fifthguild.com')
  })
})
