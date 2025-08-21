import vueDevTools from 'vite-plugin-vue-devtools'
import { PluginOption } from 'vite'

interface DevToolsOptions {
  enabled?: boolean
}

export default function createDevToolsPlugin(options: DevToolsOptions = {}): PluginOption {
  const { enabled = true } = options

  if (!enabled) {
    return null
  }

  return vueDevTools()
}
