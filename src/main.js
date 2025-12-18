import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js' // 确保router文件夹和index.js存在

const app = createApp(App)
app.use(router)
app.mount('#app')