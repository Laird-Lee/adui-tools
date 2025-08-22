<script setup lang="ts">
import { ref, shallowRef, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import type { editor as MonacoEditor, IDisposable } from 'monaco-editor'
import useThemeStore from '@/stores/useThemeStore.ts'
import {
  JETBRAINS_DARK,
  JETBRAINS_LIGHT,
  registerJetBrainsThemes,
} from '@/components/lib/themes/monaco-jetbrains.ts'

const themeStore = useThemeStore()

// 注册自定义 JetBrains 主题（只会注册一次）
registerJetBrainsThemes(monaco)

// 根据全局主题计算编辑器主题名
const themeName = computed(() =>
  themeStore.effectiveModel === 'dark' ? JETBRAINS_DARK : JETBRAINS_LIGHT,
)

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  readOnly: { type: Boolean, default: false },
  lineNumbers: { type: Boolean, default: true },
  minimap: { type: Boolean, default: true },
  wordWrap: { type: Boolean, default: true }, // 是否自动换行
  tabSize: { type: Number, default: 2 },
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
}>()

const codeRef = ref<HTMLDivElement | null>(null)
const editorInstance = shallowRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
let resizeObserver: ResizeObserver | null = null
let contentChangeDisposable: IDisposable | null = null
let layoutDisposable: IDisposable | null = null

// 同步左侧行号栏（gutter）宽度到容器 CSS 变量，配合背景渐变实现“行号撑满高度”的视觉效果
function updateGutterWidth() {
  const ed = editorInstance.value
  const el = codeRef.value
  if (!ed || !el) return
  const info = ed.getLayoutInfo()
  const width = info.lineNumbersWidth ?? 0
  el.style.setProperty('--gutter-width', `${Math.max(0, width)}px`)
}

// 根据主题同步 gutter 背景色
function syncGutterBgOnce() {
  const el = codeRef.value
  if (!el) return
  const gutterBg = themeStore.effectiveModel === 'dark' ? '#1f1f1f' : '#ffffff'
  el.style.setProperty('--gutter-bg', gutterBg)
}

// 主题变化 -> 切换 Monaco 主题并同步 gutter 背景
watch(
  () => themeName.value,
  (t) => {
    monaco.editor.setTheme(t)
    syncGutterBgOnce()
  },
)

// 创建编辑器
function createEditor() {
  const el = codeRef.value
  if (!el) return

  editorInstance.value = monaco.editor.create(el, {
    value: props.modelValue ?? '',
    language: props.language,
    theme: themeName.value, // 跟随全局主题
    readOnly: props.readOnly,
    lineNumbers: props.lineNumbers ? 'on' : 'off',
    minimap: { enabled: props.minimap },
    wordWrap: props.wordWrap ? 'on' : 'off',
    tabSize: props.tabSize,
    automaticLayout: false,
    scrollbar: { verticalScrollbarSize: 12, horizontalScrollbarSize: 12 },

    // JetBrains 字体
    fontFamily:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontLigatures: false,
    fontSize: 14,
    lineHeight: 22,
  })

  // 初始同步 gutter
  syncGutterBgOnce()
  updateGutterWidth()

  // 布局变化 -> 更新 gutter 宽度
  layoutDisposable = editorInstance.value.onDidLayoutChange(() => {
    updateGutterWidth()
  })

  // 内容变化 -> v-model
  contentChangeDisposable = editorInstance.value.onDidChangeModelContent(() => {
    const val = editorInstance.value?.getValue() ?? ''
    if (val !== props.modelValue) {
      emit('update:modelValue', val)
      emit('change', val)
    }
  })

  // 自适应容器尺寸
  resizeObserver = new ResizeObserver(() => {
    editorInstance.value?.layout()
    updateGutterWidth()
  })
  resizeObserver.observe(el)
}

// 销毁编辑器与监听
function disposeEditor() {
  contentChangeDisposable?.dispose()
  contentChangeDisposable = null
  layoutDisposable?.dispose()
  layoutDisposable = null
  resizeObserver?.disconnect()
  resizeObserver = null
  editorInstance.value?.dispose()
  editorInstance.value = null
}

onMounted(async () => {
  await nextTick()
  createEditor()
})

onBeforeUnmount(() => {
  disposeEditor()
})

// 外部更新内容 -> 同步编辑器
watch(
  () => props.modelValue,
  (v) => {
    const ed = editorInstance.value
    if (!ed) return
    const curr = ed.getValue()
    if (v !== curr) {
      const model = ed.getModel()
      if (model) {
        ed.executeEdits('external-update', [{ range: model.getFullModelRange(), text: v ?? '' }])
        ed.pushUndoStop()
      } else {
        ed.setValue(v ?? '')
      }
    }
  },
)

// 语言切换
watch(
  () => props.language,
  (lang) => {
    const ed = editorInstance.value
    const model = ed?.getModel()
    if (model) monaco.editor.setModelLanguage(model, lang)
  },
)

// 只读/行号/换行/miniMap/tabSize 配置变化
watch(
  () => [props.readOnly, props.lineNumbers, props.wordWrap, props.minimap, props.tabSize],
  () => {
    const ed = editorInstance.value
    if (!ed) return
    ed.updateOptions({
      readOnly: props.readOnly,
      lineNumbers: props.lineNumbers ? 'on' : 'off',
      wordWrap: props.wordWrap ? 'on' : 'off',
      minimap: { enabled: props.minimap },
      tabSize: props.tabSize,
    })
    updateGutterWidth()
  },
)
</script>

<template>
  <div ref="codeRef" class="code-editor w-full h-full" />
</template>

<style scoped lang="less">
.code-editor {
  border: 1px solid var(--td-border-color-default);
  border-radius: var(--td-radius-default);
  overflow: hidden;

  /* 外发光 */
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--td-brand-color-3) 20%, transparent),
    0 0 18px 0 color-mix(in srgb, var(--td-brand-color-3) 35%, transparent);
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  /* 行号栏整高铺底（与 Monaco 实际行号宽同步） */
  --gutter-width: 48px; /* 初始占位，JS 初始化后覆盖 */
  --gutter-bg: #ffffff; /* 初始占位，主题变化时覆盖 */

  background-image: linear-gradient(
    to right,
    var(--gutter-bg) 0,
    var(--gutter-bg) var(--gutter-width),
    transparent var(--gutter-width)
  );
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.code-editor:hover,
.code-editor:focus-within {
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--td-brand-color-4) 30%, transparent),
    0 0 28px 0 color-mix(in srgb, var(--td-brand-color-4) 55%, transparent);
}
</style>
