<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import useThemeStore from '@/stores/useThemeStore.ts'
import { JumpIcon } from 'tdesign-icons-vue-next'

const themeStore = useThemeStore()
const text = ref('')
</script>

<template>
  <div class="w-full container-h">
    <md-editor
      id="md-editor"
      class="w-full"
      style="height: 100%"
      v-model="text"
      :theme="themeStore.effectiveModel"
      preview-theme="vuepress"
    />
  </div>
  <div class="mt-10px">
    <t-alert theme="info">
      该编辑器集成自
      <t-link
        theme="primary"
        size="medium"
        href="https://flutter.dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        <template #suffix-icon>
          <jump-icon />
        </template>
        md-editor-v3
      </t-link>
    </t-alert>
  </div>
</template>

<style scoped></style>
