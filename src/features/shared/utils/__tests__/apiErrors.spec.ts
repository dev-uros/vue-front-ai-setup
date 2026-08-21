import { describe, it, expect } from 'vitest'
import { ApiError } from '@/lib/axios'
import { toFormFeedback, toDisplayMessage } from '@/features/shared/utils/apiErrors'

const FORM_FIELDS = ['name', 'surname', 'email'] as const

describe('toFormFeedback', () => {
  it('attaches a 422 to the fields it names, with no alert on top', () => {
    const error = new ApiError(422, 'The name field is required. (and 1 more error)', {
      name: ['The name field is required.'],
      email: ['The email field must be a valid email address.'],
    })

    expect(toFormFeedback(error, FORM_FIELDS)).toEqual({
      message: null,
      fields: [
        { name: 'name', message: 'The name field is required.' },
        { name: 'email', message: 'The email field must be a valid email address.' },
      ],
    })
  })

  it('keeps every message when one field fails several rules', () => {
    const error = new ApiError(422, 'Neispravna lozinka.', {
      password: ['Prekratka je.', 'Nema veliko slovo.'],
    })

    expect(toFormFeedback(error, ['password']).fields).toHaveLength(2)
  })

  /**
   * The case this exists for: an expired activation link fails on `token`, which is not a
   * field anyone can see or fix. Pinned to a hidden field it would be silent.
   */
  it('lifts errors for fields the form does not render into the alert', () => {
    const error = new ApiError(422, 'Podaci nisu ispravni.', {
      token: ['Link je istekao ili je već iskorišćen.'],
    })

    expect(toFormFeedback(error, ['password'])).toEqual({
      message: 'Link je istekao ili je već iskorišćen.',
      fields: [],
    })
  })

  it('shows the message for statuses that carry no field errors at all', () => {
    const error = new ApiError(401, 'Podaci za prijavu nisu tačni.')

    expect(toFormFeedback(error, FORM_FIELDS)).toEqual({
      message: 'Podaci za prijavu nisu tačni.',
      fields: [],
    })
  })

  it('falls back to a generic message for something that is not an API error', () => {
    expect(toFormFeedback(new TypeError('boom'), FORM_FIELDS).message).toBe(
      'Došlo je do neočekivane greške. Pokušajte ponovo.',
    )
  })

  it('reports nothing when there is nothing to report', () => {
    expect(toFormFeedback(null, FORM_FIELDS)).toEqual({ message: null, fields: [] })
  })
})

describe('toDisplayMessage', () => {
  it("prefers the API's own wording, which is written for the end user", () => {
    expect(toDisplayMessage(new ApiError(403, 'Ne možete isključiti sopstveni nalog.'))).toBe(
      'Ne možete isključiti sopstveni nalog.',
    )
  })

  it('falls back when the failure came from somewhere else', () => {
    expect(toDisplayMessage(new Error('network'))).toBe(
      'Došlo je do neočekivane greške. Pokušajte ponovo.',
    )
  })
})
