import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const BaseRoute: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/test',
    children: [
      {
        path: '/flutter',
        name: 'flutter',
        component: () => import('@/views/flutter/index.vue'),
      },
    ],
  },
]

export default BaseRoute
