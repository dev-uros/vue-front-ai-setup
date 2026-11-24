import { describe, it, expect } from 'vitest'
import {
  mobileUserPersonalName,
  mobileUserStatus,
} from '@/features/mobile-users/schemas/mobileUser'

describe('mobile user helpers', () => {
  it('reads the status off blocked_at', () => {
    expect(mobileUserStatus({ blocked_at: null })).toBe('active')
    expect(mobileUserStatus({ blocked_at: '2026-11-24T10:00:00+00:00' })).toBe('blocked')
  })

  it('joins whatever part of the name was given', () => {
    expect(mobileUserPersonalName({ first_name: 'Ana', last_name: 'Anić' })).toBe('Ana Anić')
    expect(mobileUserPersonalName({ first_name: null, last_name: 'Anić' })).toBe('Anić')
    expect(mobileUserPersonalName({ first_name: null, last_name: null })).toBeNull()
  })
})
