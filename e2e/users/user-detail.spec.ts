import { test, expect } from '@playwright/test'
import { ACCOUNTS } from '../support/accounts'
import { signIn } from '../support/session'

/** Marko changed his surname and email, so his trail has a diff worth rendering. */
const WITH_HISTORY = 16

test.describe('as an administrator', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'admin')
    await page.goto(`/users/${WITH_HISTORY}`)
  })

  /**
   * The detail page is the one screen the sidebar cannot reach, so the navbar carries the
   * only way up. Asserting its absence on the list matters as much as its presence here:
   * the button is driven by `meta.back`, and a route that grew one by accident would put a
   * back arrow on a page that is already a sidebar destination.
   */
  test('goes back to the list from the navbar', async ({ page }) => {
    await page.getByTestId('page-back').click()

    await expect(page).toHaveURL(/\/users$/)
    await expect(page.getByTestId('page-back')).toHaveCount(0)
  })

  test('shows both audit trails', async ({ page }) => {
    await expect(page.getByTestId('user-logs')).toBeVisible()
    await expect(page.getByTestId('user-logins')).toBeVisible()

    await expect(page.getByTestId('user-logs')).toContainText('Nalog kreiran')
    await expect(page.getByTestId('user-logins')).toContainText('Uspešna prijava')
  })

  test('translates the recorded events and shows what changed', async ({ page }) => {
    const logs = page.getByTestId('user-logs')

    await expect(logs).toContainText('Podaci izmenjeni')
    await expect(logs).toContainText('surname')
  })

  test('offers the write actions', async ({ page }) => {
    await expect(page.getByTestId('edit-user')).toBeVisible()
    await expect(page.getByTestId('change-role')).toBeVisible()
    await expect(page.getByTestId('deactivate-user')).toBeVisible()
  })

  /** Same two refusals as in the list: an admin may edit themselves and nothing more. */
  test('hides role change and deactivation on the admin\'s own account', async ({ page }) => {
    await page.goto('/users')
    await page.getByTestId('users-search').fill(ACCOUNTS.admin.email)
    await page.getByRole('link', { name: `${ACCOUNTS.admin.name} ${ACCOUNTS.admin.surname}` }).click()

    await expect(page.getByTestId('edit-user')).toBeVisible()
    await expect(page.getByTestId('change-role')).toHaveCount(0)
    await expect(page.getByTestId('deactivate-user')).toHaveCount(0)
  })

  test('reports a missing account instead of rendering an empty profile', async ({ page }) => {
    await page.goto('/users/999999')

    await expect(page.getByTestId('user-error')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nazad na listu' })).toBeVisible()
  })
})

test.describe('as a plain user', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, 'plain')
  })

  /**
   * Both trails are admin-only. The point is not just that they are hidden — the requests are
   * never made, because they could only ever come back 403.
   */
  test('sees the profile without the audit trails, and asks for neither', async ({ page }) => {
    const historyCalls: string[] = []
    page.on('request', (request) => {
      if (/\/users\/\d+\/(logs|logins)/.test(request.url())) {
        historyCalls.push(request.url())
      }
    })

    await page.goto(`/users/${WITH_HISTORY}`)

    await expect(page.getByRole('heading', { name: 'Marko Petrović-Ilić' })).toBeVisible()
    await expect(page.getByTestId('user-logs')).toHaveCount(0)
    await expect(page.getByTestId('user-logins')).toHaveCount(0)
    await expect(page.getByTestId('edit-user')).toHaveCount(0)

    expect(historyCalls).toHaveLength(0)
  })
})
