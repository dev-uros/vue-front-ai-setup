import type { RouteRecordRaw } from 'vue-router'

/**
 * The external mobile app's accounts. Reading is open to anyone signed in, like the staff
 * list; the block controls inside the pages are admin-only, and the API is the protection.
 */
export const mobileUsersRoutes: RouteRecordRaw[] = [
  {
    path: 'mobile-users',
    name: 'mobile-users-list',
    component: () => import('@/pages/mobile-users/MobileUsersPage.vue'),
    meta: { title: 'Korisnici aplikacije', icon: 'i-lucide-smartphone' },
  },
  {
    path: 'mobile-users/:id(\\d+)',
    name: 'mobile-users-detail',
    component: () => import('@/pages/mobile-users/MobileUserDetailPage.vue'),
    meta: {
      title: 'Korisnik aplikacije',
      icon: 'i-lucide-smartphone',
      back: { name: 'mobile-users-list' },
    },
  },
]
