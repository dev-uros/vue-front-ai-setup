import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore, SESSION_STORAGE_KEY } from '@/features/shared/stores/session'
import type { User } from '@/features/shared/schemas/user'

const user: User = {
  id: 'usr_1',
  firstName: 'Ana',
  lastName: 'Kovač',
  email: 'ana.kovac@fifthguild.dev',
  company: 'Fifth Guild',
}

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const session = useSessionStore()

    expect(session.isAuthenticated).toBe(false)
    expect(session.user).toBeNull()
  })

  it('persists the user when a session starts', () => {
    const session = useSessionStore()
    session.start(user)

    expect(session.isAuthenticated).toBe(true)
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')).toEqual(user)
  })

  it('restores a persisted user, which is what survives a page refresh', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))

    const session = useSessionStore()

    expect(session.user).toEqual(user)
    expect(session.isAuthenticated).toBe(true)
  })

  it('drops a stored value that no longer matches the schema', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'usr_1', email: 'nope' }))

    const session = useSessionStore()

    expect(session.user).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('clears storage when the session ends', () => {
    const session = useSessionStore()
    session.start(user)
    session.end()

    expect(session.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
