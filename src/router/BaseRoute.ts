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
            path: 'json-to-model',
            name: 'jsonToModel',
            meta: {
              title: 'JSON 转 Dart 数据模型',
            },
            component: () => import('@/views/flutter/json-to-model/index.vue'),
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
      {
        path: '/markdown',
        name: 'markdown',
        meta: {
          title: 'Markdown',
          icon: 'markdown',
        },
        component: () => import('@/views/markdown/index.vue'),
        children: [
          {
            path: 'editor',
            name: 'markdownEditor',
            meta: {
              title: 'Markdown 编辑器',
            },
            component: () => import('@/views/markdown/editor/index.vue'),
          },
        ],
      },
      {
        path: '/colors',
        name: 'colors',
        meta: {
          title: '色值转换',
          icon: 'colors',
        },
        component: () => import('@/views/colors/index.vue'),
      },
    ],
  },
]

export default BaseRoute
