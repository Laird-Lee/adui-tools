import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import * as path from 'node:path'
import { PluginOption } from 'vite'

export default function createSvgIcon(isBuild: boolean): PluginOption {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: isBuild
      ? {
          plugins: [
            {
              name: 'removeAttrs',
              params: { attrs: ['class', 'data-name', 'fill', 'stroke'] },
            },
            {
              name: 'removeTitle',
            },
            {
              name: 'removeStyleElement',
            },
            {
              name: 'removeScriptElement',
            },
          ],
        }
      : false,
  })
}
