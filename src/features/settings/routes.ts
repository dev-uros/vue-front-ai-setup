import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: 'settings/profile',
    name: 'settings-profile',
    component: () => import('@/pages/settings/ProfilePage.vue'),
    meta: { title: 'Moj nalog' },
  },
  {
    path: 'settings/appearance',
    name: 'settings-appearance',
    component: () => import('@/pages/settings/AppearancePage.vue'),
    meta: { title: 'Izgled' },
  },
]
