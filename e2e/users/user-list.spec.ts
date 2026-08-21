import { test, expect } from '@playwright/test'
import { ACCOUNTS } from '../support/accounts'
import { signIn } from '../support/session'

test.describe('as an administrator', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'admin')
    await page.goto('/users')
    // The table renders before the request lands, so waiting on a row means waiting on data.
    await expect(page.getByRole('link', { name: 'Uroš Minić' })).toBeVisible()
  })

  /** A deactivated account is not a deleted one, so it stays in the list, marked as such. */
  test('lists every account, in every state', async ({ page }) => {
    await expect(page.getByRole('link', { name: `${ACCOUNTS.plain.name} ${ACCOUNTS.plain.surname}` })).toBeVisible()
    await expect(page.locator('[data-status="pending"]').first()).toBeVisible()
    await expect(page.locator('[data-status="deactivated"]').first()).toBeVisible()
    await expect(page.locator('[data-role="admin"]').first()).toBeVisible()
  })

  test('searches by name and by email through the same box', async ({ page }) => {
    // The counter reads "shown of total", so the total is read back rather than hard-coded —
    // the demo data is a live database and anyone may have added an account to it.
    const counter = page.getByTestId('users-count')
    const total = (await counter.textContent())?.split(' od ').at(-1)

    await page.getByTestId('users-search').fill(ACCOUNTS.plain.surname)
    await expect(counter).toHaveText(`1 od ${total}`)

    await page.getByTestId('users-search').fill(ACCOUNTS.deactivated.email)
    await expect(counter).toHaveText(`1 od ${total}`)

    await page.getByTestId('users-search').fill('')
    await expect(counter).toHaveText(`${total} od ${total}`)
  })

  test('says so when nothing matches instead of showing an empty table', async ({ page }) => {
    await page.getByTestId('users-search').fill('nepostojeci-korisnik')

    await expect(page.getByText('Nema korisnika koji odgovaraju filteru.')).toBeVisible()
  })

  test('offers the write actions an admin is allowed', async ({ page }) => {
    await expect(page.getByTestId('new-user')).toBeVisible()

    await page.getByTestId('users-search').fill(ACCOUNTS.pending.email)
    await page.locator('[data-testid^="user-actions-"]').click()

    // An account that was never activated is the only one with an invite worth resending.
    await expect(page.getByRole('menuitem', { name: 'Pošalji aktivacioni link' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Isključi nalog' })).toBeVisible()
  })

  /** Both refusals the API makes about oneself, mirrored so the entries are never offered. */
  test('does not offer an admin their own role change or deactivation', async ({ page }) => {
    await page.getByTestId('users-search').fill(ACCOUNTS.admin.email)
    await page.locator('[data-testid^="user-actions-"]').click()

    await expect(page.getByRole('menuitem', { name: 'Izmeni podatke' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Promeni ulogu' })).toHaveCount(0)
    await expect(page.getByRole('menuitem', { name: 'Isključi nalog' })).toHaveCount(0)
  })

  test('offers switching a deactivated account back on', async ({ page }) => {
    await page.getByTestId('users-search').fill(ACCOUNTS.deactivated.email)
    await page.locator('[data-testid^="user-actions-"]').click()

    await expect(page.getByRole('menuitem', { name: 'Uključi nalog' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Isključi nalog' })).toHaveCount(0)
  })

  test('opens an account from its row', async ({ page }) => {
    await page.getByTestId('users-search').fill(ACCOUNTS.plain.email)
    await page.getByRole('link', { name: `${ACCOUNTS.plain.name} ${ACCOUNTS.plain.surname}` }).click()

    await expect(page).toHaveURL(/\/users\/\d+$/)
    await expect(page.getByRole('heading', { name: `${ACCOUNTS.plain.name} ${ACCOUNTS.plain.surname}` })).toBeVisible()
  })
})

test.describe('as a plain user', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'plain')
    await page.goto('/users')
    await expect(page.getByRole('link', { name: 'Uroš Minić' })).toBeVisible()
  })

  /** Reading the list is open to anyone signed in; writing is not. */
  test('reads the list but is offered nothing to change', async ({ page }) => {
    await expect(page.getByRole('link', { name: `${ACCOUNTS.admin.name} ${ACCOUNTS.admin.surname}` })).toBeVisible()
    await expect(page.getByTestId('new-user')).toHaveCount(0)

    await page.locator('[data-testid^="user-actions-"]').first().click()

    await expect(page.getByRole('menuitem', { name: 'Detalji naloga' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Izmeni podatke' })).toHaveCount(0)
  })
})
