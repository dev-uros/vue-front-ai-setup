import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import ui from '@nuxt/ui/vue-plugin'
import UserAvatarField from '@/features/users/components/UserAvatarField.vue'
import { useSessionStore } from '@/features/shared/stores/session'
import { AVATAR_MAX_BYTES } from '@/features/users/schemas/avatar'
import { adminUser, avatarUser, makeUser, plainUser } from '@/features/shared/__tests__/fixtures'
import type { User } from '@/features/shared/schemas/user'

const toast = vi.hoisted(() => ({
  success: vi.fn<(message: string) => void>(),
  error: vi.fn<(cause: unknown) => void>(),
  failure: vi.fn<(message: string) => void>(),
}))

vi.mock('@/features/shared/composables/useApiToast', () => ({ useApiToast: () => toast }))

vi.mock('@/features/users/api/users', () => ({
  updateUserAvatar: vi.fn<typeof import('@/features/users/api/users').updateUserAvatar>(),
  removeUserAvatar: vi.fn<typeof import('@/features/users/api/users').removeUserAvatar>(),
}))

const { removeUserAvatar, updateUserAvatar } = await import('@/features/users/api/users')
const upload = vi.mocked(updateUserAvatar)
const remove = vi.mocked(removeUserAvatar)

let pinia: Pinia

beforeEach(() => {
  vi.clearAllMocks()
  pinia = createPinia()
  setActivePinia(pinia)
})

function mountField(user: User, viewer: User) {
  useSessionStore().start(viewer, '20|abc')

  return mount(UserAvatarField, {
    props: { user },
    global: { plugins: [pinia, PiniaColada, ui] },
  })
}

/** Drives the hidden input the file dialog opens, which is where a real pick lands too. */
async function pick(wrapper: VueWrapper, file: File) {
  const input = wrapper.find('input[type="file"]')

  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

const png = () => new File([new Uint8Array(8)], 'profilna.png', { type: 'image/png' })

describe('who gets the controls', () => {
  it('offers them to an admin on somebody else’s account', () => {
    const wrapper = mountField(avatarUser, adminUser)

    expect(wrapper.find('[data-testid="avatar-upload"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="avatar-remove"]').exists()).toBe(true)
  })

  it('offers them to a plain user on their own account', () => {
    const wrapper = mountField(plainUser, plainUser)

    expect(wrapper.find('[data-testid="avatar-upload"]').exists()).toBe(true)
  })

  it('shows a plain user somebody else’s picture and no controls', () => {
    const wrapper = mountField(avatarUser, plainUser)

    expect(wrapper.find('img').attributes('src')).toBe(avatarUser.avatar_url)
    expect(wrapper.find('[data-testid="avatar-upload"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="avatar-remove"]').exists()).toBe(false)
  })

  /** Nothing to remove: the button would only produce a 200 that changes nothing. */
  it('leaves out the remove button for an account with no picture', () => {
    const wrapper = mountField(plainUser, adminUser)

    expect(wrapper.find('[data-testid="avatar-remove"]').exists()).toBe(false)
  })
})

describe('picking a file', () => {
  it('uploads it and shows what the API said', async () => {
    upload.mockResolvedValue({ message: 'Profilna slika je sačuvana.', data: avatarUser })

    const wrapper = mountField(avatarUser, adminUser)
    const file = png()
    await pick(wrapper, file)

    expect(upload).toHaveBeenCalledWith(avatarUser.id, file)
    expect(toast.success).toHaveBeenCalledWith('Profilna slika je sačuvana.')
  })

  /** The API would refuse it too — this only saves the round trip and the wait. */
  it('refuses one the API would reject, without uploading anything', async () => {
    const wrapper = mountField(avatarUser, adminUser)

    await pick(
      wrapper,
      new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'velika.png', {
        type: 'image/png',
      }),
    )

    expect(upload).not.toHaveBeenCalled()
    expect(toast.failure).toHaveBeenCalledWith('Slika ne sme biti veća od 5 MB.')
  })
})

describe('removing', () => {
  it('removes the picture and reports the message', async () => {
    remove.mockResolvedValue({
      message: 'Profilna slika je uklonjena.',
      data: makeUser({ id: avatarUser.id, avatar_url: null }),
    })

    const wrapper = mountField(avatarUser, adminUser)
    await wrapper.find('[data-testid="avatar-remove"]').trigger('click')
    await flushPromises()

    expect(remove).toHaveBeenCalledWith(avatarUser.id)
    expect(toast.success).toHaveBeenCalledWith('Profilna slika je uklonjena.')
  })
})
