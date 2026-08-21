import { describe, it, expect } from 'vitest'
import { paginatedSchema } from '@/features/shared/schemas/api'
import { loginAttemptSchema, userLogSchema } from '@/features/users/schemas/history'

/** Verbatim from `GET /users/16/logs` against the running backend. */
const LOGS_RESPONSE = {
  message: 'Istorija izmena je uspešno učitana.',
  data: [
    {
      id: 44,
      event: 'user.updated',
      old_values: { email: 'marko.petrovic@fifthguild.com', surname: 'Petrović' },
      new_values: { email: 'marko.petrovic-ilic@fifthguild.com', surname: 'Petrović-Ilić' },
      actor: {
        id: 1,
        name: 'Uroš',
        surname: 'Minić',
        email: 'uros.minic@fifthguild.com',
      },
      ip_address: '10.20.0.14',
      created_at: '2026-08-08T10:15:00+00:00',
    },
    {
      id: 42,
      event: 'user.activation_link_sent',
      old_values: null,
      new_values: null,
      actor: null,
      ip_address: '10.20.0.14',
      created_at: '2026-07-13T09:30:00+00:00',
    },
  ],
  links: { first: 'http://x?page=1', last: 'http://x?page=1', prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [{ url: null, label: '&laquo; Previous', page: null, active: false }],
    path: 'http://x',
    per_page: 25,
    to: 2,
    total: 2,
  },
}

/** Verbatim from `GET /users/1/logins`. */
const LOGINS_RESPONSE = {
  message: 'Istorija prijava je uspešno učitana.',
  data: [
    {
      id: 235,
      outcome: 'succeeded',
      email: 'uros.minic@fifthguild.com',
      ip_address: '192.168.65.1',
      user_agent: 'curl/8.7.1',
      created_at: '2026-08-20T21:53:04+00:00',
    },
  ],
  links: { first: 'http://x?page=1', last: 'http://x?page=1', prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: 'http://x',
    per_page: 25,
    to: 1,
    total: 1,
  },
}

describe('userLogSchema', () => {
  it('parses a paginated page of logs as the API sends it', () => {
    const parsed = paginatedSchema(userLogSchema).parse(LOGS_RESPONSE)

    expect(parsed.data).toHaveLength(2)
    expect(parsed.meta.per_page).toBe(25)
  })

  it('drops the page-URL bookkeeping we never follow', () => {
    const parsed = paginatedSchema(userLogSchema).parse(LOGS_RESPONSE)

    expect(parsed).not.toHaveProperty('links')
    expect(parsed.meta).not.toHaveProperty('links')
  })

  it('accepts an event with no diff, such as a resent invite', () => {
    expect(parsed(1).new_values).toBeNull()
  })

  it('accepts a null actor, which means the system did it', () => {
    expect(parsed(1).actor).toBeNull()
  })

  /**
   * `actor` is required, so its absence is a broken response rather than an unattributed
   * action. Accepting a missing key would render "the system did it" for something a person
   * did — the one wrong answer an audit trail must not give.
   */
  it('refuses a row that omits the actor rather than reading it as the system', () => {
    const { actor: _actor, ...withoutActor } = LOGS_RESPONSE.data[1]!

    expect(userLogSchema.safeParse(withoutActor).success).toBe(false)
  })

  /**
   * The backend adds a case whenever a new use case touches a user. An audit trail that
   * refuses to render because it met an unfamiliar event would be worse than one showing it.
   */
  it('accepts an event this build has never heard of', () => {
    const unknown = { ...LOGS_RESPONSE.data[1], event: 'user.something_new' }

    expect(userLogSchema.parse(unknown).event).toBe('user.something_new')
  })

  function parsed(index: number) {
    return paginatedSchema(userLogSchema).parse(LOGS_RESPONSE).data[index]!
  }
})

describe('loginAttemptSchema', () => {
  it('parses a page of attempts', () => {
    const parsed = paginatedSchema(loginAttemptSchema).parse(LOGINS_RESPONSE)

    expect(parsed.data[0]?.outcome).toBe('succeeded')
  })

  it.each(['succeeded', 'invalid_credentials', 'account_deactivated'])(
    'accepts the %s outcome',
    (outcome) => {
      expect(loginAttemptSchema.safeParse({ ...LOGINS_RESPONSE.data[0], outcome }).success).toBe(
        true,
      )
    },
  )

  /** An unknown outcome has no colour and no label, so it must fail loudly rather than render blank. */
  it('rejects an outcome outside the enum', () => {
    expect(
      loginAttemptSchema.safeParse({ ...LOGINS_RESPONSE.data[0], outcome: 'locked_out' }).success,
    ).toBe(false)
  })

  it('accepts an attempt with no user agent recorded', () => {
    expect(
      loginAttemptSchema.safeParse({ ...LOGINS_RESPONSE.data[0], user_agent: null }).success,
    ).toBe(true)
  })
})
