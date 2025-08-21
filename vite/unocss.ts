import UnoCSS from 'unocss/vite'
import { PluginOption } from 'vite'

export default function createUnocssPlugin(): PluginOption {
  return UnoCSS()
}
