import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ui from '@nuxt/ui/vue-plugin'
import UserAvatar from '@/features/shared/components/UserAvatar.vue'
import { avatarUser, plainUser } from '@/features/shared/__tests__/fixtures'

function mountAvatar(user: typeof plainUser) {
  return mount(UserAvatar, { props: { user }, global: { plugins: [ui] } })
}

describe('UserAvatar', () => {
  it('renders the picture when the account has one', () => {
    const image = mountAvatar(avatarUser).find('img')

    expect(image.attributes('src')).toBe(avatarUser.avatar_url)
    expect(image.attributes('alt')).toBe('Marko Marković')
  })

  it('falls back to initials when there is none', () => {
    const wrapper = mountAvatar(plainUser)

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('AN')
  })

  /** A file deleted between the response and the render must not leave an empty circle. */
  it('falls back to initials when the picture fails to load', async () => {
    const wrapper = mountAvatar(avatarUser)

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('MM')
  })
})
