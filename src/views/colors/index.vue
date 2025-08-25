<script setup lang="ts">
const color = ref('')

const mainColorType = ref([
  {
    type: 'HEX',
    value: '',
  },
  {
    type: 'RGB / A',
    value: '',
  },
  {
    type: 'HSL / A',
    value: '',
  },
  {
    type: 'HSV / A',
    value: '',
  },
  {
    type: 'CMYK / A',
    value: '',
  },
])
const colorType = ['HEX', 'RGB / A', 'HSL / A', 'HSV / A', 'CMYK / A']

// ---------- 类型与工具 ----------
type RGB = { r: number; g: number; b: number; a?: number }
type HSL = { h: number; s: number; l: number; a?: number }
type HSV = { h: number; s: number; v: number; a?: number }
type CMYK = { c: number; m: number; y: number; k: number }

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const round = (n: number, p = 0) => {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}
const toHex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')

// ---------- 解析 ----------
function parseHexToRgb(str: string): RGB | null {
  if (!str) return null
  let s = str.trim().toLowerCase()
  if (s.startsWith('#')) s = s.slice(1)
  if (![3, 4, 6, 8].includes(s.length)) return null
  if (s.length === 3 || s.length === 4) {
    const r = parseInt(s[0] + s[0], 16)
    const g = parseInt(s[1] + s[1], 16)
    const b = parseInt(s[2] + s[2], 16)
    const a = s.length === 4 ? parseInt(s[3] + s[3], 16) / 255 : 1
    return { r, g, b, a }
  }
  if (s.length === 6 || s.length === 8) {
    const r = parseInt(s.slice(0, 2), 16)
    const g = parseInt(s.slice(2, 4), 16)
    const b = parseInt(s.slice(4, 6), 16)
    const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }
  return null
}

function parseRgbString(input: string): RGB | null {
  if (!input) return null
  const s = input.trim().replace(/\s+/g, '')
  // rgb(255,0,0) / rgba(255,0,0,0.5)
  const m =
    s.match(/^rgba?\((\d{1,3}),( \d{1,3}| \d{1,3}|(?:\d{1,3})),(\d{1,3})(?:,([\d.]+))?\)$/i) ||
    s.match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,([\d.]+))?\)$/i)
  if (!m) return null
  const r = Number(m[1])
  const g = Number(m[2])
  const b = Number(m[3])
  const a = m[4] !== undefined ? Number(m[4]) : 1
  if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) return null
  return { r, g, b, a: clamp(a, 0, 1) }
}

function parseHslString(input: string): HSL | null {
  if (!input) return null
  const s = input.trim().toLowerCase().replace(/\s+/g, '')
  // hsl(200deg,50%,40%) / hsla(200,50%,40%,0.5)
  const re = /^hsla?\(([-\d.]+)(?:deg)?,([-\d.]+)%,([-\d.]+)%(?:,([-\d.]+))?\)$/
  const m = s.match(re)
  if (!m) return null
  const h = Number(m[1])
  const se = Number(m[2])
  const l = Number(m[3])
  const a = m[4] !== undefined ? Number(m[4]) : 1
  if ([se, l].some((v) => isNaN(v) || v < 0 || v > 100)) return null
  if (isNaN(h)) return null
  return { h: ((h % 360) + 360) % 360, s: se, l, a: clamp(a, 0, 1) }
}

function parseHsvString(input: string): HSV | null {
  if (!input) return null
  const s = input.trim().toLowerCase().replace(/\s+/g, '')
  // hsv(200deg,50%,40%) 这里不定义 a，若需要可扩展
  const re = /^hsv\(([-\d.]+)(?:deg)?,([-\d.]+)%,([-\d.]+)%\)$/
  const m = s.match(re)
  if (!m) return null
  const h = Number(m[1])
  const se = Number(m[2])
  const v = Number(m[3])
  if ([se, v].some((x) => isNaN(x) || x < 0 || x > 100)) return null
  if (isNaN(h)) return null
  return { h: ((h % 360) + 360) % 360, s: se, v, a: 1 }
}

function parseCmykString(input: string): CMYK | null {
  if (!input) return null
  const s = input.trim().toLowerCase().replace(/\s+/g, '')
  // cmyk(0%,50%,40%,10%)
  const re = /^cmyk\(([-\d.]+)%,([-\d.]+)%,([-\d.]+)%,([-\d.]+)%\)$/
  const m = s.match(re)
  if (!m) return null
  const c = Number(m[1])
  const mC = Number(m[2])
  const y = Number(m[3])
  const k = Number(m[4])
  if ([c, mC, y, k].some((x) => isNaN(x) || x < 0 || x > 100)) return null
  return { c, m: mC, y, k }
}

// ---------- 转换 ----------
function rgbToHexString({ r, g, b, a = 1 }: RGB, withAlpha = false): string {
  const base = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`
  if (!withAlpha) return base
  return `${base}${toHex2(clamp(Math.round(a * 255), 0, 255))}`
}

function rgbToHsl({ r, g, b, a = 1 }: RGB): HSL {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const d = max - min
  let h = 0
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case R:
        h = ((G - B) / d + (G < B ? 6 : 0)) * 60
        break
      case G:
        h = ((B - R) / d + 2) * 60
        break
      case B:
        h = ((R - G) / d + 4) * 60
        break
    }
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100), a }
}

function hslToRgb({ h, s, l, a = 1 }: HSL): RGB {
  const S = clamp(s, 0, 100) / 100
  const L = clamp(l, 0, 100) / 100
  const C = (1 - Math.abs(2 * L - 1)) * S
  const hPrime = (clamp(h, 0, 360) % 360) / 60
  const X = C * (1 - Math.abs((hPrime % 2) - 1))
  let R1 = 0,
    G1 = 0,
    B1 = 0
  if (0 <= hPrime && hPrime < 1) [R1, G1, B1] = [C, X, 0]
  else if (1 <= hPrime && hPrime < 2) [R1, G1, B1] = [X, C, 0]
  else if (2 <= hPrime && hPrime < 3) [R1, G1, B1] = [0, C, X]
  else if (3 <= hPrime && hPrime < 4) [R1, G1, B1] = [0, X, C]
  else if (4 <= hPrime && hPrime < 5) [R1, G1, B1] = [X, 0, C]
  else if (5 <= hPrime && hPrime <= 6) [R1, G1, B1] = [C, 0, X]
  const m = L - C / 2
  return {
    r: Math.round((R1 + m) * 255),
    g: Math.round((G1 + m) * 255),
    b: Math.round((B1 + m) * 255),
    a,
  }
}

function rgbToHsv({ r, g, b, a = 1 }: RGB): HSV {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    switch (max) {
      case R:
        h = (G - B) / d + (G < B ? 6 : 0)
        break
      case G:
        h = (B - R) / d + 2
        break
      case B:
        h = (R - G) / d + 4
        break
    }
    h *= 60
  }
  return { h: round(h), s: round(s * 100), v: round(v * 100), a }
}

function hsvToRgb({ h, s, v, a = 1 }: HSV): RGB {
  const S = clamp(s, 0, 100) / 100
  const V = clamp(v, 0, 100) / 100
  const C = V * S
  const hPrime = (clamp(h, 0, 360) % 360) / 60
  const X = C * (1 - Math.abs((hPrime % 2) - 1))
  let R1 = 0,
    G1 = 0,
    B1 = 0
  if (0 <= hPrime && hPrime < 1) [R1, G1, B1] = [C, X, 0]
  else if (1 <= hPrime && hPrime < 2) [R1, G1, B1] = [X, C, 0]
  else if (2 <= hPrime && hPrime < 3) [R1, G1, B1] = [0, C, X]
  else if (3 <= hPrime && hPrime < 4) [R1, G1, B1] = [0, X, C]
  else if (4 <= hPrime && hPrime < 5) [R1, G1, B1] = [X, 0, C]
  else if (5 <= hPrime && hPrime <= 6) [R1, G1, B1] = [C, 0, X]
  const m = V - C
  return {
    r: Math.round((R1 + m) * 255),
    g: Math.round((G1 + m) * 255),
    b: Math.round((B1 + m) * 255),
    a,
  }
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const K = 1 - Math.max(R, G, B)
  if (K === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const C = (1 - R - K) / (1 - K)
  const M = (1 - G - K) / (1 - K)
  const Y = (1 - B - K) / (1 - K)
  return { c: round(C * 100), m: round(M * 100), y: round(Y * 100), k: round(K * 100) }
}

function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const C = clamp(c, 0, 100) / 100
  const M = clamp(m, 0, 100) / 100
  const Y = clamp(y, 0, 100) / 100
  const K = clamp(k, 0, 100) / 100
  const r = 255 * (1 - C) * (1 - K)
  const g = 255 * (1 - M) * (1 - K)
  const b = 255 * (1 - Y) * (1 - K)
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 1 }
}

// ---------- 字符串化 ----------
const toRgbOrRgbaString = (rgb: RGB) =>
  rgb.a !== undefined && rgb.a !== 1
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(rgb.a, 2)})`
    : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

const toHslOrHslaString = (hsl: HSL) =>
  hsl.a !== undefined && hsl.a !== 1
    ? `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${round(hsl.a, 2)})`
    : `hsl(${round(hsl.h)}deg, ${round(hsl.s)}%, ${round(hsl.l)}%)`

const toHsvString = (hsv: HSV) => `hsv(${round(hsv.h)}deg, ${round(hsv.s)}%, ${round(hsv.v)}%)`
const toCmykString = (cmyk: CMYK) =>
  `cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`

// ---------- 统一入口：先解析为 RGB，再输出目标 ----------
function parseToRgbByType(type: string, value: string): RGB | null {
  switch (type) {
    case 'HEX':
      return parseHexToRgb(value)
    case 'RGB / A':
      return parseRgbString(value)
    case 'HSL / A': {
      const hsl = parseHslString(value)
      return hsl ? hslToRgb(hsl) : null
    }
    case 'HSV / A': {
      const hsv = parseHsvString(value)
      return hsv ? hsvToRgb(hsv) : null
    }
    case 'CMYK / A': {
      const cmyk = parseCmykString(value)
      return cmyk ? cmykToRgb(cmyk) : null
    }
    default:
      return null
  }
}

function formatByTarget(target: string, rgb: RGB): string {
  switch (target) {
    case 'HEX':
      // 输出 HEX：若 a != 1 则输出 #RRGGBBAA
      return rgbToHexString(rgb, rgb.a !== undefined && rgb.a !== 1)
    case 'RGB / A':
      return toRgbOrRgbaString(rgb)
    case 'HSL / A':
      return toHslOrHslaString(rgbToHsl(rgb))
    case 'HSV / A':
      return toHsvString(rgbToHsv(rgb))
    case 'CMYK / A':
      return toCmykString(rgbToCmyk(rgb))
    default:
      return '-'
  }
}

function transformColor(sourceType: string, targetType: string, value: string) {
  const rgb = parseToRgbByType(sourceType, value)
  if (!rgb) return '-'
  // 同源同目标直接规范化输出
  return formatByTarget(targetType, rgb)
}
</script>

<template>
  <div class="w-full container-h flex justify-between gap-20px">
    <div class="flex-1">
      <div v-for="item in mainColorType" :key="item.type" class="p-12px rounded border">
        <div class="mb-8px font-500">{{ item.type }}</div>
        <t-input v-model="item.value" :placeholder="`请输入 ${item.type} 色值`" clearable />
        <div class="mt-12px grid gap-8px">
          <div
            v-for="type in colorType.filter((c) => c !== item.type)"
            :key="type"
            class="text-14px flex items-center gap-8px"
          >
            <div class="text-gray-600">{{ type }}：</div>
            <div class="break-all">{{ transformColor(item.type, type, item.value) }}</div>
          </div>
        </div>
      </div>
    </div>

    <t-color-picker-panel
      v-model="color"
      :recent-colors="[
        '#0052d9',
        '#2ba471',
        '#ed7b2f',
        '#e34d59',
        '#181818',
        'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
        'linear-gradient(45deg, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%)',
        'linear-gradient(120deg, #fcc5e4 0%, #fda34b 15%, #ff7882 35%, #c8699e 52%, #7046aa 71%, #0c1db8 87%, #020f75 100%)',
      ]"
      class="w-420px"
    />
  </div>
</template>

<style scoped></style>
