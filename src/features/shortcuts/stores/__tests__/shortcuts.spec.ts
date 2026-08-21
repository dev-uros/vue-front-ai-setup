import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useShortcutsStore } from '@/features/shortcuts/stores/shortcuts'
import { useSessionStore } from '@/features/shared/stores/session'
import { readHistory } from '@/features/shortcuts/utils/storage'
import { adminUser, plainUser } from '@/features/shared/__tests__/fixtures'

const usersList = { name: 'users-list', params: {}, meta: {} }
const userDetail = { name: 'users-detail', params: { id: '3' }, meta: {} }

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

function signedIn(user = adminUser) {
  useSessionStore().start(user, '20|abc')

  return useShortcutsStore()
}

describe('recording', () => {
  it('counts a page the second time it is opened', () => {
    const shortcuts = signedIn()

    shortcuts.record(usersList)
    shortcuts.record(usersList)

    expect(shortcuts.visits).toEqual([expect.objectContaining({ name: 'users-list', visits: 2 })])
  })

  it('survives a reload, which is the whole point of writing it down', () => {
    signedIn().record(userDetail)

    expect(readHistory(adminUser.id)).toEqual([
      expect.objectContaining({ name: 'users-detail', params: { id: '3' } }),
    ])
  })

  /** Nobody is signed in on the login page, so there is no history to add it to. */
  it('records nothing while signed out', () => {
    const shortcuts = useShortcutsStore()

    shortcuts.record(usersList)

    expect(shortcuts.visits).toEqual([])
  })

  it('leaves out what is not worth a shortcut', () => {
    const shortcuts = signedIn()

    shortcuts.record({ name: 'home', params: {}, meta: {} })
    shortcuts.record({ name: 'auth-login', params: {}, meta: { guestOnly: true } })

    expect(shortcuts.visits).toEqual([])
  })
})

describe('one machine, several people', () => {
  it('shows each account only its own pages', async () => {
    const session = useSessionStore()
    const shortcuts = signedIn(adminUser)
    shortcuts.record(userDetail)

    session.end()
    await nextTick()
    expect(shortcuts.visits).toEqual([])

    session.start(plainUser, '21|def')
    await nextTick()
    shortcuts.record(usersList)

    expect(shortcuts.visits).toEqual([expect.objectContaining({ name: 'users-list' })])
  })

  /** Signing out is not "forget me": the same person finds their shortcuts again next time. */
  it('gives an account its history back when it signs in again', async () => {
    const session = useSessionStore()
    const shortcuts = signedIn(adminUser)
    shortcuts.record(userDetail)

    session.end()
    await nextTick()
    session.start(adminUser, '22|ghi')
    await nextTick()

    expect(shortcuts.visits).toEqual([expect.objectContaining({ name: 'users-detail', visits: 1 })])
  })
})

describe('clear', () => {
  it('forgets this account, on disk as well as on screen', () => {
    const shortcuts = signedIn()
    shortcuts.record(usersList)

    shortcuts.clear()

    expect(shortcuts.visits).toEqual([])
    expect(readHistory(adminUser.id)).toEqual([])
  })
})
