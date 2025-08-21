<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    prefix?: string
    size?: number | string
    color?: string
    spin?: boolean
    className?: string
  }>(),
  {
    prefix: 'icon',
    size: '1em',
    color: '',
    spin: false,
    className: '',
  },
)

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    :class="['svg-icon', { 'is-spin': spin }, className]"
    aria-hidden="true"
    :style="{ width: sizePx, height: sizePx, color }"
  >
    <use :href="symbolId" :xlink:href="symbolId" fill="currentColor" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  outline: none;
}
.is-spin {
  animation: svg-icon-rotate 1s linear infinite;
}
@keyframes svg-icon-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
