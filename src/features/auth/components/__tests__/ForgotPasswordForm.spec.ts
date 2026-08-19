import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ui from '@nuxt/ui/vue-plugin'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm.vue'

function mountForm() {
  return mount(ForgotPasswordForm, { global: { plugins: [ui] } })
}

describe('ForgotPasswordForm', () => {
  it('emits the email once it validates', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('ana.kovac@fifthguild.dev')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toEqual([[{ email: 'ana.kovac@fifthguild.dev' }]])
  })

  it('does not emit when the address is malformed', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[autocomplete="email"]').setValue('not-an-email')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Enter a valid email address')
  })
})
