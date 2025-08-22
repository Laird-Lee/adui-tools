// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    // 容器高度：视口高度 - 188px
    'container-h': 'h-[calc(100vh-188px)]',
  },
})
