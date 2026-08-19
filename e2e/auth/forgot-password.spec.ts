import { test, expect } from '@playwright/test'

test('reaches the reset form from the login page and confirms the request', async ({ page }) => {
  await page.goto('/auth/login')

  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await expect(page).toHaveURL('/auth/forgot-password')

  // The route transition runs `mode="out-in"`: until the new card is on screen, the email input
  // still resolves to the login form that is leaving.
  const submit = page.getByRole('button', { name: 'Send reset link' })
  await expect(submit).toBeVisible()

  await page.locator('input[autocomplete="email"]').fill('ana.kovac@fifthguild.dev')
  await submit.click()

  const confirmation = page.getByTestId('reset-confirmation')
  await expect(confirmation).toContainText('We sent the reset link to ana.kovac@fifthguild.dev.')
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
})

test('answers the same way for an address with no account', async ({ page }) => {
  await page.goto('/auth/forgot-password')

  await page.locator('input[autocomplete="email"]').fill('ne.postoji@fifthguild.dev')
  await page.getByRole('button', { name: 'Send reset link' }).click()

  // Same confirmation as a real account: the form must not reveal who is registered.
  await expect(page.getByTestId('reset-confirmation')).toContainText(
    'We sent the reset link to ne.postoji@fifthguild.dev.',
  )
})

test('rejects a malformed address before sending anything', async ({ page }) => {
  await page.goto('/auth/forgot-password')

  await page.locator('input[autocomplete="email"]').fill('not-an-email')
  await page.getByRole('button', { name: 'Send reset link' }).click()

  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(page.getByTestId('reset-confirmation')).toHaveCount(0)
})

test('goes back to sign in', async ({ page }) => {
  await page.goto('/auth/forgot-password')

  await page.getByRole('link', { name: 'Back to sign in' }).click()

  await expect(page).toHaveURL('/auth/login')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})

test('stays reachable without a session', async ({ page }) => {
  await page.goto('/auth/forgot-password')

  // meta.public keeps the auth guard out of the way.
  await expect(page).toHaveURL('/auth/forgot-password')
})
