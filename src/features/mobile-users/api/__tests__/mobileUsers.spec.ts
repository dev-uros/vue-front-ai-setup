import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http } from '@/lib/axios'
import {
  blockMobileUser,
  fetchMobileUser,
  fetchMobileUserDevices,
  fetchMobileUsers,
  unblockMobileUser,
} from '@/features/mobile-users/api/mobileUsers'

type MockRequest = (url: string, ...rest: unknown[]) => Promise<{ data: unknown }>

vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  http: { get: vi.fn<MockRequest>(), post: vi.fn<MockRequest>() },
}))

const get = vi.mocked(http.get)
const post = vi.mocked(http.post)

const appUser = {
  id: 7,
  username: 'ana',
  first_name: 'Ana',
  last_name: null,
  display_name: 'ana',
  email: 'ana@example.com',
  avatar_url: null,
  locale: 'sr',
  has_google: true,
  has_apple: false,
  is_demo: false,
  blocked_at: null,
  last_seen_at: '2026-11-24T10:00:00+00:00',
  devices_count: 1,
  created_at: '2026-11-20T10:00:00+00:00',
}

const meta = { current_page: 1, last_page: 1, per_page: 25, total: 1, from: 1, to: 1 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mobile users api', () => {
  it('sends only the filters that are set', async () => {
    get.mockResolvedValue({ data: { message: 'Ok.', data: [appUser], meta } })

    await fetchMobileUsers({ page: 2, search: '  ', blocked: null })
    expect(get).toHaveBeenLastCalledWith('/mobile-users', { params: { page: 2 } })

    await fetchMobileUsers({ page: 1, search: ' ana ', blocked: true })
    expect(get).toHaveBeenLastCalledWith('/mobile-users', {
      params: { page: 1, search: 'ana', blocked: 1 },
    })

    await fetchMobileUsers({ page: 1, search: '', blocked: false })
    expect(get).toHaveBeenLastCalledWith('/mobile-users', { params: { page: 1, blocked: 0 } })
  })

  it('rejects an answer that does not match the contract', async () => {
    get.mockResolvedValue({ data: { message: 'Ok.', data: [{ ...appUser, locale: 'de' }], meta } })

    await expect(fetchMobileUsers({ page: 1, search: '', blocked: null })).rejects.toThrow(/locale/)
  })

  it('parses the detail, the devices and the block answers', async () => {
    get.mockResolvedValueOnce({ data: { message: 'Ok.', data: appUser } })
    expect((await fetchMobileUser(7)).data.username).toBe('ana')
    expect(get).toHaveBeenLastCalledWith('/mobile-users/7')

    get.mockResolvedValueOnce({
      data: {
        message: 'Ok.',
        data: [
          {
            id: 1,
            device_id: 'x',
            name: 'iPhone',
            platform: 'ios',
            operating_system: 'iOS',
            manufacturer: 'Apple',
            os_version: '27.2',
            push_notifications_enabled: true,
            signed_in: false,
            last_seen_at: '2026-11-24T10:00:00+00:00',
            created_at: '2026-11-24T10:00:00+00:00',
          },
        ],
      },
    })
    expect((await fetchMobileUserDevices(7)).data[0]?.platform).toBe('ios')
    expect(get).toHaveBeenLastCalledWith('/mobile-users/7/devices')

    post.mockResolvedValue({
      data: {
        message: 'Nalog je blokiran.',
        data: { ...appUser, blocked_at: '2026-11-24T11:00:00+00:00' },
      },
    })
    expect((await blockMobileUser(7)).message).toBe('Nalog je blokiran.')
    expect(post).toHaveBeenLastCalledWith('/mobile-users/7/block')

    await unblockMobileUser(7)
    expect(post).toHaveBeenLastCalledWith('/mobile-users/7/unblock')
  })
})
