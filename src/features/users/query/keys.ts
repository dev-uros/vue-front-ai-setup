/**
 * Query keys for the users feature, in one place.
 *
 * They nest under a single `['users']` root so a write can invalidate everything the feature
 * caches with one prefix match — after a role change, the list, the detail and the audit trail
 * are all out of date, and enumerating them at every call site is how one gets forgotten.
 */
export const usersKeys = {
  root: ['users'] as const,
  list: () => [...usersKeys.root, 'list'] as const,
  detail: (id: number) => [...usersKeys.root, 'detail', id] as const,
  logs: (id: number, page: number) => [...usersKeys.root, 'logs', id, page] as const,
  logins: (id: number, page: number) => [...usersKeys.root, 'logins', id, page] as const,
}
