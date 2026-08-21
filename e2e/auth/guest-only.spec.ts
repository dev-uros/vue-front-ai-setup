import { test, expect } from '@playwright/test'
import { signIn } from '../support/session'

const AUTH_PAGES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password?email=ana.nikolic%40fifthguild.com&token=tok_e2e',
  '/auth/activate-account?email=ana.nikolic%40fifthguild.com&token=tok_e2e',
]

test.describe('while signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'plain')
  })

  for (const path of AUTH_PAGES) {
    test(`redirects ${path} to the home page`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL('/')
      await expect(page.getByTestId('greeting')).toContainText('Zdravo, Ana')
    })
  }
})

test.describe('while signed out', () => {
  for (const path of AUTH_PAGES) {
    test(`leaves ${path} reachable`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL(path)
    })
  }
})
