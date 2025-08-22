import { applyTheme } from '@/utils/theme'

type Model = 'light' | 'dark'
type ModeSource = 'system' | 'manual'

const useThemeStore = defineStore(
  'theme',
  () => {
    const source = ref<ModeSource>('system') // 当前来源：system/manual
    const currentModel = ref<Model>('light') // 用户手动指定的模型
    const systemModel = ref<Model>('light') // 系统模型（由媒体查询驱动）

    // 初始化系统模型
    const getSystemModel = (): Model => {
      if (typeof window === 'undefined' || !window.matchMedia) return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    systemModel.value = getSystemModel()

    // 最终生效的模型：手动优先生效，否则跟随系统
    const effectiveModel = computed<Model>(() =>
      source.value === 'manual' ? currentModel.value : systemModel.value,
    )

    // 监听系统主题变化（仅当 source 为 system 时生效）
    let mql: MediaQueryList | null = null
    const onMediaChange = (e: MediaQueryListEvent) => {
      systemModel.value = e.matches ? 'dark' : 'light'
      // 不在这里直接调用 applyTheme，由 effectiveModel 的 watcher 统一处理
    }
    const startWatchSystem = () => {
      if (typeof window === 'undefined' || !window.matchMedia) return
      if (mql) return
      mql = window.matchMedia('(prefers-color-scheme: dark)')
      mql.addEventListener?.('change', onMediaChange)
    }
    const stopWatchSystem = () => {
      mql?.removeEventListener?.('change', onMediaChange)
      mql = null
    }

    // 根据来源切换系统监听
    watch(
      () => source.value,
      (src) => {
        if (src === 'system') {
          systemModel.value = getSystemModel()
          startWatchSystem()
        } else {
          stopWatchSystem()
        }
      },
      { immediate: true },
    )

    // 首次应用不使用转场，后续变化使用转场
    const isFirstApply = ref(true)
    watch(
      () => effectiveModel.value,
      async (val) => {
        const useTransition = !isFirstApply.value
        await applyTheme(val, useTransition)
        if (isFirstApply.value) isFirstApply.value = false
      },
    )

    // 操作方法（状态更新，主题应用由上面的 watcher 统一处理）
    const toggleModel = () => {
      source.value = 'manual'
      currentModel.value = currentModel.value === 'light' ? 'dark' : 'light'
    }

    const setModel = (theme: Model) => {
      source.value = 'manual'
      currentModel.value = theme
    }

    const useSystemModel = () => {
      source.value = 'system'
    }

    // 可用于 UI：当前是否跟随系统
    const isSystem = computed(() => source.value === 'system')

    // 组件/应用卸载时的清理（可由调用方在合适时机调用）
    const dispose = () => {
      stopWatchSystem()
    }

    return {
      // 状态
      source,
      currentModel,
      systemModel,
      effectiveModel,
      isSystem,
      // 方法
      toggleModel,
      setModel,
      useSystemModel,
      dispose,
    }
  },
  {
    persist: true,
  },
)

export default useThemeStore
