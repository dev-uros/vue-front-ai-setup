import * as z from 'zod'
import { userRoleSchema } from '@/features/shared/schemas/user'

/**
 * The write forms. Field names are the API's, so a 422 lands on the field it names without a
 * translation table in between.
 */

/**
 * Creating a user takes no password: the backend generates one nobody ever sees and emails an
 * activation link instead. Sending a `password` here is not just unnecessary — the endpoint
 * does not accept the field.
 */
export const createUserSchema = z.object({
  name: z.string().min(1, 'Unesite ime').max(255, 'Najviše 255 karaktera'),
  surname: z.string().min(1, 'Unesite prezime').max(255, 'Najviše 255 karaktera'),
  email: z.email('Unesite ispravnu email adresu').max(255, 'Najviše 255 karaktera'),
  role: userRoleSchema,
})

export type CreateUserForm = z.infer<typeof createUserSchema>

/**
 * Editing is a `PUT` and every field is required — `PATCH` deliberately does not exist, so
 * unchanged fields are sent along with the changed ones.
 *
 * `role` is absent on purpose: it has its own endpoint, because folding it in would make every
 * profile edit a request to hand out privileges.
 */
export const updateUserSchema = createUserSchema.omit({ role: true })

export type UpdateUserForm = z.infer<typeof updateUserSchema>

export const USER_FORM_FIELDS = ['name', 'surname', 'email', 'role'] as const

export const changeRoleSchema = z.object({
  role: userRoleSchema,
})

export type ChangeRoleForm = z.infer<typeof changeRoleSchema>
