import type { RouteRecordRaw } from 'vue-router'

/**
 * Mounted by the root router under the main layout, so paths here are relative and every
 * route sits behind the auth guard by default.
 *
 * Reading is open to anyone signed in; the write controls inside the pages are admin-only.
 * Guarding the routes themselves on role would hide the list from the plain users who are
 * allowed to see it.
 */
export const usersRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'users-list',
    component: () => import('@/pages/users/UsersPage.vue'),
    meta: { title: 'Korisnici', icon: 'i-lucide-users' },
  },
  {
    // The API answers 404 for a non-numeric id before the request enters the app, so the
    // route only matches digits and a typo lands on the router's own miss instead.
    path: 'users/:id(\\d+)',
    name: 'users-detail',
    component: () => import('@/pages/users/UserDetailPage.vue'),
    meta: { title: 'Detalji korisnika', icon: 'i-lucide-user', back: { name: 'users-list' } },
  },
]
