<script setup lang="ts"></script>

<template>
  <t-content>
    <div>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </t-content>
</template>

<style scoped></style>
