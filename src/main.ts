import '@/styles/normalize.css'
import '@/styles/view-transition.css'
import '@/styles/theme-variables.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import App from './App.vue'

import { setupStore } from '@/stores'
import { setupRouter } from '@/router'

const app = createApp(App)
async function setupApp() {
  setupStore(app)
  await setupRouter(app)
  app.mount('#app')
}

void setupApp()
