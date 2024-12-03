import 'uno.css'

import JetVUI from '@jetv/ui'
import { createPinia } from 'pinia'

import { i18n } from './utils/i18n'
import App from './views/App.vue'

const app = createApp(App)

app.use(createPinia())

app.use(i18n)
app.use(JetVUI)

app.mount('#app')
