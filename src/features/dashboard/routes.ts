import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('@/pages/dashboard/HomePage.vue'),
    meta: { title: 'Home' },
  },
  {
    path: 'reports',
    name: 'reports',
    component: () => import('@/pages/dashboard/ReportsPage.vue'),
    meta: { title: 'Reports' },
  },
]
