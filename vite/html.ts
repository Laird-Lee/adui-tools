import { createHtmlPlugin } from 'vite-plugin-html'
import { PluginOption } from 'vite'
import { EnvConfig } from '../vite.config'

export default function createHTMLPlugin(env: EnvConfig): PluginOption {
  return createHtmlPlugin({
    minify: true,
    inject: {
      data: {
        title: env.VITE_APP_TITLE,
      },
    },
  })
}
