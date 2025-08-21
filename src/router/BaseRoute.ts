import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const BaseRoute: RouteRecordRaw[] = [
  {
    path: '/',
    meta: {
      hidden: true,
    },
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '首页',
          icon: 'home',
        },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/flutter',
        name: 'flutter',
        meta: {
          title: 'Flutter',
          icon: 'flutter',
        },
        component: () => import('@/views/flutter/index.vue'),
        children: [
          {
            path: 'response-to-model',
            name: 'responseToModel',
            meta: {
              title: '生成数据模型',
              icon: 'json-parse',
            },
            component: () => import('@/views/flutter/response-to-model/index.vue'),
          },
        ],
      },
      {
        path: '/json',
        name: 'json',
        meta: {
          title: 'JSON',
          icon: 'json',
        },
        component: () => import('@/views/json/index.vue'),
      },
    ],
  },
]

export default BaseRoute
