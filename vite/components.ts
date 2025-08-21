import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { TDesignResolver } from 'unplugin-vue-components/resolvers'
import { PluginOption } from 'vite'

export default function createComponentsPlugin(): PluginOption[] {
  return [
    AutoImport({
      // 自动导入 Vue 相关函数
      imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
      // 指定文件生成位置
      dts: 'src/auto-imports.d.ts',
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
      // 生成eslint配置
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      // 指定组件位置
      dirs: ['src/components'],
      // 组件的有效文件扩展名
      extensions: ['vue', 'tsx'],
      // 配置type文件生成位置
      dts: 'src/components.d.ts',
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
  ]
}
