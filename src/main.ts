import 'uno.css'
import 'jetv-ui/dist/jetv-ui.css'
import './styles/transitionAndTransitionGroup.scss'

import { createPinia } from 'pinia'

import { i18n } from './utils/i18n'
import App from './views/App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

app.mount('#app')
