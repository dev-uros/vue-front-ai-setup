import * as z from 'zod'

/**
 * The authenticated user.
 *
 * Lives in `shared` because three places need it: the `auth` feature writes it,
 * the router guard reads it, and the layouts render it.
 */
export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  company: z.string(),
})

export type User = z.infer<typeof userSchema>
