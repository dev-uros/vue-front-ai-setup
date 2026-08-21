import * as z from 'zod'

/**
 * What may be sent to `POST /users/{id}/avatar`.
 *
 * The backend validates all of this again and answers 422 with its own message — this schema
 * exists so a 6 MB photo is refused before it is uploaded, not after. The wording is ours
 * because the request that would have produced an API message is never made.
 *
 * The minimum 64x64 the API also requires is deliberately not checked here: it would mean
 * decoding the image in the browser, and the server already answers that case clearly.
 */
export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

/** For the file dialog's filter. SVG is not on the list — the API rejects it. */
export const AVATAR_ACCEPT = AVATAR_MIME_TYPES.join(',')

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const avatarFileSchema = z
  .file()
  .mime([...AVATAR_MIME_TYPES], { error: 'Dozvoljeni su JPEG, PNG, WebP i GIF.' })
  .max(AVATAR_MAX_BYTES, { error: 'Slika ne sme biti veća od 5 MB.' })

export type AvatarFile = z.infer<typeof avatarFileSchema>
