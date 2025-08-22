export function withViewTransition<T>(update: () => T | Promise<T>) {
  if (!('startViewTransition' in document)) return Promise.resolve(update())

  const vt = document.startViewTransition(update)
  return vt.finished
}

export type ThemeModel = 'light' | 'dark'

export function applyTheme(model: ThemeModel, useTransition = true) {
  if (typeof document === 'undefined') return
  const runner = () => {
    const html = document.documentElement
    if (model === 'dark') {
      html.setAttribute('theme-eva-01', 'dark')
      html.style.colorScheme = 'dark'
    } else {
      html.setAttribute('theme-eva-01', 'light')
      html.style.colorScheme = 'light'
    }
  }
  return useTransition ? withViewTransition(runner) : Promise.resolve(runner())
}
