import compression from 'vite-plugin-compression'
import { PluginOption } from 'vite'
import { EnvConfig } from '../vite.config'

interface CompressOptions {
  threshold?: number
  algorithm?: 'gzip' | 'brotliCompress'
  ext?: '.gz' | '.br'
}

export default function createCompression(env: EnvConfig): PluginOption[] {
  const { VITE_BUILD_COMPRESS } = env
  const plugins: PluginOption[] = []

  if (!VITE_BUILD_COMPRESS) {
    return plugins
  }

  const compressList = VITE_BUILD_COMPRESS.split(',')
  const defaultOptions: CompressOptions = {
    threshold: 10240, // 压缩阈值，单位 B
  }

  if (compressList.includes('gzip')) {
    plugins.push(
      compression({
        ...defaultOptions,
        ext: '.gz',
        deleteOriginFile: false,
      }),
    )
  }

  if (compressList.includes('brotli')) {
    plugins.push(
      compression({
        ...defaultOptions,
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile: false,
      }),
    )
  }

  return plugins
}
