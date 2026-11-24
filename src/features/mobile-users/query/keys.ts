import type { MobileUsersFilter } from '@/features/mobile-users/api/mobileUsers'

/**
 * Query keys for the app users feature, under one `['mobile-users']` root so a block can
 * invalidate the list, the detail and the devices with one prefix match.
 */
export const mobileUsersKeys = {
  root: ['mobile-users'] as const,
  list: (filter: MobileUsersFilter) =>
    [...mobileUsersKeys.root, 'list', filter.page, filter.search.trim(), filter.blocked] as const,
  detail: (id: number) => [...mobileUsersKeys.root, 'detail', id] as const,
  devices: (id: number) => [...mobileUsersKeys.root, 'devices', id] as const,
}
