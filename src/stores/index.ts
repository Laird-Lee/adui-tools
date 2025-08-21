import { createPersistedState } from 'pinia-plugin-persistedstate'
import type { App } from 'vue'

const store = createPinia()

store.use(
  createPersistedState({
    key: (id) => `__persisted__${id}`,
  }),
)

export function setupStore(app: App<Element>) {
  app.use(store)
}

export { store }
