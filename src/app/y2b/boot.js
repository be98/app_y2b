// y2b 페이지 공통 시작 — 각 페이지 index.js 는 boot(App) 한 줄
import { createApp } from 'vue'
import { Quasar, Loading, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import 'quasar/dist/quasar.css'
import mitt from 'mitt'
import axios from 'axios'
import store from '@/app/store'
import common from '@/app/common.js'
import '@/app/quasar2.css'
import '@/app/common.css'
import '@/app/app.css'
import './y2b.css'

export default function boot(App) {
  const app = createApp(App).use(Quasar, {
    plugins: { Loading, Notify, Dialog },
    config: {
      brand: { primary: '#cc1f1a' },
      loading: { spinnerSize: 40 },
      notify: { position: 'top', timeout: 2500 },
    },
  }).use(store)
  app.config.globalProperties.axios = axios
  app.config.globalProperties.$emitter = mitt()
  app.config.globalProperties.$c = common
  app.mount('#app')
  return app
}
