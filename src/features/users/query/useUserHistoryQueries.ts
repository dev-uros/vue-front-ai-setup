import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@pinia/colada'
import { fetchUserLogins, fetchUserLogs } from '@/features/users/api/history'
import { usersKeys } from '@/features/users/query/keys'

/**
 * The two audit trails. Both are paginated server-side, so the page number is part of the key
 * and each page is cached on its own — paging back and forth does not refetch.
 *
 * Both endpoints are admin-only; `enabled` keeps a plain user from firing a request that can
 * only come back 403.
 */
export function useUserLogsQuery(
  id: MaybeRefOrGetter<number>,
  page: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    key: () => usersKeys.logs(toValue(id), toValue(page)),
    query: () => fetchUserLogs(toValue(id), toValue(page)),
    enabled,
  })
}

export function useUserLoginsQuery(
  id: MaybeRefOrGetter<number>,
  page: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    key: () => usersKeys.logins(toValue(id), toValue(page)),
    query: () => fetchUserLogins(toValue(id), toValue(page)),
    enabled,
  })
}
