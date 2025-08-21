<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuValue } from 'tdesign-vue-next'

type RouteMeta = { title: string; icon?: string; hidden?: boolean; [k: string]: unknown }
type MenuNode = {
  key: string
  path: string
  label: string
  icon?: string
  children?: MenuNode[]
}

const router = useRouter()
const route = useRoute()

const splitDepth = (p: string) => p.split('/').filter(Boolean).length

const visibleRoutes = computed(() =>
  router.getRoutes().filter((r) => r.path && r.path !== '/' && !(r.meta as RouteMeta)?.hidden),
)

const menus = computed<MenuNode[]>(() => {
  const all = visibleRoutes.value
  const topLevel = all.filter((r) => splitDepth(r.path) === 1)
  return topLevel.map((top) => {
    const children = all
      .filter(
        (r) => r.path.startsWith(top.path + '/') && splitDepth(r.path) === splitDepth(top.path) + 1,
      )
      .map<MenuNode>((r) => ({
        key: r.path,
        path: r.path,
        label: (r.meta as RouteMeta)?.title ?? r.name?.toString() ?? r.path,
        icon: (r.meta as RouteMeta)?.icon,
      }))
    return {
      key: top.path,
      path: top.path,
      label: (top.meta as RouteMeta)?.title ?? top.name?.toString() ?? top.path,
      icon: (top.meta as RouteMeta)?.icon,
      children: children.length ? children : undefined,
    }
  })
})

const activeKey = computed(() => route.path)

const handleChange = (val: MenuValue) => {
  router.push(val as string)
}
</script>

<template>
  <t-header>
    <div class="w-1440px mx-auto">
      <t-head-menu
        theme="light"
        height="64px"
        expand-type="popup"
        :value="activeKey"
        @change="handleChange"
      >
        <template v-for="item in menus" :key="item.key">
          <t-submenu v-if="item.children && item.children.length" :value="item.key">
            <template #icon>
              <svg-icon v-if="item.icon" :name="item.icon" />
            </template>
            <template #title>
              {{ item.label }}
            </template>
            <t-menu-item v-for="child in item.children" :key="child.key" :value="child.key">
              <template #icon>
                <svg-icon v-if="child.icon" :name="child.icon" />
              </template>
              {{ child.label }}
            </t-menu-item>
          </t-submenu>
          <t-menu-item v-else :value="item.key">
            <template #icon>
              <svg-icon v-if="item.icon" :name="item.icon" />
            </template>
            {{ item.label }}
          </t-menu-item>
        </template>
      </t-head-menu>
    </div>
  </t-header>
</template>

<style scoped></style>
