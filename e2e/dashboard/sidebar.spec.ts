import { test, expect } from '@playwright/test'
import { ACCOUNTS } from '../support/accounts'
import { signIn } from '../support/session'

test.beforeEach(async ({ page }) => {
  await signIn(page, 'admin')
  await page.goto('/')
  await expect(page.getByTestId('greeting')).toBeVisible()
})

test('collapses and expands the sidebar, and remembers the choice', async ({ page }) => {
  // Nuxt UI builds the DOM id as `${storageKey}-sidebar-${id}` from MainLayout + AppSidebar.
  const sidebar = page.locator('#app-dashboard-sidebar-main')
  const userMenu = page.getByTestId('user-menu')

  await expect(userMenu).toContainText(`${ACCOUNTS.admin.name} ${ACCOUNTS.admin.surname}`)

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await expect(userMenu).not.toContainText(ACCOUNTS.admin.surname)

  await page.reload()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
})

test('navigates through single and expandable menu items', async ({ page }) => {
  await page.getByRole('link', { name: 'Korisnici' }).click()
  await expect(page).toHaveURL('/users')

  // The Settings group is `defaultOpen` in `layouts/navigation.ts`, so its children are already
  // reachable — clicking the group first would collapse it out from under the link.
  const settings = page.getByRole('button', { name: 'Podešavanja' })
  await expect(settings).toHaveAttribute('aria-expanded', 'true')

  await page.getByRole('link', { name: 'Moj nalog' }).click()

  await expect(page).toHaveURL('/settings/profile')
  await expect(page.locator('dd', { hasText: ACCOUNTS.admin.email })).toBeVisible()
})

/**
 * Both halves matter, and each stands for a bug this replaced. "Početna" used to be lit
 * everywhere, because `home` is an index route (`path: ''`) and Vue Router matches those
 * through the parent record that every page under `MainLayout` shares. "Korisnici" used to go
 * dark on a user's detail page, because that route is the list's sibling rather than its
 * child. `layouts/navigation.ts` now decides this by section instead of by link matching.
 */
test('lights the section you are in, and only that one', async ({ page }) => {
  const home = page.getByRole('link', { name: 'Početna' })
  const users = page.getByRole('link', { name: 'Korisnici' })
  const profile = page.getByRole('link', { name: 'Moj nalog' })
  const appearance = page.getByRole('link', { name: 'Izgled' })

  await expect(home).toHaveAttribute('aria-current', 'page')
  await expect(users).not.toHaveAttribute('aria-current', 'page')

  await users.click()
  await expect(page).toHaveURL('/users')
  await expect(users).toHaveAttribute('aria-current', 'page')
  await expect(home).not.toHaveAttribute('aria-current', 'page')

  // The whole point of matching by section: a detail page is not the route the entry links to.
  await page.getByRole('link', { name: `${ACCOUNTS.plain.name} ${ACCOUNTS.plain.surname}` }).click()
  await expect(page).toHaveURL(/\/users\/\d+$/)
  await expect(users).toHaveAttribute('aria-current', 'page')
  await expect(home).not.toHaveAttribute('aria-current', 'page')

  // Siblings inside one group match their own route, so only one of the two is ever lit.
  await profile.click()
  await expect(page).toHaveURL('/settings/profile')
  await expect(profile).toHaveAttribute('aria-current', 'page')
  await expect(appearance).not.toHaveAttribute('aria-current', 'page')
  await expect(users).not.toHaveAttribute('aria-current', 'page')
  await expect(home).not.toHaveAttribute('aria-current', 'page')
})

test('collapses and reopens an expandable menu group', async ({ page }) => {
  const settings = page.getByRole('button', { name: 'Podešavanja' })
  const child = page.getByRole('link', { name: 'Izgled' })

  await expect(child).toBeVisible()

  await settings.click()
  await expect(settings).toHaveAttribute('aria-expanded', 'false')
  await expect(child).toBeHidden()

  await settings.click()
  await expect(child).toBeVisible()
})

test('switches to dark mode from the user menu', async ({ page }) => {
  await page.getByTestId('user-menu').click()
  await page.getByRole('menuitem', { name: 'Tema' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Tamna' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('shows the sidebar as an overlay on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const nav = page.getByRole('link', { name: 'Korisnici' })
  await expect(nav).toBeHidden()

  await page.getByRole('button', { name: 'Open sidebar' }).click()
  await expect(nav).toBeVisible()

  await nav.click()
  await expect(page).toHaveURL('/users')
  // `autoClose` on UDashboardSidebar dismisses the overlay once the route changes.
  await expect(nav).toBeHidden()
})

test('animates the sidebar width instead of snapping', async ({ page }) => {
  const sidebar = page.locator('#app-dashboard-sidebar-main')

  await expect(sidebar).toHaveCSS('transition-property', 'width')
  await expect(sidebar).toHaveCSS('transition-duration', '0.2s')
})

test('runs the page transition on a route change', async ({ page }) => {
  // Visit the target once so its lazy chunk is cached. `mode="out-in"` runs the enter phase only
  // after the incoming component resolves, and on a cold dev server that fetch outlasts the
  // 200ms window this test is watching for.
  await page.getByRole('link', { name: 'Korisnici' }).click()
  await expect(page).toHaveURL('/users')
  await page.getByRole('link', { name: 'Početna' }).click()
  await expect(page).toHaveURL('/')

  // Start waiting before the click: the enter phase only lasts 200ms.
  const entering = page.locator('.page-enter-active').waitFor({ state: 'attached', timeout: 3000 })

  await page.getByRole('link', { name: 'Korisnici' }).click()

  await entering
  await expect(page).toHaveURL('/users')
})

test('lands an unknown address on the not-found page', async ({ page }) => {
  await page.goto('/ne-postoji')

  await expect(page.getByRole('heading', { name: 'Stranica ne postoji' })).toBeVisible()
  await page.getByRole('link', { name: 'Nazad na početnu' }).click()
  await expect(page).toHaveURL('/')
})
