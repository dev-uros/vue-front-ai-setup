import { describe, it, expect } from 'vitest'
import { usersKeys } from '@/features/users/query/keys'

describe('usersKeys', () => {
  /**
   * Everything nests under one root so a write can invalidate the whole feature with a single
   * prefix match. A key that escaped the root would quietly survive every invalidation.
   */
  it.each([
    ['list', usersKeys.list()],
    ['detail', usersKeys.detail(17)],
    ['logs', usersKeys.logs(17, 2)],
    ['logins', usersKeys.logins(17, 1)],
  ] as const)('keeps the %s key under the users root', (_name, key) => {
    expect(key[0]).toBe(usersKeys.root[0])
  })

  it('separates one account from another', () => {
    expect(usersKeys.detail(17)).not.toEqual(usersKeys.detail(18))
  })

  /** Pages are cached separately, which is what lets paging back and forth avoid a refetch. */
  it('separates one page from another', () => {
    expect(usersKeys.logs(17, 1)).not.toEqual(usersKeys.logs(17, 2))
  })

  it('keeps the two trails of the same account apart', () => {
    expect(usersKeys.logs(17, 1)).not.toEqual(usersKeys.logins(17, 1))
  })
})
