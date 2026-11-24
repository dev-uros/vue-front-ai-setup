import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@pinia/colada'
import {
  fetchMobileUser,
  fetchMobileUserDevices,
  fetchMobileUsers,
  type MobileUsersFilter,
} from '@/features/mobile-users/api/mobileUsers'
import { mobileUsersKeys } from '@/features/mobile-users/query/keys'

/**
 * The list is filtered and paginated on the server — there can be far more customers than
 * staff — so the filter is part of the key and each page is cached on its own.
 */
export function useMobileUsersQuery(filter: MaybeRefOrGetter<MobileUsersFilter>) {
  return useQuery({
    key: () => mobileUsersKeys.list(toValue(filter)),
    query: () => fetchMobileUsers(toValue(filter)),
    placeholderData: (previous) => previous,
  })
}

export function useMobileUserQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    key: () => mobileUsersKeys.detail(toValue(id)),
    query: async () => (await fetchMobileUser(toValue(id))).data,
  })
}

export function useMobileUserDevicesQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    key: () => mobileUsersKeys.devices(toValue(id)),
    query: async () => (await fetchMobileUserDevices(toValue(id))).data,
  })
}
