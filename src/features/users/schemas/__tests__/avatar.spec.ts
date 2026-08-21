import { describe, it, expect } from 'vitest'
import { AVATAR_ACCEPT, AVATAR_MAX_BYTES, avatarFileSchema } from '@/features/users/schemas/avatar'

function makeFile(type: string, bytes = 1024): File {
  return new File([new Uint8Array(bytes)], 'slika', { type })
}

describe('avatarFileSchema', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])('accepts %s', (type) => {
    expect(avatarFileSchema.safeParse(makeFile(type)).success).toBe(true)
  })

  /** The API refuses SVG outright, so it must not reach the accept filter either. */
  it('rejects a type the API does not take', () => {
    const result = avatarFileSchema.safeParse(makeFile('image/svg+xml'))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Dozvoljeni su JPEG, PNG, WebP i GIF.')
  })

  it('rejects anything over 5 MB before it is uploaded', () => {
    expect(avatarFileSchema.safeParse(makeFile('image/png', AVATAR_MAX_BYTES + 1)).success).toBe(
      false,
    )
    expect(avatarFileSchema.safeParse(makeFile('image/png', AVATAR_MAX_BYTES)).success).toBe(true)
  })

  it('offers the same types to the file dialog that it validates', () => {
    expect(AVATAR_ACCEPT).toBe('image/jpeg,image/png,image/webp,image/gif')
  })
})
