import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { TOKEN_STORAGE_KEY, type AccountRole } from './accounts'

export const TOKENS_FILE = fileURLToPath(new URL('../.tokens.json', import.meta.url))

let cached: Partial<Record<AccountRole, string>> | null = null

function tokenFor(role: AccountRole): string {
  cached ??= JSON.parse(readFileSync(TOKENS_FILE, 'utf8'))

  const token = cached?.[role]
  if (!token) {
    throw new Error(`Nema tokena za ulogu "${role}" — global setup nije prošao.`)
  }

  return token
}

/**
 * Puts a bearer token where the app looks for it, before any of its code runs.
 *
 * The user is deliberately not seeded alongside it: the app trades the token for fresh account
 * details at start, so every spec that uses this also exercises the session restore.
 */
export async function signIn(page: Page, role: AccountRole): Promise<void> {
  const token = tokenFor(role)

  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key!, value!),
    [TOKEN_STORAGE_KEY, token] as const,
  )
}
