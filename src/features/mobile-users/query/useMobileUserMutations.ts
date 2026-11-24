import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { blockMobileUser, unblockMobileUser } from '@/features/mobile-users/api/mobileUsers'
import { mobileUsersKeys } from '@/features/mobile-users/query/keys'

/**
 * Blocking changes the badge in the list, the detail, and — because every session is revoked —
 * the devices' "signed in" column, so the whole feature prefix is invalidated.
 */
export const useBlockMobileUserMutation = defineMutation(() => {
  const cache = useQueryCache()

  return useMutation({
    mutation: (id: number) => blockMobileUser(id),
    onSuccess: () => cache.invalidateQueries({ key: mobileUsersKeys.root }),
  })
})

export const useUnblockMobileUserMutation = defineMutation(() => {
  const cache = useQueryCache()

  return useMutation({
    mutation: (id: number) => unblockMobileUser(id),
    onSuccess: () => cache.invalidateQueries({ key: mobileUsersKeys.root }),
  })
})
