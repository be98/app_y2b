<template>
  <div class="main-app">
    <header class="main-hd">
      <div class="main-hd-inner">
        <div class="main-brand">y2b</div>
        <div class="main-user">
          <template v-if="loggedIn">
            <span class="main-name">{{ displayName }} 님</span>
            <q-btn flat dense icon="person" label="마이페이지" @click="$c.goto_page('/user/mypage')" />
            <q-btn flat dense icon="logout" label="로그아웃" @click="doLogout" />
          </template>
          <q-btn v-else unelevated color="primary" label="로그인" :disable="isLoading" @click="startLogin" />
        </div>
      </div>
    </header>

    <main class="main-body">
      <h1>y2b</h1>
      <p class="main-sub">보일러플레이트 메인 화면입니다. 이 영역에 서비스 화면을 채워 넣으세요.</p>
    </main>

    <com-user-login-popup ref="userLoginPopup" />
  </div>
</template>

<script>
import comUserLoginPopup from '@/components/comUserLoginPopup.vue'

export default {
  name: 'MainIndex',
  components: { comUserLoginPopup },
  computed: {
    user() {
      return this.$store.state.user
    },
    isLoading() {
      return this.$store.state.loading.is_loading
    },
    loggedIn() {
      return this.user.user_id > 0
    },
    displayName() {
      return this.user.nick_name || this.user.user_name
    },
  },
  methods: {
    startLogin() {
      this.$refs.userLoginPopup.open_login(() => location.reload())
    },
    // 로그아웃 — 서버 세션 종료 후 새로고침으로 비로그인 상태 반영.
    doLogout() {
      this.$q.loading.show()
      this.$c.io.post('/api/account/user/logout', {}).then((response) => {
        if (response.data && response.data.success) {
          location.reload()
        } else {
          this.$q.loading.hide()
          this.$q.notify({ message: '로그아웃에 실패했어요. 다시 시도해 주세요.', color: 'negative', position: 'top' })
        }
      })
    },
  },
}
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background: #f5f7fa;
  color: #1e293b;
}
.main-hd {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.main-hd-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1080px;
  height: 60px;
  margin: 0 auto;
  padding: 0 16px;
}
.main-brand {
  font-size: 20px;
  font-weight: 800;
}
.main-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.main-name {
  font-size: 14px;
  color: #475569;
}
.main-body {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 16px 48px;
}
.main-body h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.3;
}
.main-sub {
  color: #64748b;
}
</style>
