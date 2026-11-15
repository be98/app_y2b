import { createApp } from 'vue'
import { Quasar, Loading, Notify, Dialog } from 'quasar'
import 'quasar/dist/quasar.css'
import App from './App.vue'

const app = createApp(App)
  .use(Quasar, {
    plugins: { Loading, Notify, Dialog }, 
    config : { loading: { spinnerSize:40, }, },
    });
app.mount('#app');
