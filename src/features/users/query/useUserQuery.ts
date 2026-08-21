import { toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@pinia/colada'
import { fetchUser } from '@/features/users/api/users'
import { usersKeys } from '@/features/users/query/keys'

/**
 * One account. Parameterised, so the key is a getter — the id comes off the route, and a key
 * that did not track it would keep serving the previously viewed user.
 */
export function useUserQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    key: () => usersKeys.detail(toValue(id)),
    query: async () => (await fetchUser(toValue(id))).data,
  })
}
