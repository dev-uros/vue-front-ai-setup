import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http } from '@/lib/axios'
import {
  createUser,
  deactivateUser,
  fetchUser,
  fetchUsers,
  reactivateUser,
  removeUserAvatar,
  resendActivation,
  updateUser,
  updateUserAvatar,
  updateUserRole,
} from '@/features/users/api/users'
import { adminUser, avatarUser, plainUser } from '@/features/shared/__tests__/fixtures'

/** Only the shape the api modules use; the real signatures are overloaded beyond need here. */
type MockRequest = (url: string, ...rest: unknown[]) => Promise<{ data: unknown }>

vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  http: {
    get: vi.fn<MockRequest>(),
    post: vi.fn<MockRequest>(),
    put: vi.fn<MockRequest>(),
    delete: vi.fn<MockRequest>(),
  },
}))

const get = vi.mocked(http.get)
const post = vi.mocked(http.post)
const put = vi.mocked(http.put)
const del = vi.mocked(http.delete)

function envelope(data: unknown) {
  return { data: { message: 'Uspešno.', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('reads', () => {
  it('fetches the whole list, which is not paginated', async () => {
    get.mockResolvedValue(envelope([adminUser, plainUser]))

    const result = await fetchUsers()

    expect(get).toHaveBeenCalledWith('/users')
    expect(result.data).toHaveLength(2)
  })

  it('fetches one account by numeric id', async () => {
    get.mockResolvedValue(envelope(plainUser))

    await fetchUser(17)

    expect(get).toHaveBeenCalledWith('/users/17')
  })
})

describe('createUser', () => {
  /** The endpoint does not accept a password — it generates one and emails an activation link. */
  it('sends only the four fields the endpoint takes', async () => {
    post.mockResolvedValue(envelope(plainUser))

    const form = {
      name: 'Ana',
      surname: 'Nikolić',
      email: 'ana.nikolic@fifthguild.com',
      role: 'user' as const,
    }
    await createUser(form)

    expect(post).toHaveBeenCalledWith('/users', form)
  })
})

describe('updateUser', () => {
  /** PUT, not PATCH: unchanged fields go along, and role is not one of them. */
  it('puts every editable field and leaves role out', async () => {
    put.mockResolvedValue(envelope(plainUser))

    const form = { name: 'Ana', surname: 'Nikolić-Ilić', email: 'ana.nikolic@fifthguild.com' }
    await updateUser(17, form)

    expect(put).toHaveBeenCalledWith('/users/17', form)
    expect(put.mock.calls[0]?.[1]).not.toHaveProperty('role')
  })
})

describe('role, activation and deactivation', () => {
  it('changes a role through its own endpoint', async () => {
    put.mockResolvedValue(envelope({ ...plainUser, role: 'admin' }))

    await updateUserRole(17, { role: 'admin' })

    expect(put).toHaveBeenCalledWith('/users/17/role', { role: 'admin' })
  })

  it('deactivates and reactivates with a POST, since both have side effects', async () => {
    post.mockResolvedValue(envelope(plainUser))

    await deactivateUser(17)
    await reactivateUser(17)

    expect(post).toHaveBeenNthCalledWith(1, '/users/17/deactivate')
    expect(post).toHaveBeenNthCalledWith(2, '/users/17/reactivate')
  })

  it('resends an activation link, which returns a message and nothing else', async () => {
    post.mockResolvedValue({ data: { message: 'Aktivacioni link je poslat.', data: null } })

    const result = await resendActivation(19)

    expect(post).toHaveBeenCalledWith('/users/19/resend-activation')
    expect(result.message).toBe('Aktivacioni link je poslat.')
  })
})

describe('avatar', () => {
  it('posts the file as multipart under the key the API names, with no content type of its own', async () => {
    post.mockResolvedValue(envelope(avatarUser))

    const file = new File([new Uint8Array(8)], 'profilna.png', { type: 'image/png' })
    const result = await updateUserAvatar(18, file)

    const [url, body, config] = post.mock.calls[0] ?? []
    expect(url).toBe('/users/18/avatar')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('avatar')).toBe(file)
    // Axios has to pick the multipart boundary itself; naming the type here would break it.
    expect(config).toBeUndefined()
    expect(result.data.avatar_url).toBe(avatarUser.avatar_url)
  })

  it('removes with a DELETE and gets the account back without a picture', async () => {
    del.mockResolvedValue(envelope(plainUser))

    const result = await removeUserAvatar(17)

    expect(del).toHaveBeenCalledWith('/users/17/avatar')
    expect(result.data.avatar_url).toBeNull()
  })
})
