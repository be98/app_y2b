import { createApp } from 'vue'
import { Quasar, Loading, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import mitts from 'mitt'
import router from '@/app/router';
import store from '@/app/store';
import axios from 'axios';
import common from '@/app/common.js';
import '@/app/quasar2.css';
import '@/app/common.css';
import '@/app/app.css';

const emitter = mitts();
const app = createApp(App)
  .use(Quasar, {
    plugins: { Loading, Notify, Dialog }, 
    config : { loading: { spinnerSize:40, }, },
    })
  .use(router)
  .use(store);
app.config.globalProperties.axios = axios;
app.config.globalProperties.$emitter = emitter; 
app.config.globalProperties.$c = common;

app.mount('#app');
