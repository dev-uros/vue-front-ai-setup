import { defineQuery, useQuery } from '@pinia/colada'
import { fetchUsers } from '@/features/users/api/users'
import { usersKeys } from '@/features/users/query/keys'

/**
 * Every user, in one request — the endpoint is not paginated and returns the whole table
 * sorted by name then surname, so filtering and sorting happen client-side.
 */
export const useUsersQuery = defineQuery(() =>
  useQuery({
    key: usersKeys.list(),
    query: async () => (await fetchUsers()).data,
  }),
)
