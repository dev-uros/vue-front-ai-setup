import { test, expect, type Page } from '@playwright/test'
import { ACCOUNTS } from '../support/accounts'
import { signIn } from '../support/session'

/**
 * The home page shortcuts, which are built from navigation alone — nothing here writes to the
 * API, only to this browser's `localStorage`.
 */

const MARKO = 'Marko Petrović-Ilić'

/**
 * Sidebar links, scoped on purpose: a shortcut carries the same name as the entry it was built
 * from, so an unscoped "Korisnici" matches both as soon as the feature works.
 */
function nav(page: Page, name: string) {
  return page.locator('#app-dashboard-sidebar-main').getByRole('link', { name })
}

async function goHome(page: Page) {
  await nav(page, 'Početna').click()
  await expect(page).toHaveURL('/')
}

test.beforeEach(async ({ page }) => {
  await signIn(page, 'admin')
  await page.goto('/')
  await expect(page.getByTestId('greeting')).toBeVisible()
})

/** The normal first impression: nothing has been tracked yet, and the card says why. */
test('starts by explaining that shortcuts collect themselves', async ({ page }) => {
  await expect(page.getByTestId('shortcuts-empty')).toBeVisible()
  await expect(page.getByTestId('shortcut')).toHaveCount(0)
})

test('turns the pages you open into shortcuts, most used first', async ({ page }) => {
  await nav(page, 'Korisnici').click()
  await expect(page).toHaveURL('/users')

  // A detail page is stored as a route and an id; the name is put back on it when it renders.
  await page.getByRole('link', { name: MARKO }).click()
  await expect(page).toHaveURL(/\/users\/\d+$/)

  await goHome(page)
  await nav(page, 'Korisnici').click()
  await goHome(page)

  const shortcuts = page.getByTestId('shortcut')

  await expect(shortcuts).toHaveCount(2)
  await expect(shortcuts.first()).toContainText('Korisnici')
  await expect(shortcuts.first()).toContainText('2 posete')
  await expect(shortcuts.nth(1)).toContainText(MARKO)
})

test('a shortcut leads where it says', async ({ page }) => {
  await nav(page, 'Izgled').click()
  await expect(page).toHaveURL('/settings/appearance')
  await goHome(page)

  await page.getByTestId('shortcut').filter({ hasText: 'Izgled' }).click()

  await expect(page).toHaveURL('/settings/appearance')
})

test('keeps the shortcuts across a reload', async ({ page }) => {
  await nav(page, 'Korisnici').click()
  await goHome(page)
  await page.reload()
  // The app trades the stored token for an account before it renders anything, so waiting for
  // the greeting means waiting for a restored session rather than for a fixed number of ms.
  await expect(page.getByTestId('greeting')).toBeVisible()

  // A generous window: this is the one test that pays for a cold chunk twice, and a slow
  // reload says nothing about whether the history survived it.
  await expect(page.getByTestId('shortcut').filter({ hasText: 'Korisnici' })).toBeVisible({
    timeout: 10_000,
  })
})

/**
 * The reason the history is stored per account rather than per browser: a shared machine must
 * not show one person the pages the previous one was looking at.
 */
test('gives each account its own shortcuts on the same machine', async ({ page }) => {
  await nav(page, 'Korisnici').click()
  await goHome(page)
  await expect(page.getByTestId('shortcut')).toHaveCount(1)

  // A later init script wins, so the next load restores the session of the other account.
  await signIn(page, 'plain')
  await page.goto('/')
  await expect(page.getByTestId('user-menu')).toContainText(ACCOUNTS.plain.surname)

  await expect(page.getByTestId('shortcuts-empty')).toBeVisible()

  await signIn(page, 'admin')
  await page.goto('/')
  await expect(page.getByTestId('shortcut').filter({ hasText: 'Korisnici' })).toBeVisible()
})

test('forgets them on request', async ({ page }) => {
  await nav(page, 'Korisnici').click()
  await goHome(page)

  await page.getByTestId('shortcuts-clear').click()

  await expect(page.getByTestId('shortcuts-empty')).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('greeting')).toBeVisible()
  await expect(page.getByTestId('shortcuts-empty')).toBeVisible()
})
