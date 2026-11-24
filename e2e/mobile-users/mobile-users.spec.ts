import { readFileSync } from 'node:fs'
import { test, expect, type APIRequestContext } from '@playwright/test'
import { API_URL } from '../support/accounts'
import { signIn, TOKENS_FILE } from '../support/session'

/** The demo account this spec blocks, put back as `make demo` left it whatever happened before. */
async function unblockTamara(request: APIRequestContext) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${JSON.parse(readFileSync(TOKENS_FILE, 'utf8')).admin}`,
  }
  const list = await request.get(`${API_URL}/mobile-users?search=tamara`, { headers })
  const id = (await list.json()).data[0].id

  await request.post(`${API_URL}/mobile-users/${id}/unblock`, { headers })
}

/**
 * The external app's accounts as `make demo` seeds them: six, one blocked
 * (`spam.nalog@example.com`), one store-review account.
 */
test.describe('as an administrator', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'admin')
  })

  test('lists the app users and narrows them on the server', async ({ page }) => {
    await page.goto('/mobile-users')

    const table = page.getByTestId('mobile-users-table')
    await expect(table).toContainText('jelena')
    await expect(table).toContainText('Jelena Kovač')
    await expect(page.getByTestId('mobile-users-count')).toContainText('6')

    await page.getByTestId('mobile-users-search').fill('pera')
    await expect(page.getByTestId('mobile-users-count')).toContainText('1')
    await expect(table).toContainText('Google')
  })

  test('blocks and unblocks from the detail page', async ({ page, request }) => {
    await unblockTamara(request)
    await page.goto('/mobile-users')
    await page.getByTestId('mobile-users-search').fill('tamara')
    await page.getByRole('link', { name: 'tamara' }).click()

    await expect(page.getByText('tamara@example.com')).toBeVisible()
    await expect(page.getByTestId('mobile-user-devices')).toBeVisible()

    await page.getByTestId('block-mobile-user').click()
    await page.getByTestId('confirm-block').click()
    await expect(page.getByText('Nalog je blokiran.', { exact: true })).toBeVisible()

    await page.getByTestId('unblock-mobile-user').click()
    await expect(page.getByText('Nalog je odblokiran.', { exact: true })).toBeVisible()
    await expect(page.getByTestId('block-mobile-user')).toBeVisible()
  })
})

test.describe('as a plain user', () => {
  test('reads but is offered no block', async ({ page }) => {
    await signIn(page, 'plain')
    await page.goto('/mobile-users')
    await page.getByTestId('mobile-users-search').fill('spamer')
    await page.getByRole('link', { name: 'spamer' }).click()

    await expect(page.getByText('Blokiran', { exact: true }).first()).toBeVisible()
    await expect(page.getByTestId('unblock-mobile-user')).toHaveCount(0)
  })
})
