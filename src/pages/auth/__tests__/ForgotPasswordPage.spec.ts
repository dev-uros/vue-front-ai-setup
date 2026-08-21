import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import { http } from '@/lib/axios'
import { authRoutes } from '@/features/auth/routes'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'

/** Only the shape the api modules use; the real signatures are overloaded beyond need here. */
type MockRequest = (url: string, ...rest: unknown[]) => Promise<{ data: unknown }>

vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  http: { get: vi.fn<MockRequest>(), post: vi.fn<MockRequest>() },
}))

const post = vi.mocked(http.post)

const API_MESSAGE = 'Ako nalog sa ovom email adresom postoji, poslali smo link za promenu lozinke.'

/**
 * This lives here rather than in the e2e suite because the endpoint cannot be reached reliably
 * from there: every public auth route shares one throttle counter per IP, and the sign-in
 * attempts in the e2e run spend the five requests a minute this one is allowed.
 */
let router: Router

beforeEach(async () => {
  vi.clearAllMocks()

  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/auth', children: authRoutes }],
  })
  await router.push({ name: 'auth-forgot-password' })
  await router.isReady()
})

function mountPage() {
  return mount(ForgotPasswordPage, {
    global: { plugins: [createPinia(), PiniaColada, ui, router] },
  })
}

async function submit(wrapper: ReturnType<typeof mountPage>, email: string) {
  await wrapper.get('input[autocomplete="email"]').setValue(email)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('ForgotPasswordPage', () => {
  it("swaps the form for the API's own confirmation", async () => {
    post.mockResolvedValue({ data: { message: API_MESSAGE, data: null } })

    const wrapper = mountPage()
    await submit(wrapper, 'ana.nikolic@fifthguild.com')

    expect(wrapper.get('[data-testid="reset-confirmation"]').text()).toContain(API_MESSAGE)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  /**
   * The endpoint answers the same 200 either way on purpose. Rendering its message verbatim is
   * what keeps this form from becoming a way to find out which addresses are registered — any
   * wording of our own would have to guess, and a guess is the leak.
   */
  it('answers an unknown address exactly as it answers a known one', async () => {
    post.mockResolvedValue({ data: { message: API_MESSAGE, data: null } })

    const known = mountPage()
    await submit(known, 'ana.nikolic@fifthguild.com')

    const unknown = mountPage()
    await submit(unknown, 'ne.postoji@fifthguild.com')

    expect(unknown.get('[data-testid="reset-confirmation"]').text()).toBe(
      known.get('[data-testid="reset-confirmation"]').text(),
    )
  })

  it('shows only the address it was given, and only in the header', async () => {
    post.mockResolvedValue({ data: { message: API_MESSAGE, data: null } })

    const wrapper = mountPage()
    await submit(wrapper, 'ne.postoji@fifthguild.com')

    expect(wrapper.text()).toContain('Poslato na ne.postoji@fifthguild.com.')
  })

  /** A 429 arrives with its own message; the form has to stay usable so it can be retried. */
  it('keeps the form up and reports a throttled request', async () => {
    const { ApiError } = await vi.importActual<typeof import('@/lib/axios')>('@/lib/axios')
    post.mockRejectedValue(new ApiError(429, 'Too Many Attempts.'))

    const wrapper = mountPage()
    await submit(wrapper, 'ana.nikolic@fifthguild.com')

    expect(wrapper.get('[data-testid="form-error"]').text()).toContain('Too Many Attempts.')
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
