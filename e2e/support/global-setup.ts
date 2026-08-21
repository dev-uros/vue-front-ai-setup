import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { request } from '@playwright/test'
import { ACCOUNTS, API_URL, PASSWORD, type AccountRole } from './accounts'
import { TOKENS_FILE } from './session'

/**
 * Signs in once per account for the whole run and writes the tokens to disk.
 *
 * This exists because of a rate limit, not for speed: `POST /auth/login` allows 10 attempts a
 * minute per IP, and a suite that logged in through the form in every spec, across three
 * browsers, would spend the budget on setup and then fail the tests that are actually about
 * signing in. Specs seed the token instead and let the app restore the session from it —
 * which is the same path a returning user takes.
 */
async function globalSetup() {
  // No `baseURL`: it resolves as a URL base, so an absolute path would drop the `/api` prefix.
  const context = await request.newContext()
  const tokens: Partial<Record<AccountRole, string>> = {}

  try {
    for (const role of ['admin', 'plain'] as const) {
      const response = await context.post(`${API_URL}/auth/login`, {
        headers: { Accept: 'application/json' },
        data: { email: ACCOUNTS[role].email, password: PASSWORD },
      })

      if (!response.ok()) {
        throw new Error(
          `Prijava za ${ACCOUNTS[role].email} nije uspela (${response.status()}). ` +
            'Da li backend radi i da li je pokrenut `make demo`?',
        )
      }

      tokens[role] = (await response.json()).data.token
    }
  } finally {
    await context.dispose()
  }

  await mkdir(dirname(TOKENS_FILE), { recursive: true })
  await writeFile(TOKENS_FILE, JSON.stringify(tokens), 'utf8')
}

export default globalSetup
