import { createWebHistory, createRouter } from 'vue-router'
import comMain from '@/pages/user/main/comIndex.vue'
import comMyPage from '@/pages/user/mypage/comIndex.vue'

// 화면을 추가하면 public/pages/<경로>/index.html 도 함께 만든다 (vite.config.js 가 자동 등록)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/user/main', component: comMain },
    { path: '/user/mypage', component: comMyPage },
  ],
})

export default router;
