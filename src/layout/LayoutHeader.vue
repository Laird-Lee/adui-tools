<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuValue, RadioValue } from 'tdesign-vue-next'
import { LogoGithubFilledIcon } from 'tdesign-icons-vue-next'
import useThemeStore from '@/stores/useThemeStore.ts'

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

const title = import.meta.env.VITE_APP_TITLE

const themeStore = useThemeStore()

const activeModel = computed(() => themeStore.effectiveModel)

const handleChangeModel = (val: RadioValue) => {
  themeStore.setModel(val as 'light' | 'dark')
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
        <template #logo>
          <h1 class="flex items-center">
            <a href="/" class="flex items-center gap-10px">
              <img class="w-50px" src="@/assets/images/logo.svg" :alt="title" />
              <div>{{ title }}</div>
            </a>
          </h1>
        </template>
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
                <svg-icon v-if="child.icon" :name="child.icon" class-name="mr-5px" />
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
        <template #operations>
          <div class="flex items-center gap-10px">
            <t-button
              shape="circle"
              variant="text"
              tag="a"
              href="https://github.com/Laird-Lee/adui-tools"
              target="_blank"
            >
              <template #icon><logo-github-filled-icon /></template>
            </t-button>
            <t-radio-group
              variant="default-filled"
              :value="activeModel"
              @change="handleChangeModel"
            >
              <t-radio-button value="light"><t-icon name="sunny"></t-icon></t-radio-button>
              <t-radio-button value="dark"><t-icon name="moon"></t-icon></t-radio-button>
            </t-radio-group>
          </div>
        </template>
      </t-head-menu>
    </div>
  </t-header>
</template>

<style scoped lang="less">
a.flex {
  all: unset; /* 移除所有继承和默认样式 */
  display: flex; /* 重新添加需要的flex布局 */
  align-items: center; /* 重新添加对齐方式 */
  gap: 10px; /* 重新添加间距 */
  text-decoration: none; /* 确保无下划线 */
  color: inherit; /* 继承父元素文字颜色 */
  cursor: pointer; /* 保持指针样式 */
}
</style>
