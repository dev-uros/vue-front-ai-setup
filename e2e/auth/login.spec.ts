import { test, expect, type Page } from '@playwright/test'
import { ACCOUNTS, PASSWORD, TOKEN_STORAGE_KEY } from '../support/accounts'

/**
 * The only specs that drive the real login form. `POST /auth/login` allows ten attempts a
 * minute per IP and this file runs in three browsers, so it stays at two submissions: one
 * that fails and one that carries the whole signed-in lifecycle.
 */
async function submit(page: Page, email: string, password: string) {
  await page.locator('input[autocomplete="email"]').fill(email)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  await page.getByRole('button', { name: 'Prijavi se' }).click()
}

test('sends an anonymous visitor to the login page and back where they were headed', async ({
  page,
}) => {
  await page.goto('/users')

  await expect(page).toHaveURL('/auth/login?redirect=/users')
  await expect(page.getByRole('heading', { name: 'Dobrodošli nazad' })).toBeVisible()
})

/**
 * The API answers 401 for both a wrong password and an address with no account, with wording
 * that does not say which. The form shows that answer as it arrives rather than guessing.
 */
test('shows the API message when the credentials are refused', async ({ page }) => {
  await page.goto('/auth/login')
  await submit(page, ACCOUNTS.admin.email, 'pogresna-lozinka')

  await expect(page.getByTestId('form-error')).toBeVisible()
  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.evaluate((key) => localStorage.getItem(key), TOKEN_STORAGE_KEY)).resolves.toBeNull()
})

test('signs in, keeps the session across a reload, and signs out for good', async ({ page }) => {
  await page.goto('/auth/login?redirect=/users')
  await submit(page, ACCOUNTS.admin.email, PASSWORD)

  // The redirect the guard recorded is honoured, not the home page.
  await expect(page).toHaveURL('/users')
  await expect(page.getByTestId('user-menu')).toContainText('Uroš Minić')

  // Only the token is stored; the user comes back from GET /auth/me on every start.
  await page.reload()
  await expect(page.getByTestId('user-menu')).toContainText('Uroš Minić')

  await page.getByTestId('user-menu').click()
  await page.getByRole('menuitem', { name: 'Odjavi se' }).click()

  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.evaluate((key) => localStorage.getItem(key), TOKEN_STORAGE_KEY)).resolves.toBeNull()

  // The session is really gone, not just navigated away from.
  await page.goto('/users')
  await expect(page).toHaveURL(/\/auth\/login/)
})

test('toggles password visibility', async ({ page }) => {
  await page.goto('/auth/login')

  const password = page.locator('input[autocomplete="current-password"]')
  await password.fill(PASSWORD)
  await expect(password).toHaveAttribute('type', 'password')

  await page.getByRole('button', { name: 'Prikaži lozinku' }).click()
  await expect(password).toHaveAttribute('type', 'text')

  await page.getByRole('button', { name: 'Sakrij lozinku' }).click()
  await expect(password).toHaveAttribute('type', 'password')
})

test('refuses a malformed address without asking the API', async ({ page }) => {
  await page.goto('/auth/login')

  const calls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/auth/login')) {
      calls.push(request.url())
    }
  })

  await submit(page, 'nije-email', PASSWORD)

  await expect(page.getByText('Unesite ispravnu email adresu')).toBeVisible()
  expect(calls).toHaveLength(0)
})
