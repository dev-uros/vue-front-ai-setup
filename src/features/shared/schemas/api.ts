import * as z from 'zod'

/**
 * The response envelope every successful API call shares.
 *
 * `message` is always present and is written for the end user, in Serbian — show it verbatim
 * rather than substituting wording of our own. `data` is always present too, and is `null`
 * when the action has nothing to return.
 *
 * Errors deliberately do **not** use this envelope; they are shaped by `ApiError` in
 * `@/lib/axios` instead.
 */
export function apiResponseSchema<T extends z.ZodType>(data: T) {
  return z.object({
    message: z.string(),
    data,
  })
}

/** An action whose only useful result is the message it comes back with (logout, forgot-password). */
export const messageOnlySchema = apiResponseSchema(z.unknown().nullish())

/**
 * Laravel's paginator, trimmed to the parts a UI needs. The `links` object and `meta.links`
 * array are page URLs we never follow — pages are requested with `?page=n` — so the schema
 * drops them rather than modelling a contract we do not use.
 */
export const paginationMetaSchema = z.object({
  current_page: z.number().int(),
  last_page: z.number().int(),
  per_page: z.number().int(),
  total: z.number().int(),
  from: z.number().int().nullable(),
  to: z.number().int().nullable(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    message: z.string(),
    data: z.array(item),
    meta: paginationMetaSchema,
  })
}

/** What a paginated endpoint resolves to, for annotating `api/` return types. */
export interface Paginated<T> {
  message: string
  data: T[]
  meta: PaginationMeta
}

/** Every paginated endpoint on this API returns 25 rows per page. */
export const PER_PAGE = 25
