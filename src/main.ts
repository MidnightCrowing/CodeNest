import 'uno.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './views/App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
