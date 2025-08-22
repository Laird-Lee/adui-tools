<script setup lang="ts"></script>

<template>
  <t-config-provider>
    <div class="app-container">
      <router-view class="w-full h-full" v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </t-config-provider>
</template>

<style lang="less">
.app-container {
  view-transition-name: page;
}
</style>
