import * as z from 'zod'

/**
 * One tracked destination: which route, how often, and when it was last opened.
 *
 * Deliberately nothing else. The label a shortcut shows is resolved when it is rendered —
 * from the router for a static page, from live data for a page about a record — so nothing
 * the server owns is written to disk. That matters on a shared machine, and it also means a
 * renamed account shows its new name rather than the one it had when the page was visited.
 *
 * `params` is what turns `users-detail` into a specific person's page; a route without params
 * simply stores an empty object.
 */
export const shortcutVisitSchema = z.object({
  /** Route name, e.g. `users-detail`. Names are stable; paths are not. */
  name: z.string().min(1),
  params: z.record(z.string(), z.string()),
  visits: z.number().int().positive(),
  /** Written by us with `toISOString()`, so always UTC. */
  lastVisitedAt: z.iso.datetime(),
})

export type ShortcutVisit = z.infer<typeof shortcutVisitSchema>
