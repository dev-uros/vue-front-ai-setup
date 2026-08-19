import { test, expect } from '@playwright/test'

const LINK = '/auth/reset-password?email=ana.kovac%40fifthguild.dev&token=tok_e2e'
const STRONG = 'Password123!'

/** Field-level validation messages; the requirement checklist repeats some of the same wording. */
function fieldErrors(page: import('@playwright/test').Page) {
  return page.locator('[data-slot="error"]')
}

async function fill(page: import('@playwright/test').Page, password: string, confirm = password) {
  const inputs = page.locator('input[autocomplete="new-password"]')
  await inputs.first().fill(password)
  await inputs.last().fill(confirm)
}

test('sets a new password and lands signed in on the home page', async ({ page }) => {
  await page.goto(LINK)

  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible()
  await expect(page.getByText('Resetting the password for ana.kovac@fifthguild.dev.')).toBeVisible()

  await fill(page, STRONG)
  await page.getByRole('button', { name: 'Set new password' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible()

  // The session is real, not just a navigation: it survives a reload.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible()
})

test('reports each unmet password rule', async ({ page }) => {
  await page.goto(LINK)

  await fill(page, 'weak')
  await page.getByRole('button', { name: 'Set new password' }).click()

  await expect(fieldErrors(page)).toContainText('At least 8 characters')
  await expect(page).toHaveURL(/reset-password/)
})

test('refuses a password that misses a character class', async ({ page }) => {
  await page.goto(LINK)

  await fill(page, 'password123!')
  await page.getByRole('button', { name: 'Set new password' }).click()

  await expect(fieldErrors(page)).toContainText('At least one uppercase letter')
})

test('refuses a mismatched confirmation', async ({ page }) => {
  await page.goto(LINK)

  await fill(page, STRONG, 'Password123?')
  await page.getByRole('button', { name: 'Set new password' }).click()

  await expect(fieldErrors(page)).toContainText('Passwords do not match')
  await expect(page).toHaveURL(/reset-password/)
})

test('ticks off the requirement checklist as the password improves', async ({ page }) => {
  await page.goto(LINK)

  const met = page.locator('[data-testid="password-rules"] li[data-met="true"]')
  await expect(met).toHaveCount(0)

  await page.locator('input[autocomplete="new-password"]').first().fill('Password1')
  await expect(met).toHaveCount(4)

  await page.locator('input[autocomplete="new-password"]').first().fill(STRONG)
  await expect(met).toHaveCount(5)
})

test('rejects a link without a token', async ({ page }) => {
  await page.goto('/auth/reset-password?email=ana.kovac%40fifthguild.dev')

  await expect(page.getByRole('heading', { name: 'This link is not valid' })).toBeVisible()
  await expect(page.getByTestId('request-new-link')).toBeVisible()
})

test('walks the whole flow: forgot password, emailed link, signed in', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByRole('link', { name: 'Forgot password?' }).click()

  const send = page.getByRole('button', { name: 'Send reset link' })
  await expect(send).toBeVisible()
  await page.locator('input[autocomplete="email"]').fill('nikola.peric@fifthguild.dev')
  await send.click()

  await page.getByTestId('demo-reset-link').click()
  await expect(page).toHaveURL(/\/auth\/reset-password\?email=/)

  await fill(page, STRONG)
  await page.getByRole('button', { name: 'Set new password' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Hello, Nikola' })).toBeVisible()
})
