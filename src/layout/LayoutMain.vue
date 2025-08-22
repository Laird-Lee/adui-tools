<script setup lang="ts">
const route = useRoute()

const breadcrumb = computed(() => [
  {
    path: '/home',
    name: 'home',
    meta: {
      title: '首页',
      icon: 'home',
    },
  },
  ...route.matched.filter((r) => !r.meta.hidden),
])
</script>

<template>
  <t-content>
    <div class="layout-container">
      <div v-if="route.name !== 'home'" class="mt-20px mb-20px flex items-center">
        <div>当前位置：</div>
        <t-breadcrumb>
          <template #separator>
            <t-icon name="gesture-right"></t-icon>
          </template>
          <t-breadcrumb-item v-for="item in breadcrumb" :key="item.path" :to="item.path">
            <template v-if="item.meta.icon" #icon>
              <svg-icon class-name="mr-5px" :name="item.meta.icon as string" />
            </template>
            {{ item.meta.title }}
          </t-breadcrumb-item>
        </t-breadcrumb>
      </div>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </t-content>
</template>

<style scoped lang="less">
.layout-container {
  width: 1440px;
  margin: 0 auto;
}
</style>
