import 'uno.css'
import 'jetv-ui/dist/jetv-ui.css'

import { i18n } from './utils/i18n'
import App from './views/App.vue'

const app = createApp(App)

app.use(i18n)

app.mount('#app')
