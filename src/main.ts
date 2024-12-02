import 'uno.css'

import JetVUI from 'jetv-ui'
import { i18n } from './utils/i18n'
import App from './views/App.vue'

const app = createApp(App)

app.use(i18n, JetVUI)

app.mount('#app')
