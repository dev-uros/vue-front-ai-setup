import { test, expect } from '@playwright/test'

const VALID = { email: 'ana.kovac@fifthguild.dev', password: 'Password123!' }
const UNKNOWN = { email: 'ne.postoji@fifthguild.dev', password: 'Password123!' }

async function signIn(page: import('@playwright/test').Page, credentials: typeof VALID) {
  await page.locator('input[autocomplete="email"]').fill(credentials.email)
  await page.locator('input[autocomplete="current-password"]').fill(credentials.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('login', () => {
  test('sends an anonymous visitor to the login page', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('keeps the requested path so the user lands there after signing in', async ({ page }) => {
    await page.goto('/reports')

    await expect(page).toHaveURL('/auth/login?redirect=/reports')

    await signIn(page, VALID)

    await expect(page).toHaveURL('/reports')
  })

  test('reports an account that does not exist', async ({ page }) => {
    await page.goto('/auth/login')
    await signIn(page, UNKNOWN)

    await expect(page.getByText(`No account exists for ${UNKNOWN.email}.`)).toBeVisible()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('reports a wrong password', async ({ page }) => {
    await page.goto('/auth/login')
    await signIn(page, { email: VALID.email, password: 'wrong-password' })

    await expect(page.getByText('That password does not match this account.')).toBeVisible()
  })

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/auth/login')

    const password = page.locator('input[autocomplete="current-password"]')
    await password.fill(VALID.password)
    await expect(password).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(password).toHaveAttribute('type', 'text')

    await page.getByRole('button', { name: 'Hide password' }).click()
    await expect(password).toHaveAttribute('type', 'password')
  })

  test('signs in, keeps the session across a reload, and signs out', async ({ page }) => {
    await page.goto('/auth/login')
    await signIn(page, VALID)

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible()

    await page.reload()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible()

    await page.getByTestId('user-menu').click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page).toHaveURL(/\/auth\/login/)

    // The session is really gone, not just navigated away from.
    await page.goto('/')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
