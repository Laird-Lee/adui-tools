import type { App } from 'vue'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BaseRoute from '@/router/BaseRoute.ts'

const BaseUrl = import.meta.env.VITE_BASE_URL

const routes: RouteRecordRaw[] = [...BaseRoute]

export const router = createRouter({
  history: createWebHashHistory(BaseUrl),
  routes: routes,
})

export async function setupRouter(app: App<Element>) {
  app.use(router)
  await router.isReady()
}

export default router
