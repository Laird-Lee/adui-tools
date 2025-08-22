// view-transition.ts
export function withViewTransition<T>(update: () => T | Promise<T>) {
  // 降级：不支持时直接执行
  if (!('startViewTransition' in document)) return Promise.resolve(update())

  // 支持时：把 DOM 变更放进回调，浏览器记录前后帧
  const vt = document.startViewTransition(update)
  return vt.finished // 可选：等待动画完成
}
