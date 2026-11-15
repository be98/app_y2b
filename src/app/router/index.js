import { createWebHistory, createRouter } from 'vue-router'

// y2b 화면은 멀티페이지(public/pages/<경로>/index.html)라 라우터를 쓰지 않는다.
// 한 페이지 안에서 화면을 나눠야 할 때만 여기에 라우트를 추가한다 (계정·관리자 로그인 페이지가 use 하고 있음).
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:any(.*)', component: { render: () => null } }],
})

export default router;
