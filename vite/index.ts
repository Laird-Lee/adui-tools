import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { PluginOption } from 'vite'
import createUnocssPlugin from './unocss'
import createHTMLPlugin from './html'
import createSvgIcon from './svg-icon'
import createComponentsPlugin from './components'
import createCompression from './compression'
import createDevToolsPlugin from './dev-tools'
import { EnvConfig } from '../vite.config'

export interface VitePluginOptions {
  enableDevTools?: boolean
}

export default function createVitePlugin(
  env: EnvConfig,
  isBuild = false,
  options: VitePluginOptions = {},
): PluginOption[] {
  const { enableDevTools = env.VITE_APP_ENV === 'development' } = options

  // 基础插件
  const basePlugins: PluginOption[] = [
    vue(),
    vueJsx(),
    createUnocssPlugin(),
    createHTMLPlugin(env),
    createSvgIcon(isBuild),
    ...createComponentsPlugin(),
  ]

  // 开发环境插件
  const devPlugins: PluginOption[] = enableDevTools ? [createDevToolsPlugin()] : []

  // 生产环境插件
  const buildPlugins: PluginOption[] = isBuild ? [...createCompression(env)] : []

  return [...basePlugins, ...devPlugins, ...buildPlugins].filter(Boolean)
}
