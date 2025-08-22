<script setup lang="ts">
const startYear = 2025
const currentYear = new Date().getFullYear()
const yearText = computed(() =>
  currentYear > startYear ? `${startYear}-${currentYear}` : `${startYear}`,
)
</script>

<template>
  <t-footer>
    <div class="w-full h-full flex justify-center items-center">
      版权所有 &copy; {{ yearText }} ADui. 保留所有权利
    </div>
  </t-footer>
</template>

<style scoped></style>
